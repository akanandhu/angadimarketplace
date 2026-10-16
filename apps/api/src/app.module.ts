import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AppConfigModule } from './config/config.module';
import { HealthController } from './health/health.controller';
import { MediaUrlModule } from './media/media-url.service';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [AppConfigModule, PrismaModule, RedisModule, MediaUrlModule, AuthModule, UsersModule],
  controllers: [HealthController],
})
export class AppModule {}
