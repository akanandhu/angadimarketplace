import { Module } from '@nestjs/common';
import { AdminModule } from './admin/admin.module';
import { AnalyticsModule } from './analytics/analytics.service';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ContactConnectionsModule } from './contact-connections/contact-connections.module';
import { ContactRequestsModule } from './contact-requests/contact-requests.module';
import { AppConfigModule } from './config/config.module';
import { DealersModule } from './dealers/dealers.module';
import { FavouritesModule } from './favourites/favourites.module';
import { HealthController } from './health/health.controller';
import { ListingsModule } from './listings/listings.module';
import { LocationsModule } from './locations/locations.module';
import { MediaUrlModule } from './media/media-url.service';
import { MediaModule } from './media/media.module';
import { MediaStorageModule } from './media/storage/media-storage.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './queue/queue.module';
import { RedisModule } from './redis/redis.module';
import { ReportsModule } from './reports/reports.module';
import { SearchModule } from './search/search.module';
import { ThrottlingModule } from './throttling/throttling.module';
import { UsersModule } from './users/users.module';
import { VehicleCatalogueModule } from './vehicle-catalogue/vehicle-catalogue.module';

const infrastructure = [
  AppConfigModule,
  PrismaModule,
  RedisModule,
  QueueModule,
  MediaUrlModule,
  MediaStorageModule,
  ThrottlingModule,
  AnalyticsModule,
];

const features = [
  AuthModule,
  UsersModule,
  LocationsModule,
  CategoriesModule,
  VehicleCatalogueModule,
  ListingsModule,
  MediaModule,
  SearchModule,
  FavouritesModule,
  NotificationsModule,
  ContactConnectionsModule,
  ContactRequestsModule,
  DealersModule,
  ReportsModule,
  AdminModule,
];

@Module({
  imports: [...infrastructure, ...features],
  controllers: [HealthController],
})
export class AppModule {}
