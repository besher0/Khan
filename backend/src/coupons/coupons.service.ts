import { Injectable } from '@nestjs/common';
import { CouponStatus, StoreStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  normalizeCouponCode,
  pickCouponForCart,
  validateCouponForOrder,
} from '../common/utils/coupons';

export type CouponValidationResult = {
  valid: boolean;
  message?: string;
  couponId?: string;
  code?: string;
  discount?: number;
  subtotal: number;
  total: number;
};

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Authoritative coupon validation used by the cart preview. Never mutates
   * state: usage counts are only consumed by order checkout.
   * Checkout re-runs the same checks inside the order transaction.
   */
  async validate(userId: string, dto: { code?: string; storeId?: string; subtotal?: number }): Promise<CouponValidationResult> {
    const code = normalizeCouponCode(dto.code ?? '');
    if (!code) {
      return this.fail('الكوبون غير صالح', dto.subtotal);
    }

    // Resolve the cart's actual store when the caller did not send one,
    // so the check uses the same scope logic as checkout.
    let storeId = dto.storeId;
    if (!storeId) {
      const cart = await this.prisma.cart.findUnique({ where: { userId } });
      storeId = cart?.storeId ?? undefined;
    }

    const subtotal = Math.max(0, Math.round(Number(dto.subtotal ?? 0)));
    // Codes are unique per store and among platform coupons, so the same code
    // may exist for several stores: pick the store match first, then platform.
    const candidates = await this.prisma.coupon.findMany({
      where: {
        code,
        ...(storeId ? { OR: [{ storeId }, { storeId: null }] } : {}),
      },
    });
    const coupon = pickCouponForCart(candidates, storeId);

    const result = validateCouponForOrder(coupon, { storeId, subtotal });
    if (!result.ok) {
      return this.fail(result.message, subtotal);
    }

    return {
      valid: true,
      couponId: result.coupon.id,
      code: result.coupon.code,
      discount: result.discount,
      subtotal,
      total: Math.max(0, subtotal - result.discount),
    };
  }

  /**
   * Coupons shown in "كوبوناتي": app/platform coupons (storeId null) plus
   * store coupons from approved stores, each tagged with its scope so the UI
   * tabs ("كوبونات التطبيق" / "كوبونات المتاجر") group them correctly.
   */
  async listForUser(userId: string) {
    const now = new Date();

    const [coupons, cart] = await Promise.all([
      this.prisma.coupon.findMany({
        where: {
          status: { not: CouponStatus.DISABLED },
          OR: [
            { storeId: null },
            { store: { status: StoreStatus.APPROVED } },
          ],
          AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
        },
        include: { store: { select: { id: true, name: true, logoUrl: true } } },
        orderBy: { createdAt: 'desc' },
        take: 60,
      }),
      this.prisma.cart.findUnique({ where: { userId }, select: { storeId: true } }),
    ]);

    return {
      items: coupons.map((coupon) => ({
        ...coupon,
        scope: coupon.storeId ? ('store' as const) : ('platform' as const),
      })),
      cartStoreId: cart?.storeId ?? null,
    };
  }

  private fail(message: string, subtotal?: number): CouponValidationResult {
    return {
      valid: false,
      message,
      discount: 0,
      subtotal: Math.max(0, Math.round(Number(subtotal ?? 0))),
      total: Math.max(0, Math.round(Number(subtotal ?? 0))),
    };
  }
}
