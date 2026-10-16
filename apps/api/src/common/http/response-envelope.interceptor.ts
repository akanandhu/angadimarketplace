import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { Paginated } from '../pagination/paginated';

/** Wraps handler results as `{ data }` or `{ data, meta }`; leaves empty bodies untouched. */
@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((result: unknown) => {
        if (result === undefined) return undefined;
        if (result instanceof Paginated) return { data: result.items, meta: result.meta };
        return { data: result };
      }),
    );
  }
}
