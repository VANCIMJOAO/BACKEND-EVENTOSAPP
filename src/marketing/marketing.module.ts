// src/marketing/marketing.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketingService } from './marketing.service';
import { MarketingController } from './marketing.controller';
// Remova import do UsersService
// Remova import do EventsService
// ...
import { Event } from '../events/event.entity';
import { User } from '../users/user.entity';
import { EventVisit } from '../events/event-visit.entity';

// IMPORTS que já existem
import { EventsModule } from '../events/events.module';
import { UsersModule } from '../users/users.module';  // Importante

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, User, EventVisit]),
    EventsModule,  // Importa EventsModule (exporta EventsService)
    UsersModule,   // Importa UsersModule (exporta UsersService)
  ],
  controllers: [MarketingController],
  providers: [
    MarketingService,
    // Não coloque UsersService aqui.
    // Não coloque EventsService aqui.
  ],
})
export class MarketingModule {}
