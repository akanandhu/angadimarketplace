import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ContactRequestQueriesService } from './contact-request-queries.service';
import { ContactRequestsQueryDto, ContactStateQueryDto } from './dto/contact-request.dto';

@ApiTags('contact-requests')
@ApiBearerAuth()
@Controller('me')
export class MyContactRequestsController {
  constructor(private readonly queries: ContactRequestQueriesService) {}

  @Get('contact-requests/incoming')
  incoming(@CurrentUser() user: AuthUser, @Query() query: ContactRequestsQueryDto) {
    return this.queries.incoming(user.id, query);
  }

  @Get('contact-requests/outgoing')
  outgoing(@CurrentUser() user: AuthUser, @Query() query: ContactRequestsQueryDto) {
    return this.queries.outgoing(user.id, query);
  }

  @Get('contact-state/sellers/:sellerId')
  contactState(
    @CurrentUser() user: AuthUser,
    @Param('sellerId', ParseUUIDPipe) sellerId: string,
    @Query() query: ContactStateQueryDto,
  ) {
    return this.queries.contactState(user.id, sellerId, query.listingId);
  }
}
