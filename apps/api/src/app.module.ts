import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { AppConfigModule } from './config/config.module';
import { HealthController } from './health/health.controller';
import { LocationsModule } from './locations/locations.module';
import { MediaUrlModule } from './media/media-url.service';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';
import { VehicleCatalogueModule } from './vehicle-catalogue/vehicle-catalogue.module';

const infrastructure = [AppConfigModule, PrismaModule, RedisModule, MediaUrlModule];

const features = [
  AuthModule,
  UsersModule,
  LocationsModule,
  CategoriesModule,
  VehicleCatalogueModule,
];

@Module({
  imports: [...infrastructure, ...features],
  controllers: [HealthController],
})
export class AppModule {}
