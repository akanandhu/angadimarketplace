import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ContactRequestCommandsService } from './contact-request-commands.service';
import { ContactResponsesService } from './contact-responses.service';
import { CreateContactRequestDto, RejectContactRequestDto } from './dto/contact-request.dto';

const RequestId = () => Param('requestId', ParseUUIDPipe);

@ApiTags('contact-requests')
@ApiBearerAuth()
@Controller('contact-requests')
export class ContactRequestsController {
  constructor(
    private readonly commands: ContactRequestCommandsService,
    private readonly responses: ContactResponsesService,
  ) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateContactRequestDto) {
    return this.commands.create(user.id, dto);
  }

  @Post(':requestId/approve')
  @HttpCode(HttpStatus.OK)
  approve(@CurrentUser() user: AuthUser, @RequestId() requestId: string) {
    return this.responses.approve(user.id, requestId);
  }

  @Post(':requestId/reject')
  @HttpCode(HttpStatus.OK)
  reject(
    @CurrentUser() user: AuthUser,
    @RequestId() requestId: string,
    @Body() dto: RejectContactRequestDto,
  ) {
    return this.responses.reject(user.id, requestId, dto);
  }

  @Post(':requestId/cancel')
  @HttpCode(HttpStatus.OK)
  cancel(@CurrentUser() user: AuthUser, @RequestId() requestId: string) {
    return this.commands.cancel(user.id, requestId);
  }
}
