import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Event } from './event.entity';
import { EventVisit } from './event-visit.entity';
import { EventsGateway } from './events.gateway';
import { ChatModule } from '../chat/chat.module';
import { MarketingModule } from 'src/marketing/marketing.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, EventVisit]),
    ChatModule,
  ],
  controllers: [EventsController],
  providers: [EventsService, EventsGateway],
  exports: [EventsService, TypeOrmModule.forFeature([Event, EventVisit]), EventsGateway], // 🔹 Exportando EventsGateway
})
export class EventsModule {}
