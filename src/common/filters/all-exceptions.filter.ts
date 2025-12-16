import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Internal server error';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object') {
        message = (res as any).message || (res as any).error || res;
        details = res;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      details = { name: exception.name };
    }

    this.logger.error(
      `${request.method} ${request.url} - ${JSON.stringify(message)}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );

    const isProd = process.env.NODE_ENV === 'production';

    const body: any = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };

    if (!isProd && exception instanceof Error) {
      body.stack = exception.stack;
    }

    if (details) body.details = details;

    response.status(status).json(body);
  }
}
