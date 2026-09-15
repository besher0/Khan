import { UserRole } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterRequestOtpDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @MinLength(6)
  phone: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: typeof UserRole.CUSTOMER | typeof UserRole.MERCHANT;
}

export class RegisterVerifyOtpDto {
  @IsString()
  phone: string;

  @IsString()
  requestId: string;

  @IsString()
  @Matches(/^\d{4,8}$/)
  code: string;
}

export class RegisterDto extends RegisterRequestOtpDto {}

export class LoginDto {
  @IsString()
  @MinLength(6)
  phone: string;

  @IsString()
  password: string;
}

export class RefreshDto {
  @IsString()
  refreshToken: string;
}

export class PasswordRequestOtpDto {
  @IsString()
  @MinLength(6)
  phone: string;
}

export class PasswordResetDto {
  @IsString()
  phone: string;

  @IsString()
  requestId: string;

  @IsString()
  @Matches(/^\d{4,8}$/)
  code: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
