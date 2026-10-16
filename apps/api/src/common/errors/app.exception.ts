import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-codes';

/** Domain error carrying a stable machine-readable code for clients. */
export class AppException extends HttpException {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly details: unknown = null,
  ) {
    super({ code, message, details }, status);
  }

  static notFound(code: ErrorCode, message: string) {
    return new AppException(code, message, HttpStatus.NOT_FOUND);
  }

  static forbidden(code: ErrorCode, message: string) {
    return new AppException(code, message, HttpStatus.FORBIDDEN);
  }

  static conflict(code: ErrorCode, message: string, details: unknown = null) {
    return new AppException(code, message, HttpStatus.CONFLICT, details);
  }

  static unprocessable(code: ErrorCode, message: string, details: unknown = null) {
    return new AppException(code, message, HttpStatus.UNPROCESSABLE_ENTITY, details);
  }
}
