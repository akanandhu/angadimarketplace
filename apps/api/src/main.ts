import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/errors/http-exception.filter';
import { ResponseEnvelopeInterceptor } from './common/http/response-envelope.interceptor';
import { AppConfig } from './config/app-config.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(AppConfig);

  // Behind the AWS load balancer: use X-Forwarded-For for client IPs (throttling, view dedup).
  app.set('trust proxy', 1);

  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  app.enableCors({ origin: config.get('WEB_ORIGIN').split(','), credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseEnvelopeInterceptor());
  app.enableShutdownHooks();

  const swagger = new DocumentBuilder()
    .setTitle('Angadi Marketplace API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swagger));

  await app.listen(config.get('PORT'));
}

void bootstrap();
