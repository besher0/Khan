import { Coupon, CouponStatus, CouponType } from '@prisma/client';

export type CouponInvalidReason =
  | 'NOT_FOUND'
  | 'WRONG_STORE'
  | 'DISABLED'
  | 'EXPIRED'
  | 'NOT_STARTED'
  | 'USAGE_LIMIT'
  | 'MIN_ORDER';

export type CouponScope = 'platform' | 'store';

/** Structural coupon shape tolerant of platform coupons (storeId: null). */
export type CouponLike = {
  storeId: string | null;
};

export type CouponLifecycle = 'active' | 'upcoming' | 'used' | 'expired' | 'disabled';

export type CouponCheck =
  | { ok: true; coupon: Coupon; discount: number }
  | { ok: false; reason: CouponInvalidReason; message: string };

export function couponScope(coupon: CouponLike): CouponScope {
  return coupon.storeId ? 'store' : 'platform';
}

export function couponLifecycle(
  coupon: Pick<Coupon, 'status' | 'startsAt' | 'endsAt' | 'usageLimit' | 'usedCount'>,
  now = new Date(),
): CouponLifecycle {
  if (coupon.status === CouponStatus.DISABLED) return 'disabled';
  if (coupon.startsAt && coupon.startsAt.getTime() > now.getTime()) return 'upcoming';
  if (coupon.endsAt && coupon.endsAt.getTime() < now.getTime()) return 'expired';
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) return 'used';
  if (coupon.status === CouponStatus.EXPIRED) return 'expired';
  return 'active';
}

export function couponInvalidMessage(reason: CouponInvalidReason, minOrderAmount?: number) {
  switch (reason) {
    case 'NOT_FOUND':
      return 'الكوبون غير صالح';
    case 'WRONG_STORE':
      return 'هذا الكوبون غير صالح لهذا المتجر';
    case 'DISABLED':
      return 'الكوبون غير صالح';
    case 'EXPIRED':
      return 'انتهت صلاحية هذا الكوبون';
    case 'NOT_STARTED':
      return 'هذا الكوبون لم يبدأ بعد';
    case 'USAGE_LIMIT':
      return 'تم استخدام هذا الكوبون';
    case 'MIN_ORDER':
      return `الحد الأدنى للطلب لاستخدام هذا الكوبون هو ${(minOrderAmount ?? 0).toLocaleString('en-US').replace(/,/g, '.')} ل.س`;
    default:
      return 'الكوبون غير صالح';
  }
}

export function calculateCouponDiscount(coupon: Coupon | null, subtotal: number) {
  if (!coupon) return 0;
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) return 0;

  const raw =
    coupon.type === CouponType.PERCENT
      ? Math.floor((subtotal * coupon.value) / 100)
      : coupon.value;

  const capped = coupon.maxDiscountAmount ? Math.min(raw, coupon.maxDiscountAmount) : raw;
  return Math.max(0, Math.min(capped, subtotal));
}

/**
 * Picks the coupon that applies to a cart:
 * 1. A store coupon bound to the cart's store.
 * 2. A platform coupon (storeId === null).
 * Returns null when only coupons for other stores match.
 */
export function pickCouponForCart<T extends Coupon>(candidates: T[], storeId?: string | null): T | null {
  if (!candidates.length) return null;

  if (storeId) {
    const storeMatch = candidates.find((coupon) => coupon.storeId === storeId);
    if (storeMatch) return storeMatch;
  }

  const platformMatch = candidates.find((coupon) => !coupon.storeId);
  if (platformMatch) return platformMatch;

  return null;
}

/**
 * Single source of truth for coupon validity. Used by cart preview validation
 * and again inside order checkout so the backend is always authoritative.
 */
export function validateCouponForOrder(
  coupon: Coupon | null | undefined,
  options: { storeId?: string | null; subtotal: number; now?: Date },
): CouponCheck {
  const now = options.now ?? new Date();
  const subtotal = Math.max(0, Math.round(options.subtotal));

  if (!coupon) {
    return { ok: false, reason: 'NOT_FOUND', message: couponInvalidMessage('NOT_FOUND') };
  }

  const scopedToStore = Boolean(coupon.storeId);
  if (scopedToStore && (!options.storeId || coupon.storeId !== options.storeId)) {
    return { ok: false, reason: 'WRONG_STORE', message: couponInvalidMessage('WRONG_STORE') };
  }

  if (coupon.status === CouponStatus.DISABLED) {
    return { ok: false, reason: 'DISABLED', message: couponInvalidMessage('DISABLED') };
  }

  if (coupon.startsAt && coupon.startsAt.getTime() > now.getTime()) {
    return { ok: false, reason: 'NOT_STARTED', message: couponInvalidMessage('NOT_STARTED') };
  }

  if (coupon.endsAt && coupon.endsAt.getTime() < now.getTime()) {
    return { ok: false, reason: 'EXPIRED', message: couponInvalidMessage('EXPIRED') };
  }

  if (coupon.status === CouponStatus.EXPIRED) {
    return { ok: false, reason: 'EXPIRED', message: couponInvalidMessage('EXPIRED') };
  }

  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { ok: false, reason: 'USAGE_LIMIT', message: couponInvalidMessage('USAGE_LIMIT') };
  }

  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return {
      ok: false,
      reason: 'MIN_ORDER',
      message: couponInvalidMessage('MIN_ORDER', coupon.minOrderAmount),
    };
  }

  return { ok: true, coupon, discount: calculateCouponDiscount(coupon, subtotal) };
}

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase();
}
