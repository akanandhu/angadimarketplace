import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { AppConfig } from './config/app-config.service';

async function bootstrap() {
  const app = configureApp(await NestFactory.create<NestExpressApplication>(AppModule));

  const swagger = new DocumentBuilder()
    .setTitle('Angadi Marketplace API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swagger));

  await app.listen(app.get(AppConfig).get('PORT'));
}

void bootstrap();
