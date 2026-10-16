import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { AppConfig } from '../config/app-config.service';
import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { RefreshDto, RequestOtpDto, VerifyOtpDto } from './dto/auth.dto';
import { clearRefreshCookie, readRefreshToken, setRefreshCookie } from './refresh-cookie';

@ApiTags('auth')
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: AppConfig,
  ) {}

  @Post('otp/request')
  @HttpCode(HttpStatus.OK)
  requestOtp(@Body() dto: RequestOtpDto) {
    return this.auth.requestOtp(dto.phone);
  }

  @Post('otp/verify')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.auth.verifyOtp(
      dto.requestId,
      dto.otp,
      dto.clientType,
      req.headers['user-agent'],
    );
    const { refreshToken, refreshTokenExpiresAt, ...rest } = result;
    if (dto.clientType === 'WEB') {
      setRefreshCookie(res, refreshToken, refreshTokenExpiresAt, this.config.isProduction);
      return rest;
    }
    return { ...rest, refreshToken, refreshTokenExpiresAt };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() dto: RefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = readRefreshToken(req, dto.refreshToken);
    if (!token) {
      throw new AppException(
        ErrorCode.REFRESH_TOKEN_INVALID,
        'No session found',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const { refreshToken, refreshTokenExpiresAt, clientType, ...rest } =
      await this.auth.refresh(token);
    if (clientType === 'WEB') {
      setRefreshCookie(res, refreshToken, refreshTokenExpiresAt, this.config.isProduction);
      return rest;
    }
    return { ...rest, refreshToken, refreshTokenExpiresAt };
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Body() dto: RefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.auth.logout(readRefreshToken(req, dto.refreshToken));
    clearRefreshCookie(res, this.config.isProduction);
  }
}
