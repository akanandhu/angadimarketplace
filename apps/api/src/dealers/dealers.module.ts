import { Module } from '@nestjs/common';
import { SearchModule } from '../search/search.module';
import { UsersModule } from '../users/users.module';
import { DealersController } from './dealers.controller';
import { DealersService } from './dealers.service';

@Module({
  imports: [UsersModule, SearchModule],
  controllers: [DealersController],
  providers: [DealersService],
})
export class DealersModule {}
