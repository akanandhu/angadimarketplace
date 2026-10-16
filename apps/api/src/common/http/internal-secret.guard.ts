import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AppConfig } from '../../config/app-config.service';
import { AppException } from '../errors/app.exception';
import { ErrorCode } from '../errors/error-codes';
import { safeEqual } from '../utils/crypto';

export const INTERNAL_SECRET_HEADER = 'x-internal-secret';

/** Protects service-to-service callbacks (e.g. the image processor). */
@Injectable()
export class InternalSecretGuard implements CanActivate {
  constructor(private readonly config: AppConfig) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const provided = request.header(INTERNAL_SECRET_HEADER) ?? '';
    if (!safeEqual(provided, this.config.get('INTERNAL_API_SECRET'))) {
      throw new AppException(
        ErrorCode.UNAUTHORIZED,
        'Invalid internal secret',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return true;
  }
}
