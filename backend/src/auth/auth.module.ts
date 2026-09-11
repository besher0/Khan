import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TelegramGatewayService } from './telegram-gateway.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, TelegramGatewayService],
})
export class AuthModule {}
