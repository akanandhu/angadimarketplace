import { Module } from '@nestjs/common';
import { AdminListingsService } from './admin-listings.service';
import { AdminReportsService } from './admin-reports.service';
import { AdminUsersService } from './admin-users.service';
import { AdminController } from './admin.controller';

@Module({
  controllers: [AdminController],
  providers: [AdminListingsService, AdminUsersService, AdminReportsService],
})
export class AdminModule {}
