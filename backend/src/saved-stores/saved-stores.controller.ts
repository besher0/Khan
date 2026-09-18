import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../common/types/authenticated-request';
import { SavedStoresService } from './saved-stores.service';

@UseGuards(JwtAuthGuard)
@Controller('saved-stores')
export class SavedStoresController {
  constructor(private readonly savedStores: SavedStoresService) {}

  @Get()
  list(@CurrentUser() user: AuthenticatedUser) {
    return this.savedStores.list(user.id);
  }

  @Post(':storeId')
  add(@CurrentUser() user: AuthenticatedUser, @Param('storeId') storeId: string) {
    return this.savedStores.add(user.id, storeId);
  }

  @Delete(':storeId')
  remove(@CurrentUser() user: AuthenticatedUser, @Param('storeId') storeId: string) {
    return this.savedStores.remove(user.id, storeId);
  }

  @Get(':storeId/status')
  status(@CurrentUser() user: AuthenticatedUser, @Param('storeId') storeId: string) {
    return this.savedStores.isSaved(user.id, storeId);
  }
}
