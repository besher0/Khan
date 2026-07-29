import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const phone = this.normalizePhone(dto.phone);
    const role = dto.role === UserRole.MERCHANT ? UserRole.MERCHANT : UserRole.CUSTOMER;

    const existing = await this.prisma.user.findFirst({
      where: { phone },
    });

    if (existing) {
      throw new BadRequestException('Phone is already registered');
    }

    const user = await this.prisma.user.create({
      data: {
        phone,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role,
        passwordHash: await bcrypt.hash(dto.password, 12),
      },
      select: this.safeUserSelect(),
    });

    return {
      user,
      tokens: await this.signTokens(user.id, user.phone, user.role),
    };
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
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
      tokens: await this.signTokens(user.id, user.phone, user.role),
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET') ?? 'dev-refresh-secret',
      });
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: this.safeUserSelect(),
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return { tokens: await this.signTokens(user.id, user.phone, user.role) };
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async signTokens(userId: string, phone: string, role: UserRole) {
    const payload = { sub: userId, phone, role };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET') ?? 'dev-access-secret',
      expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m',
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET') ?? 'dev-refresh-secret',
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '30d',
    });

    return { accessToken, refreshToken };
  }

  private safeUserSelect() {
    return {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      createdAt: true,
    };
  }

  private normalizePhone(phone: string) {
    return phone.trim().replace(/\s+/g, '');
  }
}
