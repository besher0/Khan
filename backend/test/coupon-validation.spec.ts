import { CouponStatus, CouponType } from '@prisma/client';
import {
  calculateCouponDiscount,
  couponLifecycle,
  couponScope,
  couponInvalidMessage,
  pickCouponForCart,
  validateCouponForOrder,
} from '../src/common/utils/coupons';

const baseCoupon = {
  id: 'coupon-1',
  storeId: 'store-1',
  code: 'SAVE10',
  type: CouponType.FIXED,
  value: 10000,
  minOrderAmount: null,
  maxDiscountAmount: null,
  startsAt: null,
  endsAt: null,
  usageLimit: null,
  usedCount: 0,
  status: CouponStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
} as any;

describe('coupon validation', () => {
  it('accepts a valid store coupon for the matching store', () => {
    const result = validateCouponForOrder(baseCoupon, { storeId: 'store-1', subtotal: 50000 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.discount).toBe(10000);
  });

  it('rejects a store coupon used with another store', () => {
    const result = validateCouponForOrder(baseCoupon, { storeId: 'store-2', subtotal: 50000 });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('WRONG_STORE');
      expect(result.message).toContain('المتجر');
    }
  });

  it('rejects expired coupons in Arabic', () => {
    const result = validateCouponForOrder(
      { ...baseCoupon, endsAt: new Date(Date.now() - 1000) },
      { storeId: 'store-1', subtotal: 50000 },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toBe('انتهت صلاحية هذا الكوبون');
  });

  it('rejects coupons that have not started', () => {
    const result = validateCouponForOrder(
      { ...baseCoupon, startsAt: new Date(Date.now() + 60_000) },
      { storeId: 'store-1', subtotal: 50000 },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('NOT_STARTED');
  });

  it('rejects disabled coupons', () => {
    const result = validateCouponForOrder(
      { ...baseCoupon, status: CouponStatus.DISABLED },
      { storeId: 'store-1', subtotal: 50000 },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('DISABLED');
  });

  it('enforces usage limit as the used state', () => {
    const result = validateCouponForOrder(
      { ...baseCoupon, usageLimit: 5, usedCount: 5 },
      { storeId: 'store-1', subtotal: 50000 },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('USAGE_LIMIT');
      expect(result.message).toBe('تم استخدام هذا الكوبون');
    }
  });

  it('enforces the minimum order amount with an Arabic message', () => {
    const result = validateCouponForOrder(
      { ...baseCoupon, minOrderAmount: 100000 },
      { storeId: 'store-1', subtotal: 80000 },
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toBe('MIN_ORDER');
      expect(result.message).toContain('100.000');
    }
  });

  it('rejects unknown coupon codes', () => {
    const result = validateCouponForOrder(null, { storeId: 'store-1', subtotal: 50000 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toBe('الكوبون غير صالح');
  });

  it('accepts a platform coupon (storeId null) in any store', () => {
    const platform = { ...baseCoupon, storeId: null };
    expect(validateCouponForOrder(platform, { storeId: 'store-1', subtotal: 50000 }).ok).toBe(true);
    expect(validateCouponForOrder(platform, { storeId: 'store-2', subtotal: 50000 }).ok).toBe(true);
    expect(validateCouponForOrder(platform, { storeId: undefined, subtotal: 50000 }).ok).toBe(true);
  });

  it('keeps store coupons restricted to their own store even beside platform ones', () => {
    const storeCoupon = { ...baseCoupon, storeId: 'store-1' };
    const wrong = validateCouponForOrder(storeCoupon, { storeId: 'store-2', subtotal: 50000 });
    expect(wrong.ok).toBe(false);
    if (!wrong.ok) expect(wrong.reason).toBe('WRONG_STORE');
  });

  it('caps percent coupons at maxDiscountAmount and subtotal', () => {
    const percent = {
      ...baseCoupon,
      type: CouponType.PERCENT,
      value: 50,
      maxDiscountAmount: 7000,
    };
    const result = validateCouponForOrder(percent, { storeId: 'store-1', subtotal: 50000 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.discount).toBe(7000);

    const cappedBySubtotal = validateCouponForOrder({ ...baseCoupon, value: 90000 }, { storeId: 'store-1', subtotal: 30000 });
    expect(cappedBySubtotal.ok).toBe(true);
    if (cappedBySubtotal.ok) expect(cappedBySubtotal.discount).toBe(30000);
  });

  it('calculateCouponDiscount keeps legacy behavior for min order', () => {
    expect(
      calculateCouponDiscount({ ...baseCoupon, minOrderAmount: 100000 }, 50000),
    ).toBe(0);
  });
});

describe('coupon helpers', () => {
  it('classifies store vs platform scope', () => {
    expect(couponScope({ storeId: 'store-1' })).toBe('store');
    expect(couponScope({ storeId: null })).toBe('platform');
  });

  it('picks the platform coupon when the cart store has no own match', () => {
    const platform = { ...baseCoupon, id: 'p', code: 'APP', storeId: null };
    expect(pickCouponForCart([platform], 'store-2')?.id).toBe('p');
    expect(pickCouponForCart([platform], null)?.id).toBe('p');
  });

  it('computes lifecycle states', () => {
    expect(couponLifecycle(baseCoupon)).toBe('active');
    expect(couponLifecycle({ ...baseCoupon, status: CouponStatus.DISABLED })).toBe('disabled');
    expect(couponLifecycle({ ...baseCoupon, endsAt: new Date(Date.now() - 1000) })).toBe('expired');
    expect(couponLifecycle({ ...baseCoupon, startsAt: new Date(Date.now() + 1000) })).toBe('upcoming');
    expect(couponLifecycle({ ...baseCoupon, usageLimit: 1, usedCount: 1 })).toBe('used');
  });

  it('prefers a matching store coupon then falls back to platform', () => {
    const storeCoupon = { ...baseCoupon, id: 's', code: 'STORE', storeId: 'store-1' };
    const otherStoreCoupon = { ...baseCoupon, id: 'o', code: 'OTHER', storeId: 'store-2' };
    const platformCoupon = { ...baseCoupon, id: 'p', code: 'APP', storeId: null };

    expect(pickCouponForCart([otherStoreCoupon, storeCoupon], 'store-1')?.id).toBe('s');
    expect(pickCouponForCart([otherStoreCoupon, platformCoupon], 'store-9')?.id).toBe('p');
    expect(pickCouponForCart([otherStoreCoupon], 'store-1')).toBeNull();
  });

  it('formats the minimum-order message with dot thousands separators', () => {
    expect(couponInvalidMessage('MIN_ORDER', 100000)).toContain('100.000 ل.س');
  });
});
