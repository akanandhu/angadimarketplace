import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PageQueryDto } from '../common/pagination/page-query.dto';
import { DevicesService } from './devices.service';
import { RegisterDeviceDto } from './dto/device.dto';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('me')
export class NotificationsController {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly devices: DevicesService,
  ) {}

  @Get('notifications')
  list(@CurrentUser() user: AuthUser, @Query() query: PageQueryDto) {
    return this.notifications.list(user.id, query);
  }

  @Get('notifications/unread-count')
  unreadCount(@CurrentUser() user: AuthUser) {
    return this.notifications.unreadCount(user.id);
  }

  @Patch('notifications/:notificationId/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markRead(
    @CurrentUser() user: AuthUser,
    @Param('notificationId', ParseUUIDPipe) notificationId: string,
  ) {
    await this.notifications.markRead(user.id, notificationId);
  }

  @Post('notifications/read-all')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markAllRead(@CurrentUser() user: AuthUser) {
    await this.notifications.markAllRead(user.id);
  }

  @Post('devices')
  registerDevice(@CurrentUser() user: AuthUser, @Body() dto: RegisterDeviceDto) {
    return this.devices.register(user.id, dto);
  }

  @Delete('devices/:deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeDevice(
    @CurrentUser() user: AuthUser,
    @Param('deviceId', ParseUUIDPipe) deviceId: string,
  ) {
    await this.devices.remove(user.id, deviceId);
  }
}
