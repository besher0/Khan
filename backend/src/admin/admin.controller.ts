import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthenticatedUser } from '../common/types/authenticated-request';
import { AdminService } from './admin.service';
import { PageQueryDto } from '../common/dto/page-query.dto';
import {
  AssignStorePackageDto,
  CreateStorePackageDto,
  ConfirmPaymentDto,
  CreateAdminStoreDto,
  CreateCategoryDto,
  CreateDeliveryEventDto,
  CreateHomeBannerDto,
  UpdateOrderStatusDto,
  UpdateStoreStatusDto,
  UpdateStorePackageDto,
  UpdateCategoryDto,
  UpdateHomeBannerDto,
  UpdateUserStatusDto,
} from './dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.OPS)
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('stores')
  stores() {
    return this.admin.stores();
  }

  @Get('packages')
  packages() {
    return this.admin.packages();
  }

  @Get('products')
  products() {
    return this.admin.products();
  }

  @Get('banners')
  banners() {
    return this.admin.banners();
  }

  @Post('banners')
  @Roles(UserRole.ADMIN)
  createBanner(@Body() dto: CreateHomeBannerDto) {
    return this.admin.createBanner(dto);
  }

  @Patch('banners/:id')
  @Roles(UserRole.ADMIN)
  updateBanner(@Param('id') id: string, @Body() dto: UpdateHomeBannerDto) {
    return this.admin.updateBanner(id, dto);
  }

  @Post('packages')
  @Roles(UserRole.ADMIN)
  createPackage(@Body() dto: CreateStorePackageDto) {
    return this.admin.createPackage(dto);
  }

  @Patch('packages/:id')
  @Roles(UserRole.ADMIN)
  updatePackage(@Param('id') id: string, @Body() dto: UpdateStorePackageDto) {
    return this.admin.updatePackage(id, dto);
  }

  @Post('stores')
  @Roles(UserRole.ADMIN)
  createStore(@Body() dto: CreateAdminStoreDto) {
    return this.admin.createStore(dto);
  }

  @Post('stores/:id/subscription')
  @Roles(UserRole.ADMIN)
  assignStorePackage(@Param('id') id: string, @Body() dto: AssignStorePackageDto) {
    return this.admin.assignStorePackage(id, dto.packageId);
  }

  @Post('categories')
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.admin.createCategory(dto);
  }

  @Patch('categories/:id')
  updateCategory(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.admin.updateCategory(id, dto);
  }

  @Patch('stores/:id/status')
  updateStoreStatus(@Param('id') id: string, @Body() dto: UpdateStoreStatusDto) {
    return this.admin.updateStoreStatus(id, dto.status);
  }

  @Get('orders')
  orders(@Query() query: PageQueryDto) {
    return this.admin.orders(query);
  }

  @Patch('orders/:id/status')
  updateOrderStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.admin.updateOrderStatus(user.id, id, dto);
  }

  @Get('payments')
  payments(@Query() query: PageQueryDto) {
    return this.admin.payments(query);
  }

  @Patch('payments/:id/confirm')
  confirmPayment(@Param('id') id: string, @Body() dto: ConfirmPaymentDto) {
    return this.admin.confirmPayment(id, dto);
  }

  @Get('delivery-events')
  deliveryEvents() {
    return this.admin.deliveryEvents();
  }

  @Post('delivery-events')
  createDeliveryEvent(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateDeliveryEventDto,
  ) {
    return this.admin.createDeliveryEvent(user.id, dto);
  }

  @Get('users')
  users(@Query() query: PageQueryDto) {
    return this.admin.users(query);
  }

  @Patch('users/:id/status')
  updateUserStatus(@Param('id') id: string, @Body() dto: UpdateUserStatusDto) {
    return this.admin.updateUserStatus(id, dto.status);
  }

  @Get('reviews')
  reviews(@Query() query: PageQueryDto) {
    return this.admin.reviews(query);
  }

  @Patch('reviews/:id/approve')
  approveReview(@Param('id') id: string) {
    return this.admin.reviewStatus(id, 'APPROVED');
  }

  @Patch('reviews/:id/reject')
  rejectReview(@Param('id') id: string) {
    return this.admin.reviewStatus(id, 'REJECTED');
  }
}
