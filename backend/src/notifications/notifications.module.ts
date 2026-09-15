import { Module } from '@nestjs/common';
import { FirebaseNotificationsService } from './firebase-notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

@Module({
  controllers: [NotificationsController],
  providers: [FirebaseNotificationsService, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
