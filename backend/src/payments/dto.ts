import { PaymentStatus, Prisma } from '@prisma/client';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

export class InitiateShamCashDto {
  @IsString()
  orderId: string;
}

export class ShamCashCallbackDto {
  @IsString()
  providerReference: string;

  @IsEnum(PaymentStatus)
  status: PaymentStatus;

  @IsOptional()
  @IsString()
  transactionReference?: string;

  @IsOptional()
  @IsObject()
  payload?: Prisma.InputJsonObject;
}
