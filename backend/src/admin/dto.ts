import {
  DeliveryEventSource,
  OrderStatus,
  PaymentStatus,
  StoreStatus,
  UserStatus,
} from '@prisma/client';
import {
  IsEnum,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateAdminStoreDto {
  @IsString()
  ownerFirstName: string;

  @IsString()
  ownerLastName: string;

  @IsString()
  @MinLength(6)
  ownerPhone: string;

  @IsString()
  @MinLength(8)
  ownerPassword: string;

  @IsString()
  storeName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @IsOptional()
  @IsString()
  openingTime?: string;

  @IsOptional()
  @IsString()
  closingTime?: string;

  @IsString()
  packageId: string;
}

export class AssignStorePackageDto {
  @IsString()
  packageId: string;
}

export class CreateStorePackageDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsInt()
  @Min(1)
  durationDays: number;

  @IsInt()
  @Min(0)
  maxProducts: number;

  @IsInt()
  @Min(0)
  maxReels: number;

  @IsInt()
  @Min(0)
  maxCoupons: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateStorePackageDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationDays?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxProducts?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxReels?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxCoupons?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

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
