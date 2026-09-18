import { Module } from '@nestjs/common';
import { SavedStoresController } from './saved-stores.controller';
import { SavedStoresService } from './saved-stores.service';

@Module({
  controllers: [SavedStoresController],
  providers: [SavedStoresService],
  exports: [SavedStoresService],
})
export class SavedStoresModule {}
