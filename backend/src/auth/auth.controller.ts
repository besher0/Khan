import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  PasswordRequestOtpDto,
  PasswordResetDto,
  RefreshDto,
  RegisterDto,
  RegisterRequestOtpDto,
  RegisterVerifyOtpDto,
} from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('register/request-otp')
  requestRegisterOtp(@Body() dto: RegisterRequestOtpDto) {
    return this.auth.requestRegisterOtp(dto);
  }

  @Post('register/verify-otp')
  verifyRegisterOtp(@Body() dto: RegisterVerifyOtpDto) {
    return this.auth.verifyRegisterOtp(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post('password/request-otp')
  requestPasswordOtp(@Body() dto: PasswordRequestOtpDto) {
    return this.auth.requestPasswordOtp(dto);
  }

  @Post('password/reset')
  resetPassword(@Body() dto: PasswordResetDto) {
    return this.auth.resetPassword(dto);
  }
}
