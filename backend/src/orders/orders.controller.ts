import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../common/types/authenticated-request';
import { CheckoutDto } from './dto';
import { OrdersService } from './orders.service';

@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post('checkout')
  checkout(@CurrentUser() user: AuthenticatedUser, @Body() dto: CheckoutDto) {
    return this.orders.checkout(user.id, dto);
  }

  @Get('my')
  myOrders(@CurrentUser() user: AuthenticatedUser) {
    return this.orders.myOrders(user.id);
  }

  @Get(':id')
  order(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.orders.getOrderForCustomer(user.id, id);
  }
}
