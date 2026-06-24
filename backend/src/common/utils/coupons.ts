import { Coupon, CouponType } from '@prisma/client';

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
