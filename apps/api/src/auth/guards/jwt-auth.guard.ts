import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AppException } from '../../common/errors/app.exception';
import { ErrorCode } from '../../common/errors/error-codes';
import { AccessTokenService } from '../access-token.service';
import { AuthUser } from '../auth-user';
import { OPTIONAL_AUTH_KEY } from '../decorators/optional-auth.decorator';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/** Global guard: every route needs a bearer token unless marked @Public/@OptionalAuth. */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokens: AccessTokenService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const flag = (key: string) =>
      this.reflector.getAllAndOverride<boolean>(key, [context.getHandler(), context.getClass()]);
    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const token = this.extract(request);
    const user = token ? this.tokens.verify(token) : null;

    if (user) request.user = user;
    if (flag(IS_PUBLIC_KEY) || flag(OPTIONAL_AUTH_KEY)) return true;
    if (!user) {
      throw new AppException(ErrorCode.UNAUTHORIZED, 'Login required', HttpStatus.UNAUTHORIZED);
    }
    return true;
  }

  private extract(request: Request): string | null {
    const [scheme, token] = (request.headers.authorization ?? '').split(' ');
    return scheme === 'Bearer' && token ? token : null;
  }
}
