import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/errors/http-exception.filter';
import { ResponseEnvelopeInterceptor } from './common/http/response-envelope.interceptor';
import { AppConfig } from './config/app-config.service';

/** Global HTTP behaviour shared by the server and the e2e tests. */
export function configureApp(app: NestExpressApplication) {
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
  return app;
}
