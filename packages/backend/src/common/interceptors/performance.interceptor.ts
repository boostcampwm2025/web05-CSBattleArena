import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Performance');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{
      method: string;
      url: string;
      query: Record<string, string>;
    }>();
    const { method, url, query } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - now;
        const queryString = Object.keys(query || {}).length
          ? `?${new URLSearchParams(query || {}).toString()}`
          : '';
        this.logger.log(`${method} ${url}${queryString} - ${elapsed}ms`);
      }),
    );
  }
}
