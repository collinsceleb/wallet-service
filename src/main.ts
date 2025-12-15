import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { ResponseTimeInterceptor } from './common/interceptors/response-time/response-time.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalInterceptors(new ResponseTimeInterceptor());
  await app.listen(configService.get('PORT'));
}
bootstrap();
