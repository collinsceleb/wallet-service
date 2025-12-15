import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
@Injectable()
export class ResponseTimeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();
    return next.handle().pipe(
      map((data) => {
        const duration = Date.now() - start;
        const responseTime = this.formatDuration(duration);
        request.apiResponseTime = responseTime;

        const response: Record<string, any> = {
          ...(data &&
          typeof data === 'object' &&
          'statusCode' in data &&
          'message' in data
            ? data
            : {
                statusCode: 200,
                statusType: 'OK',
                message: 'Request successful',
                data,
              }),
          responseTime,
        };

        return response;
      }),
    );
  }

  private formatDuration(durationMs: number): string {
    const seconds = durationMs / 1000;
    if (seconds < 60) return `${seconds.toFixed(2)} seconds`;

    const minutes = seconds / 60;
    if (minutes < 60) return `${minutes.toFixed(2)} minutes`;

    const hours = minutes / 60;
    if (hours < 24) return `${hours.toFixed(2)} hours`;

    const days = hours / 24;
    if (days < 30) return `${days.toFixed(2)} days`;

    const months = days / 30;
    if (months < 12) return `${months.toFixed(2)} months`;

    const years = months / 12;
    return `${years.toFixed(2)} years`;
  }
}
