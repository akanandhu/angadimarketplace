import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AppException } from '../../common/errors/app.exception';
import { ErrorCode } from '../../common/errors/error-codes';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthUser } from '../auth-user';

/** Re-checks the role in the database so revoked admins lose access immediately. */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const user: AuthUser | undefined = context.switchToHttp().getRequest().user;
    const record = user
      ? await this.prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, status: true },
        })
      : null;
    if (record?.role !== 'ADMIN' || record.status !== 'ACTIVE') {
      throw AppException.forbidden(ErrorCode.FORBIDDEN, 'Admin access required');
    }
    return true;
  }
}
