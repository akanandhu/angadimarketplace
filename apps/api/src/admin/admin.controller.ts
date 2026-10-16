import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user';
import { AdminOnly } from '../auth/decorators/admin-only.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { AdminListingsService } from './admin-listings.service';
import { AdminReportsService } from './admin-reports.service';
import { AdminUsersService } from './admin-users.service';
import {
  AdminListingsQueryDto,
  AdminReportsQueryDto,
  AdminUsersQueryDto,
  ModerationNoteDto,
} from './dto/admin.dto';

const Id = (name: string) => Param(name, ParseUUIDPipe);

/** All routes require ADMIN, enforced server-side by AdminGuard. */
@ApiTags('admin')
@AdminOnly()
@Controller('admin')
export class AdminController {
  constructor(
    private readonly listings: AdminListingsService,
    private readonly users: AdminUsersService,
    private readonly reports: AdminReportsService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('overview')
  async overview() {
    const [activeListings, openReports, users, suspendedUsers] = await Promise.all([
      this.prisma.listing.count({ where: { status: 'ACTIVE' } }),
      this.prisma.listingReport.count({ where: { status: 'OPEN' } }),
      this.prisma.user.count(),
      this.prisma.user.count({ where: { status: 'SUSPENDED' } }),
    ]);
    return { activeListings, openReports, users, suspendedUsers };
  }

  @Get('listings')
  listListings(@Query() query: AdminListingsQueryDto) {
    return this.listings.list(query);
  }

  @Get('listings/:listingId')
  getListing(@Id('listingId') listingId: string) {
    return this.listings.get(listingId);
  }

  @Post('listings/:listingId/remove')
  @HttpCode(HttpStatus.OK)
  removeListing(@Id('listingId') listingId: string, @Body() dto: ModerationNoteDto) {
    return this.listings.remove(listingId, dto.note);
  }

  @Post('listings/:listingId/restore')
  @HttpCode(HttpStatus.OK)
  restoreListing(@Id('listingId') listingId: string) {
    return this.listings.restore(listingId);
  }

  @Get('users')
  listUsers(@Query() query: AdminUsersQueryDto) {
    return this.users.list(query);
  }

  @Get('users/:userId')
  getUser(@Id('userId') userId: string) {
    return this.users.get(userId);
  }

  @Post('users/:userId/suspend')
  @HttpCode(HttpStatus.OK)
  suspend(@Id('userId') userId: string, @Body() dto: ModerationNoteDto) {
    return this.users.suspend(userId, dto.note);
  }

  @Post('users/:userId/unsuspend')
  @HttpCode(HttpStatus.OK)
  unsuspend(@Id('userId') userId: string) {
    return this.users.unsuspend(userId);
  }

  @Get('reports')
  listReports(@Query() query: AdminReportsQueryDto) {
    return this.reports.list(query);
  }

  @Post('reports/:reportId/resolve')
  @HttpCode(HttpStatus.OK)
  resolve(
    @CurrentUser() admin: AuthUser,
    @Id('reportId') id: string,
    @Body() dto: ModerationNoteDto,
  ) {
    return this.reports.resolve(id, admin.id, dto.note);
  }

  @Post('reports/:reportId/dismiss')
  @HttpCode(HttpStatus.OK)
  dismiss(
    @CurrentUser() admin: AuthUser,
    @Id('reportId') id: string,
    @Body() dto: ModerationNoteDto,
  ) {
    return this.reports.dismiss(id, admin.id, dto.note);
  }
}
