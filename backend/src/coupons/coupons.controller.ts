import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../common/types/authenticated-request';
import { CouponsService } from './coupons.service';
import { ValidateCouponDto } from './dto';

@UseGuards(JwtAuthGuard)
@Controller('coupons')
export class CouponsController {
  constructor(private readonly coupons: CouponsService) {}

  @Post('validate')
  validate(@CurrentUser() user: AuthenticatedUser, @Body() dto: ValidateCouponDto) {
    return this.coupons.validate(user.id, dto);
  }

  @Get('mine')
  mine(@CurrentUser() user: AuthenticatedUser) {
    return this.coupons.listForUser(user.id);
  }
}
