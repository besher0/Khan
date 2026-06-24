import {
  Body,
  Controller,
  Headers,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../common/types/authenticated-request';
import { InitiateShamCashDto, ShamCashCallbackDto } from './dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly payments: PaymentsService,
    private readonly config: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('sham-cash/initiate')
  initiateShamCash(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: InitiateShamCashDto,
  ) {
    return this.payments.initiateShamCash(user.id, dto.orderId);
  }

  @Post('sham-cash/callback')
  shamCashCallback(
    @Headers('x-sham-cash-secret') secret: string | undefined,
    @Body() dto: ShamCashCallbackDto,
  ) {
    const expected = this.config.get<string>('SHAM_CASH_CALLBACK_SECRET');
    if (expected && secret !== expected) {
      throw new UnauthorizedException('Invalid callback secret');
    }

    return this.payments.applyShamCashCallback(dto);
  }
}
