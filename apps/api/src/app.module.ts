import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { AppConfigModule } from './config/config.module';
import { HealthController } from './health/health.controller';
import { ListingsModule } from './listings/listings.module';
import { LocationsModule } from './locations/locations.module';
import { MediaUrlModule } from './media/media-url.service';
import { MediaModule } from './media/media.module';
import { MediaStorageModule } from './media/storage/media-storage.module';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';
import { VehicleCatalogueModule } from './vehicle-catalogue/vehicle-catalogue.module';

const infrastructure = [
  AppConfigModule,
  PrismaModule,
  RedisModule,
  QueueModule,
  MediaUrlModule,
  MediaStorageModule,
];

const features = [
  AuthModule,
  UsersModule,
  LocationsModule,
  CategoriesModule,
  VehicleCatalogueModule,
  ListingsModule,
  MediaModule,
];

@Module({
  imports: [...infrastructure, ...features],
  controllers: [HealthController],
})
export class AppModule {}
