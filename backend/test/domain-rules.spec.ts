import { CouponType } from '@prisma/client';
import { calculateCouponDiscount } from '../src/common/utils/coupons';
import { getCartStoreMismatch } from '../src/common/utils/cart-policy';

describe('domain rules', () => {
  it('rejects mixing products from multiple stores in one cart', () => {
    expect(getCartStoreMismatch('store-a', 'store-b')).toEqual({
      code: 'CART_STORE_MISMATCH',
      message: 'Cart can contain products from one store only',
      currentStoreId: 'store-a',
      incomingStoreId: 'store-b',
    });
    expect(getCartStoreMismatch('store-a', 'store-a')).toBeNull();
    expect(getCartStoreMismatch(null, 'store-a')).toBeNull();
  });

  it('calculates fixed and capped percent coupon discounts', () => {
    expect(
      calculateCouponDiscount(
        {
          type: CouponType.FIXED,
          value: 5000,
          minOrderAmount: null,
          maxDiscountAmount: null,
        } as any,
        3000,
      ),
    ).toBe(3000);

    expect(
      calculateCouponDiscount(
        {
          type: CouponType.PERCENT,
          value: 20,
          minOrderAmount: 10000,
          maxDiscountAmount: 7000,
        } as any,
        50000,
      ),
    ).toBe(7000);
  });
});
