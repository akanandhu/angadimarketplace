import { Module } from '@nestjs/common';
import { ContactConnectionsController } from './contact-connections.controller';
import { ContactConnectionsService } from './contact-connections.service';

@Module({
  controllers: [ContactConnectionsController],
  providers: [ContactConnectionsService],
  exports: [ContactConnectionsService],
})
export class ContactConnectionsModule {}
