import { Module } from '@nestjs/common';
import { NotificationsModule } from '../notifications/notifications.module';
import { SavedStoresModule } from '../saved-stores/saved-stores.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [NotificationsModule, SavedStoresModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
