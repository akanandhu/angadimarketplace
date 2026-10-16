import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { Queues } from '../queue/queues';
import { DevicesService } from './devices.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PushSender } from './push/push-sender';
import { PushProcessor } from './push/push.processor';

@Global()
@Module({
  imports: [BullModule.registerQueue({ name: Queues.PUSH_NOTIFICATIONS })],
  controllers: [NotificationsController],
  providers: [NotificationsService, DevicesService, PushSender, PushProcessor],
  exports: [NotificationsService],
})
export class NotificationsModule {}
