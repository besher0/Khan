import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProductStatus } from '@prisma/client';
import { getCartStoreMismatch } from '../common/utils/cart-policy';
import { PrismaService } from '../prisma/prisma.service';
import { AddCartItemDto } from './dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    const cart = await this.findOrCreateCart(userId);
    return this.decorateCart(cart.id);
  }

  async addItem(userId: string, dto: AddCartItemDto) {
    const product = await this.prisma.product.findFirst({
      where: { id: dto.productId, status: ProductStatus.ACTIVE },
      include: { store: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (product.stock < dto.quantity) {
      throw new BadRequestException('Not enough stock');
    }

    const cart = await this.findOrCreateCart(userId);
    const mismatch = getCartStoreMismatch(cart.storeId, product.storeId);
    if (mismatch) {
      throw new ConflictException(mismatch);
    }

    await this.prisma.$transaction(async (tx) => {
      if (!cart.storeId) {
        await tx.cart.update({
          where: { id: cart.id },
          data: { storeId: product.storeId },
        });
      }

      const existing = await tx.cartItem.findUnique({
        where: { cartId_productId: { cartId: cart.id, productId: product.id } },
      });

      const nextQuantity = (existing?.quantity ?? 0) + dto.quantity;
      if (nextQuantity > product.stock) {
        throw new BadRequestException('Not enough stock');
      }

      if (existing) {
        await tx.cartItem.update({
          where: { id: existing.id },
          data: { quantity: nextQuantity },
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId: product.id,
            quantity: dto.quantity,
          },
        });
      }
    });

    return this.decorateCart(cart.id);
  }

  async updateItem(userId: string, itemId: string, quantity: number) {
    const cart = await this.findOrCreateCart(userId);
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
      include: { product: true },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    if (quantity <= 0) {
      return this.removeItem(userId, itemId);
    }

    if (quantity > item.product.stock) {
      throw new BadRequestException('Not enough stock');
    }

    await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return this.decorateCart(cart.id);
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await this.findOrCreateCart(userId);
    const item = await this.prisma.cartItem.findFirst({
      where: { id: itemId, cartId: cart.id },
    });

    if (!item) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({ where: { id: item.id } });
    await this.resetStoreIfEmpty(cart.id);

    return this.decorateCart(cart.id);
  }

  async clearCart(cartId: string) {
    await this.prisma.cartItem.deleteMany({ where: { cartId } });
    return this.prisma.cart.update({
      where: { id: cartId },
      data: { storeId: null },
    });
  }

  private async findOrCreateCart(userId: string) {
    return this.prisma.cart.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  private async resetStoreIfEmpty(cartId: string) {
    const remaining = await this.prisma.cartItem.count({ where: { cartId } });
    if (remaining === 0) {
      await this.prisma.cart.update({ where: { id: cartId }, data: { storeId: null } });
    }
  }

  private async decorateCart(cartId: string) {
    const cart = await this.prisma.cart.findUniqueOrThrow({
      where: { id: cartId },
      include: {
        store: true,
        items: {
          include: {
            product: {
              include: {
                store: true,
                images: { orderBy: { position: 'asc' } },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    const subtotal = cart.items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    );

    return {
      ...cart,
      totals: {
        subtotal,
        deliveryFee: 0,
        discountTotal: 0,
        total: subtotal,
      },
    };
  }
}
