import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PhoneVerificationPurpose, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { safeUserSelect } from '../common/prisma/safe-user-select';
import {
  LoginDto,
  PasswordRequestOtpDto,
  PasswordResetDto,
  RegisterDto,
  RegisterRequestOtpDto,
  RegisterVerifyOtpDto,
  UpdateProfileDto,
} from './dto';
import { normalizeSyrianPhone } from './phone';
import { TelegramGatewayService } from './telegram-gateway.service';

type RegisterVerificationPayload = {
  firstName: string;
  lastName: string;
  role: Extract<UserRole, 'CUSTOMER' | 'MERCHANT'>;
  passwordHash: string;
};

@Injectable()
export class AuthService {
  private readonly maxOtpAttempts = 5;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly telegram: TelegramGatewayService,
  ) {}

  register(_dto: RegisterDto) {
    throw new BadRequestException('Registration requires Telegram OTP. Use /auth/register/request-otp first.');
  }

  async requestRegisterOtp(dto: RegisterRequestOtpDto) {
    const phone = this.normalizePhone(dto.phone);
    const role = dto.role === UserRole.MERCHANT ? UserRole.MERCHANT : UserRole.CUSTOMER;

    const existing = await this.prisma.user.findFirst({
      where: { phone },
    });

    if (existing) {
      throw new BadRequestException('Phone is already registered');
    }

    const payload: RegisterVerificationPayload = {
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      role,
      passwordHash: await bcrypt.hash(dto.password, 12),
    };

    if (!payload.firstName || !payload.lastName) {
      throw new BadRequestException('First name and last name are required');
    }

    await this.prisma.phoneVerification.updateMany({
      where: {
        phone,
        purpose: PhoneVerificationPurpose.REGISTER,
        consumedAt: null,
      },
      data: { consumedAt: new Date() },
    });

    const telegramRequest = await this.telegram.sendVerificationMessage(
      phone,
      PhoneVerificationPurpose.REGISTER,
    );
    const expiresAt = this.verificationExpiry();

    await this.prisma.phoneVerification.create({
      data: {
        phone,
        purpose: PhoneVerificationPurpose.REGISTER,
        requestId: telegramRequest.request_id,
        payload,
        expiresAt,
      },
    });

    return {
      phone,
      requestId: telegramRequest.request_id,
      expiresAt,
    };
  }

  async verifyRegisterOtp(dto: RegisterVerifyOtpDto) {
    const phone = this.normalizePhone(dto.phone);
    const verification = await this.findOpenVerification(
      phone,
      dto.requestId,
      PhoneVerificationPurpose.REGISTER,
    );

    await this.verifyTelegramCode(verification.id, dto.requestId, dto.code);

    const existing = await this.prisma.user.findUnique({ where: { phone } });
    if (existing) {
      throw new BadRequestException('Phone is already registered');
    }

    const payload = this.parseRegisterPayload(verification.payload);

    const user = await this.prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          phone,
          firstName: payload.firstName,
          lastName: payload.lastName,
          role: payload.role,
          passwordHash: payload.passwordHash,
        },
        select: safeUserSelect,
      });

      await tx.phoneVerification.update({
        where: { id: verification.id },
        data: { consumedAt: new Date() },
      });

      return created;
    });

    return {
      user,
      tokens: await this.signTokens(user.id, user.phone, user.role),
    };
  }

  async requestPasswordOtp(dto: PasswordRequestOtpDto) {
    const phone = this.normalizePhone(dto.phone);
    const user = await this.prisma.user.findUnique({ where: { phone } });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('لا يوجد حساب نشط مرتبط بهذا الرقم');
    }

    await this.prisma.phoneVerification.updateMany({
      where: {
        phone,
        purpose: PhoneVerificationPurpose.RESET_PASSWORD,
        consumedAt: null,
      },
      data: { consumedAt: new Date() },
    });

    const telegramRequest = await this.telegram.sendVerificationMessage(
      phone,
      PhoneVerificationPurpose.RESET_PASSWORD,
    );
    const expiresAt = this.verificationExpiry();

    await this.prisma.phoneVerification.create({
      data: {
        phone,
        purpose: PhoneVerificationPurpose.RESET_PASSWORD,
        requestId: telegramRequest.request_id,
        expiresAt,
      },
    });

    return {
      phone,
      requestId: telegramRequest.request_id,
      expiresAt,
    };
  }

  async resetPassword(dto: PasswordResetDto) {
    const phone = this.normalizePhone(dto.phone);
    const verification = await this.findOpenVerification(
      phone,
      dto.requestId,
      PhoneVerificationPurpose.RESET_PASSWORD,
    );
    const user = await this.prisma.user.findUnique({ where: { phone } });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('لا يوجد حساب نشط مرتبط بهذا الرقم');
    }

    await this.verifyTelegramCode(verification.id, dto.requestId, dto.code);

    const passwordHash = await bcrypt.hash(dto.password, 12);
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { phone },
        data: { passwordHash },
      }),
      this.prisma.phoneVerification.update({
        where: { id: verification.id },
        data: { consumedAt: new Date() },
      }),
    ]);

    return { ok: true };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: this.normalizePhone(dto.phone) },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordOk = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordOk) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return {
      user: {
        id: user.id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        status: user.status,
      },
      tokens: await this.signTokens(user.id, user.phone, user.role),
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(refreshToken, {
        secret: this.getRequiredConfig('JWT_REFRESH_SECRET'),
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: safeUserSelect,
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return { tokens: await this.signTokens(user.id, user.phone, user.role) };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const data: { firstName?: string; lastName?: string; avatarUrl?: string | null } = {};

    if (dto.firstName !== undefined) {
      const firstName = dto.firstName.trim();
      if (!firstName) {
        throw new BadRequestException('First name is required');
      }
      data.firstName = firstName;
    }

    if (dto.lastName !== undefined) {
      const lastName = dto.lastName.trim();
      if (!lastName) {
        throw new BadRequestException('Last name is required');
      }
      data.lastName = lastName;
    }

    if (dto.avatarUrl !== undefined) {
      const avatarUrl = dto.avatarUrl.trim();
      data.avatarUrl = avatarUrl || null;
    }

    if (!Object.keys(data).length) {
      throw new BadRequestException('No profile fields to update');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: safeUserSelect,
    });
  }

  private async signTokens(userId: string, phone: string, role: UserRole) {
    const payload = { sub: userId, phone, role };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.getRequiredConfig('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m',
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.getRequiredConfig('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '30d',
    });

    return { accessToken, refreshToken };
  }

  private normalizePhone(phone: string) {
    return normalizeSyrianPhone(phone);
  }

  private verificationExpiry() {
    const ttlSeconds = Number(this.config.get<string>('TELEGRAM_GATEWAY_TTL_SECONDS') ?? 300);
    const ttl = Number.isFinite(ttlSeconds) ? ttlSeconds : 300;
    return new Date(Date.now() + ttl * 1000);
  }

  private async findOpenVerification(
    phone: string,
    requestId: string,
    purpose: PhoneVerificationPurpose,
  ) {
    const verification = await this.prisma.phoneVerification.findFirst({
      where: {
        phone,
        requestId,
        purpose,
        consumedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verification) {
      throw new BadRequestException('Verification request was not found');
    }

    if (verification.expiresAt.getTime() <= Date.now()) {
      throw new BadRequestException('Verification code has expired');
    }

    if (verification.attemptCount >= this.maxOtpAttempts) {
      throw new BadRequestException('Maximum verification attempts exceeded');
    }

    return verification;
  }

  private async verifyTelegramCode(
    verificationId: string,
    requestId: string,
    code: string,
  ) {
    const status = await this.telegram.checkVerificationStatus(requestId, code);
    const verificationStatus = status.verification_status?.status;

    await this.prisma.phoneVerification.update({
      where: { id: verificationId },
      data: { attemptCount: { increment: 1 } },
    });

    if (verificationStatus !== 'code_valid') {
      throw new BadRequestException('Invalid verification code');
    }
  }

  private parseRegisterPayload(payload: unknown): RegisterVerificationPayload {
    if (!payload || typeof payload !== 'object') {
      throw new BadRequestException('Registration payload is no longer valid');
    }

    const candidate = payload as Partial<RegisterVerificationPayload>;
    if (
      typeof candidate.firstName !== 'string' ||
      typeof candidate.lastName !== 'string' ||
      typeof candidate.passwordHash !== 'string' ||
      ![UserRole.CUSTOMER, UserRole.MERCHANT].includes(candidate.role as Extract<UserRole, 'CUSTOMER' | 'MERCHANT'>)
    ) {
      throw new BadRequestException('Registration payload is no longer valid');
    }

    return candidate as RegisterVerificationPayload;
  }

  private getRequiredConfig(key: string) {
    const value = this.config.get<string>(key);
    if (!value) {
      throw new Error(`Missing required config: ${key}`);
    }
    return value;
  }
}
