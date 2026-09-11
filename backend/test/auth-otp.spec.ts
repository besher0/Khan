import { BadRequestException } from '@nestjs/common';
import { PhoneVerificationPurpose, UserRole, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../src/auth/auth.service';

const config = {
  get: jest.fn((key: string) => {
    const values: Record<string, string> = {
      JWT_ACCESS_SECRET: 'access-secret',
      JWT_REFRESH_SECRET: 'refresh-secret',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '30d',
      TELEGRAM_GATEWAY_TTL_SECONDS: '300',
    };
    return values[key];
  }),
};

const jwt = {
  signAsync: jest.fn(async () => 'token'),
};

function makePrisma() {
  return {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    phoneVerification: {
      updateMany: jest.fn(),
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(async (callbackOrQueries: any) => {
      if (typeof callbackOrQueries === 'function') {
        return callbackOrQueries({
          user: {
            create: jest.fn(async ({ data }: any) => ({
              id: 'user-1',
              ...data,
              status: UserStatus.ACTIVE,
              createdAt: new Date(),
            })),
          },
          phoneVerification: {
            update: jest.fn(),
          },
        });
      }

      return Promise.all(callbackOrQueries);
    }),
  };
}

function makeService(prisma = makePrisma(), telegramOverrides = {}) {
  const telegram = {
    sendVerificationMessage: jest.fn(async () => ({ request_id: 'tg-request-1', phone_number: '+963999111222' })),
    checkVerificationStatus: jest.fn(async () => ({
      request_id: 'tg-request-1',
      phone_number: '+963999111222',
      verification_status: { status: 'code_valid' },
    })),
    ...telegramOverrides,
  };

  return {
    prisma,
    telegram,
    service: new AuthService(prisma as any, jwt as any, config as any, telegram as any),
  };
}

describe('auth Telegram OTP', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requests registration OTP without creating a user', async () => {
    const { prisma, telegram, service } = makeService();
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.phoneVerification.create.mockResolvedValue({});

    const result = await service.requestRegisterOtp({
      firstName: 'Sara',
      lastName: 'Customer',
      phone: '0999111222',
      password: 'Password123!',
      role: UserRole.CUSTOMER,
    });

    expect(result.phone).toBe('+963999111222');
    expect(telegram.sendVerificationMessage).toHaveBeenCalledWith('+963999111222', PhoneVerificationPurpose.REGISTER);
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.phoneVerification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          phone: '+963999111222',
          purpose: PhoneVerificationPurpose.REGISTER,
          requestId: 'tg-request-1',
          payload: expect.objectContaining({
            firstName: 'Sara',
            lastName: 'Customer',
            role: UserRole.CUSTOMER,
            passwordHash: expect.any(String),
          }),
        }),
      }),
    );
  });

  it('creates the user only after Telegram confirms a valid registration code', async () => {
    const { prisma, service } = makeService();
    prisma.phoneVerification.findFirst.mockResolvedValue({
      id: 'verification-1',
      phone: '+963999111222',
      purpose: PhoneVerificationPurpose.REGISTER,
      requestId: 'tg-request-1',
      expiresAt: new Date(Date.now() + 60_000),
      consumedAt: null,
      attemptCount: 0,
      payload: {
        firstName: 'Sara',
        lastName: 'Customer',
        role: UserRole.CUSTOMER,
        passwordHash: await bcrypt.hash('Password123!', 12),
      },
    });
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.phoneVerification.update.mockResolvedValue({});

    const result = await service.verifyRegisterOtp({
      phone: '+963999111222',
      requestId: 'tg-request-1',
      code: '123456',
    });

    expect(result.user.phone).toBe('+963999111222');
    expect(result.tokens).toEqual({ accessToken: 'token', refreshToken: 'token' });
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('rejects invalid Telegram registration codes', async () => {
    const { prisma, service } = makeService(makePrisma(), {
      checkVerificationStatus: jest.fn(async () => ({
        request_id: 'tg-request-1',
        phone_number: '+963999111222',
        verification_status: { status: 'code_invalid' },
      })),
    });
    prisma.phoneVerification.findFirst.mockResolvedValue({
      id: 'verification-1',
      expiresAt: new Date(Date.now() + 60_000),
      attemptCount: 0,
      payload: {},
    });
    prisma.phoneVerification.update.mockResolvedValue({});

    await expect(
      service.verifyRegisterOtp({
        phone: '0999111222',
        requestId: 'tg-request-1',
        code: '000000',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('resets password after a valid Telegram reset code', async () => {
    const { prisma, service } = makeService();
    prisma.phoneVerification.findFirst.mockResolvedValue({
      id: 'verification-1',
      expiresAt: new Date(Date.now() + 60_000),
      attemptCount: 0,
    });
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      phone: '+963999111222',
      status: UserStatus.ACTIVE,
    });
    prisma.user.update.mockResolvedValue({});
    prisma.phoneVerification.update.mockResolvedValue({});

    await expect(
      service.resetPassword({
        phone: '0999111222',
        requestId: 'tg-request-1',
        code: '123456',
        password: 'NewPassword123!',
      }),
    ).resolves.toEqual({ ok: true });
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { phone: '+963999111222' },
        data: { passwordHash: expect.any(String) },
      }),
    );
  });

  it('keeps login on phone and password', async () => {
    const { prisma, service } = makeService();
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      phone: '+963999111222',
      firstName: 'Sara',
      lastName: 'Customer',
      role: UserRole.CUSTOMER,
      status: UserStatus.ACTIVE,
      passwordHash: await bcrypt.hash('Password123!', 12),
    });

    const result = await service.login({ phone: '0999111222', password: 'Password123!' });

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { phone: '+963999111222' } });
    expect(result.user).not.toHaveProperty('email');
  });
});
