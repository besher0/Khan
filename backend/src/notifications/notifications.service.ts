import { Injectable } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDeviceTokenDto } from './dto';
import { FirebaseNotificationsService } from './firebase-notifications.service';

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Prisma.InputJsonValue;
};

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebase: FirebaseNotificationsService,
  ) {}

  list(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  unreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, readAt: null },
    });
  }

  registerDeviceToken(userId: string, dto: RegisterDeviceTokenDto) {
    return this.prisma.notificationDeviceToken.upsert({
      where: { token: dto.token },
      update: { userId, platform: dto.platform },
      create: { userId, token: dto.token, platform: dto.platform },
    });
  }

  async removeDeviceToken(userId: string, token: string) {
    await this.prisma.notificationDeviceToken.deleteMany({
      where: { userId, token },
    });
    return { ok: true };
  }

  async markRead(userId: string, id: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
    return { ok: true };
  }

  async createAndPush(input: CreateNotificationInput) {
    const notification = await this.prisma.notification.create({ data: input });
    const deviceTokens = await this.prisma.notificationDeviceToken.findMany({
      where: { userId: input.userId },
      select: { token: true },
    });
    const tokens = deviceTokens.map((item) => item.token);

    const result = await this.firebase.sendToTokens(tokens, {
      title: input.title,
      body: input.body,
      data: this.stringifyData(input.data),
    });

    if (result.invalidTokens.length) {
      await this.prisma.notificationDeviceToken.deleteMany({
        where: { token: { in: result.invalidTokens } },
      });
    }

    return notification;
  }

  private stringifyData(data?: Prisma.InputJsonValue): Record<string, string> | undefined {
    if (!data || typeof data !== 'object' || Array.isArray(data)) return undefined;

    return Object.entries(data).reduce<Record<string, string>>((result, [key, value]) => {
      if (value === null || value === undefined) return result;
      result[key] = typeof value === 'string' ? value : JSON.stringify(value);
      return result;
    }, {});
  }
}
