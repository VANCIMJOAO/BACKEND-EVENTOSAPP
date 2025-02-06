// src/event-invitations/event-invitations.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventInvitationsController } from './event-invitations.controller';
import { EventInvitationsService } from './event-invitations.service';
import { EventInvitation } from './event-invitation.entity';
import { Event } from '../events/event.entity';
import { User } from '../users/user.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([EventInvitation, Event, User]), // Importa as entidades necessárias
    NotificationsModule, // Importa o módulo de notificações se for usado no serviço
  ],
  controllers: [EventInvitationsController], // Declara o controlador
  providers: [EventInvitationsService], // Declara o serviço
  exports: [EventInvitationsService], // Exporta o serviço se for necessário em outros módulos
})
export class EventInvitationsModule {}
