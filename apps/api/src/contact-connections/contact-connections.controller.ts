import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PageQueryDto } from '../common/pagination/page-query.dto';
import { ConnectionRole, ContactConnectionsService } from './contact-connections.service';

class ConnectionsQueryDto extends PageQueryDto {
  /** buyer: sellers I can contact (default). seller: buyers connected to me. */
  @IsOptional()
  @IsIn(['buyer', 'seller'])
  role: ConnectionRole = 'buyer';
}

@ApiTags('contact-connections')
@ApiBearerAuth()
@Controller('me/contact-connections')
export class ContactConnectionsController {
  constructor(private readonly connections: ContactConnectionsService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: ConnectionsQueryDto) {
    return this.connections.list(user.id, query.role, query);
  }

  @Get(':connectionId')
  get(@CurrentUser() user: AuthUser, @Param('connectionId', ParseUUIDPipe) connectionId: string) {
    return this.connections.get(user.id, connectionId);
  }
}
