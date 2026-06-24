import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthenticatedUser } from '../common/types/authenticated-request';
import {
  CreateCouponDto,
  CreateProductDto,
  CreateReelDto,
  UpdateCouponDto,
  UpdateProductDto,
  UpdateReelDto,
  UpdateStoreDto,
  UpsertStoreDto,
} from './dto';
import { MerchantService } from './merchant.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.MERCHANT)
@Controller('merchant')
export class MerchantController {
  constructor(private readonly merchant: MerchantService) {}

  @Get('store')
  store(@CurrentUser() user: AuthenticatedUser) {
    return this.merchant.getStore(user.id);
  }

  @Post('store')
  createStore(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpsertStoreDto) {
    return this.merchant.createStore(user.id, dto);
  }

  @Patch('store')
  updateStore(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateStoreDto) {
    return this.merchant.updateStore(user.id, dto);
  }

  @Get('products')
  products(@CurrentUser() user: AuthenticatedUser) {
    return this.merchant.products(user.id);
  }

  @Post('products')
  createProduct(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateProductDto) {
    return this.merchant.createProduct(user.id, dto);
  }

  @Patch('products/:id')
  updateProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.merchant.updateProduct(user.id, id, dto);
  }

  @Delete('products/:id')
  archiveProduct(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.merchant.archiveProduct(user.id, id);
  }

  @Get('orders')
  orders(@CurrentUser() user: AuthenticatedUser) {
    return this.merchant.orders(user.id);
  }

  @Get('coupons')
  coupons(@CurrentUser() user: AuthenticatedUser) {
    return this.merchant.coupons(user.id);
  }

  @Post('coupons')
  createCoupon(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCouponDto) {
    return this.merchant.createCoupon(user.id, dto);
  }

  @Patch('coupons/:id')
  updateCoupon(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateCouponDto,
  ) {
    return this.merchant.updateCoupon(user.id, id, dto);
  }

  @Get('reels')
  reels(@CurrentUser() user: AuthenticatedUser) {
    return this.merchant.reels(user.id);
  }

  @Post('reels')
  createReel(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateReelDto) {
    return this.merchant.createReel(user.id, dto);
  }

  @Patch('reels/:id')
  updateReel(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateReelDto,
  ) {
    return this.merchant.updateReel(user.id, id, dto);
  }

  @Get('wallet')
  wallet(@CurrentUser() user: AuthenticatedUser) {
    return this.merchant.wallet(user.id);
  }
}
