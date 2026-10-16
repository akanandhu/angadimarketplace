import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { AppException } from './app.exception';
import { ErrorCode } from './error-codes';

const STATUS_CODES: Partial<Record<number, ErrorCode>> = {
  [HttpStatus.BAD_REQUEST]: ErrorCode.VALIDATION_ERROR,
  [HttpStatus.UNAUTHORIZED]: ErrorCode.UNAUTHORIZED,
  [HttpStatus.FORBIDDEN]: ErrorCode.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: ErrorCode.NOT_FOUND,
  [HttpStatus.TOO_MANY_REQUESTS]: ErrorCode.RATE_LIMITED,
};

/** Normalises every error into `{ error: { code, message, details } }`. */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const { status, body } = this.toBody(exception);
    res.status(status).json({ error: body });
  }

  private toBody(exception: unknown) {
    if (exception instanceof AppException) {
      return {
        status: exception.getStatus(),
        body: { code: exception.code, message: exception.message, details: exception.details },
      };
    }
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse() as { message?: string | string[] } | string;
      const raw = typeof response === 'string' ? response : response.message;
      const details = Array.isArray(raw) ? raw : null;
      const message =
        status === HttpStatus.TOO_MANY_REQUESTS
          ? 'Too many requests. Please try again shortly.'
          : Array.isArray(raw)
            ? 'Request validation failed'
            : (raw ?? exception.message);
      return {
        status,
        body: { code: STATUS_CODES[status] ?? ErrorCode.INTERNAL_ERROR, message, details },
      };
    }
    this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      body: { code: ErrorCode.INTERNAL_ERROR, message: 'Something went wrong', details: null },
    };
  }
}
