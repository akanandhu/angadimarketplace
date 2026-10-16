import { Module } from '@nestjs/common';
import { ContactConnectionsModule } from '../contact-connections/contact-connections.module';
import { ContactRequestCommandsService } from './contact-request-commands.service';
import { ContactRequestQueriesService } from './contact-request-queries.service';
import { ContactRequestsController } from './contact-requests.controller';
import { ContactResponsesService } from './contact-responses.service';
import { MyContactRequestsController } from './my-contact-requests.controller';

@Module({
  imports: [ContactConnectionsModule],
  controllers: [ContactRequestsController, MyContactRequestsController],
  providers: [ContactRequestCommandsService, ContactResponsesService, ContactRequestQueriesService],
})
export class ContactRequestsModule {}
