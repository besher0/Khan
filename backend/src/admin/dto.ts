import {
  DeliveryEventSource,
  OrderStatus,
  PaymentStatus,
  StoreStatus,
  UserStatus,
} from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateStoreStatusDto {
  @IsEnum(StoreStatus)
  status: StoreStatus;
}

export class UpdateUserStatusDto {
  @IsEnum(UserStatus)
  status: UserStatus;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  note?: string;
}

export class ConfirmPaymentDto {
  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsOptional()
  @IsString()
  transactionReference?: string;
}

export class CreateDeliveryEventDto {
  @IsString()
  orderId: string;

  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsEnum(DeliveryEventSource)
  source?: DeliveryEventSource;
}
