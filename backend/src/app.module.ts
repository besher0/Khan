import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AddressesModule } from './addresses/addresses.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { CatalogModule } from './catalog/catalog.module';
import { CouponsModule } from './coupons/coupons.module';
import { MerchantModule } from './merchant/merchant.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReviewsModule } from './reviews/reviews.module';
import { SavedStoresModule } from './saved-stores/saved-stores.module';
import { SecurityModule } from './common/security.module';
import { FavoritesModule } from './favorites/favorites.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    SecurityModule,
    AuthModule,
    CatalogModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    MerchantModule,
    AdminModule,
    ReviewsModule,
    SavedStoresModule,
    FavoritesModule,
    NotificationsModule,
    UploadsModule,
    AddressesModule,
    CouponsModule,
  ],
})
export class AppModule {}
