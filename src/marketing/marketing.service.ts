// src/marketing/marketing.service.ts

import { Injectable, ForbiddenException } from '@nestjs/common';
import { EventsService } from '../events/events.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { UserRole } from '../users/dto/user-role.enum';

interface PaginationOptions {
  page: number;
  limit: number;
}

@Injectable()
export class MarketingService {
  constructor(
    private readonly eventsService: EventsService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * 🔹 Método antigo (paginado): retorna todos os participantes confirmados
   * nos eventos do usuário ORGANIZER ou, se ADMIN, de todos os eventos.
   * Ele retorna tudo num array de “participants” (sem agrupar por evento).
   */
  async findAllConfirmedParticipants(
    requestingUser: User,
    options: PaginationOptions,
  ) {
    // Verifica permissão
    if (
      requestingUser.role !== UserRole.ADMIN &&
      requestingUser.role !== UserRole.ORGANIZER
    ) {
      throw new ForbiddenException('Você não tem permissão para acessar esses dados.');
    }

    const { page, limit } = options;

    // Se for ADMIN, busca todos os eventos; se ORGANIZER, só os dele
    let events = [];
    if (requestingUser.role === UserRole.ADMIN) {
      events = await this.eventsService.findAllEventsFull();
    } else {
      events = await this.eventsService.findEventsByCreator(requestingUser.id);
    }

    // Extrair todos os attendees
    const allAttendees = [];
    for (const event of events) {
      if (event.attendees) {
        allAttendees.push(...event.attendees);
      }
    }

    // Remover duplicados
    const uniqueAttendees = Array.from(
      new Map(allAttendees.map((u) => [u.id, u])).values(),
    );

    // Mapear só campos necessários
    const mappedAttendees = uniqueAttendees.map((attendee) => ({
      id: attendee.id,
      nickname: attendee.nickname,
      email: attendee.email,
      phone: attendee.phone ?? '',
    }));

    // Ordenar alfabeticamente (opcional)
    mappedAttendees.sort((a, b) => a.nickname.localeCompare(b.nickname));

    // Paginar
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = mappedAttendees.slice(startIndex, endIndex);

    return {
      totalAttendees: mappedAttendees.length,
      currentPage: page,
      totalPages: Math.ceil(mappedAttendees.length / limit),
      data: paginated,
    };
  }

  /**
   * 🔹 Novo método: Retorna uma lista de “blocos”, cada bloco é um evento
   * com sua lista de participantes confirmados.
   */
  async findAllParticipantsGrouped(requestingUser: User) {
    // Verifica permissão
    if (
      requestingUser.role !== UserRole.ADMIN &&
      requestingUser.role !== UserRole.ORGANIZER
    ) {
      throw new ForbiddenException('Você não tem permissão para acessar esses dados.');
    }

    // Se for ADMIN, pega todos os eventos
    // Se ORGANIZER, pega apenas os criados por ele
    let events = [];
    if (requestingUser.role === UserRole.ADMIN) {
      events = await this.eventsService.findAllEventsFull();
    } else {
      events = await this.eventsService.findEventsByCreator(requestingUser.id);
    }

    // Mapear cada evento para { eventId, eventName, eventDate, participants: [...] }
    const data = events.map((event) => {
      const participants = event.attendees.map((attendee) => ({
        id: attendee.id,
        nickname: attendee.nickname,
        email: attendee.email,
        phone: attendee.phone || '',
      }));

      return {
        eventId: event.id,
        eventName: event.name,
        eventDate: event.eventDate,
        participants,
      };
    });

    // Retornamos no formato { data: [...] }
    return { data };
  }
}
