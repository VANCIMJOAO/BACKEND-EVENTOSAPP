// src/events/events.service.ts

import {
  Injectable,
  NotFoundException,
  Logger,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { User } from '../users/user.entity';
import { UserRole } from '../users/dto/user-role.enum';
import { EventsGateway } from './events.gateway'; // Importa o gateway WebSocket
import { EventVisit } from './event-visit.entity'; // Importa a nova entidade
import * as moment from 'moment-timezone';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(EventVisit)
    private readonly eventVisitRepository: Repository<EventVisit>,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async createEvent(
    createEventDto: CreateEventDto,
    user: User,
    coverImage: string | null,
  ): Promise<Event> {
    this.logger.log(`Creating event for user: ${user.email}`);
    this.logger.debug(`DTO recebido: ${JSON.stringify(createEventDto)}`);

    const {
      name,
      description,
      categories,
      placeName,
      eventDate,
      startTime,
      endTime,
      address,
      isFree,
      ticketPrice,
      registrationStatus,
    } = createEventDto;

    this.logger.debug(`isFree recebido: ${isFree} (${typeof isFree})`);

    // Ajustar as datas para o fuso horário de Brasília e converter para UTC
    const timeZone = 'America/Sao_Paulo';
    let adjustedEventDate = moment.tz(eventDate, timeZone).utc().toDate();
    let adjustedStartTime = moment.tz(startTime, timeZone).utc().toDate();
    let adjustedEndTime = moment.tz(endTime, timeZone).utc().toDate();

    if (adjustedEndTime < adjustedStartTime) {
      adjustedEndTime = moment(adjustedEndTime).add(1, 'day').toDate();
    }

    const event = this.eventsRepository.create({
      name,
      description,
      coverImage,
      categories,
      placeName,
      eventDate: adjustedEventDate,
      startTime: adjustedStartTime,
      endTime: adjustedEndTime,
      address,
      isFree,
      ticketPrice: isFree ? null : ticketPrice,
      registrationStatus: registrationStatus || 'open',
      creatorUser: user,
      attendees: [],
      attendeesCount: 0,
      interested: [],
      interestedCount: 0,
      visitCount: 0,
    });

    this.logger.debug(`Evento criado: ${JSON.stringify(event)}`);

    try {
      return await this.eventsRepository.save(event);
    } catch (error) {
      this.logger.error('Error creating event', error.stack);
      throw new BadRequestException('Erro ao criar o evento.');
    }
  }

  async findAllEvents(): Promise<any[]> {
    const events = await this.eventsRepository.find({
      relations: [
        'creatorUser',
        'attendees',
        'interested',
        'eventVisits',
        'eventVisits.user',
      ],
      select: [
        'id',
        'name',
        'eventDate',
        'placeName',
        'categories',
        'address',
        'coverImage',
        'attendeesCount',
        'visitCount',
      ],
    });

    return events.map((event) => ({
      id: event.id,
      title: event.name,
      eventDate: event.eventDate,
      location: event.placeName,
      address: event.address,
      categories: event.categories || ['Geral'],
      latitude: event.latitude,
      longitude: event.longitude,
      attendees: event.attendees.map((attendee) => ({
        id: attendee.id,
        profileImage: attendee.avatar || 'https://via.placeholder.com/150',
      })),
      attendeesCount: event.attendeesCount,
      visitCount: event.visitCount,
      image: event.coverImage,
      creatorUser: {
        id: event.creatorUser.id,
        nickname: event.creatorUser.nickname,
        profileImage: event.creatorUser.avatar,
      },
      visitHistory: [], // Inicialmente vazio; será preenchido no controlador
    }));
  }

  async findOneEvent(id: number): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: [
        'creatorUser',
        'attendees',
        'interested',
        'eventVisits',
        'eventVisits.user',
      ],
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found.`);
    }

    return event;
  }

  async updateEvent(
    id: number,
    updateEventDto: Partial<UpdateEventDto>,
    user: User,
    coverImage: string | null,
  ): Promise<Event> {
    const event = await this.findOneEvent(id);

    if (!event) {
      throw new NotFoundException(`Evento com ID ${id} não encontrado.`);
    }

    // 🔹 Permissões: Apenas o criador do evento ou um ADMIN pode editar
    if (user.role !== UserRole.ADMIN && event.creatorUser.id !== user.id) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar este evento.',
      );
    }

    // 🔹 Extraindo os campos a serem atualizados
    const {
      name,
      description,
      categories,
      placeName,
      eventDate,
      startTime,
      endTime,
      address,
      isFree,
      ticketPrice,
      registrationStatus,
    } = updateEventDto;

    // 🔹 Ajustar data e horário corretamente
    const timeZone = 'America/Sao_Paulo';
    let adjustedEndTime = endTime
      ? moment.tz(endTime, timeZone).utc().toDate()
      : event.endTime;
    let adjustedStartTime = startTime
      ? moment.tz(startTime, timeZone).utc().toDate()
      : event.startTime;
    let adjustedEventDate = eventDate
      ? moment.tz(eventDate, timeZone).utc().toDate()
      : event.eventDate;

    // Se o horário de término for antes do horário de início, assume-se que seja no dia seguinte
    if (adjustedEndTime < adjustedStartTime) {
      adjustedEndTime = moment(adjustedEndTime)
        .add(1, 'day')
        .utc()
        .toDate();
    }

    // 🔹 Atualizando os campos, preservando visitCount
    Object.assign(event, {
      name: name ?? event.name,
      description: description ?? event.description,
      coverImage: coverImage ?? event.coverImage,
      categories: categories ?? event.categories,
      placeName: placeName ?? event.placeName,
      eventDate: adjustedEventDate,
      startTime: adjustedStartTime,
      endTime: adjustedEndTime,
      address: address ?? event.address,
      isFree: isFree !== undefined ? isFree : event.isFree,
      ticketPrice: isFree ? null : ticketPrice ?? event.ticketPrice,
      registrationStatus: registrationStatus ?? event.registrationStatus,
      visitCount: event.visitCount, // 🔹 Mantém o número de visitas inalterado
    });

    try {
      const updatedEvent = await this.eventsRepository.save(event);
      return updatedEvent;
    } catch (error) {
      this.logger.error('Erro ao atualizar evento:', error.stack);
      throw new BadRequestException('Erro ao atualizar o evento.');
    }
  }

  async deleteEvent(id: number, user: User): Promise<void> {
    const event = await this.findOneEvent(id);

    if (user.role !== UserRole.ADMIN && event.creatorUser.id !== user.id) {
      throw new ForbiddenException(
        'Você não tem permissão para deletar este evento.',
      );
    }

    await this.eventsRepository.delete(id);
  }

  async findEventsByCreator(creatorId: number): Promise<Event[]> {
    return this.eventsRepository.find({
      where: { creatorUser: { id: creatorId } },
      relations: [
        'creatorUser',
        'attendees',
        'interested',
        'eventVisits',
        'eventVisits.user',
      ],
    });
  }

  async markGoing(eventId: number, userId: number): Promise<Event> {
    const event = await this.findOneEvent(eventId);

    const user = await this.eventsRepository.manager.findOne(User, {
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`Usuário com ID ${userId} não encontrado.`);
    }

    if (!event.attendees.some((attendee) => attendee.id === userId)) {
      event.attendees.push(user);
      event.attendeesCount++;
    }

    return this.eventsRepository.save(event);
  }

  async unmarkGoing(eventId: number, userId: number): Promise<Event> {
    const event = await this.findOneEvent(eventId);

    const newAttendees = event.attendees.filter((u) => u.id !== userId);
    if (newAttendees.length < event.attendees.length) {
      event.attendees = newAttendees;
      event.attendeesCount = Math.max(0, event.attendeesCount - 1);
    }

    return this.eventsRepository.save(event);
  }

  async searchEventsByName(term: string) {
    return this.eventsRepository.find({
      where: { name: Like(`%${term}%`) },
      select: ['id', 'name', 'eventDate', 'coverImage'],
      relations: ['creatorUser'],
    });
  }

  async findAllPublicEvents(): Promise<Event[]> {
    return this.eventsRepository.find({
      where: { registrationStatus: 'open' },
      relations: ['creatorUser', 'attendees', 'interested'],
    });
  }

  /**
   * 🔹 Registra uma visita de um usuário a um evento.
   * Incrementa o contador de visitas apenas se o usuário ainda não tiver visitado.
   */
  async registerVisit(eventId: number, userId: number): Promise<void> {
    const event = await this.eventsRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Evento com ID ${eventId} não encontrado.`);
    }

    // Verifica se já existe uma visita para este usuário e evento
    const existingVisit = await this.eventVisitRepository.findOne({
      where: {
        event: { id: eventId },
        user: { id: userId },
      },
    });

    if (existingVisit) {
      this.logger.warn(
        `Usuário ID ${userId} já registrou uma visita para o evento ID ${eventId}.`,
      );
      // Opcional: Retornar sem lançar exceção
      return;
      // Alternativamente, lance uma exceção se preferir
      // throw new BadRequestException('Visita já registrada para este evento.');
    }

    const visit = this.eventVisitRepository.create({
      event,
      user: { id: userId } as any, // Simula o relacionamento com User sem precisar buscar o usuário inteiro
    });

    await this.eventVisitRepository.save(visit);

    // Incrementa o contador de visitas
    event.visitCount++;
    await this.eventsRepository.save(event);
  }

  /**
   * 🔹 Recupera o histórico de visitas agregadas por intervalo de tempo.
   * Por exemplo, a cada 4 horas.
   */
  async getVisitHistory(eventId: number): Promise<{ hour: number; count: number }[]> {
    const event = await this.eventsRepository.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException(`Evento com ID ${eventId} não encontrado.`);
    }

    const rawVisits = await this.eventVisitRepository
      .createQueryBuilder('eventVisit')
      .select(
        "EXTRACT(HOUR FROM eventVisit.visitedAt AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')",
        'hour',
      )
      .addSelect('COUNT(*)', 'count')
      .where('eventVisit.eventId = :eventId', { eventId })
      .groupBy('hour')
      .orderBy('hour', 'ASC')
      .getRawMany();

    const visitCounts = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));

    rawVisits.forEach((visit) => {
      const hour = parseInt(visit.hour, 10);
      const count = parseInt(visit.count, 10);
      if (!isNaN(hour) && hour >= 0 && hour < 24) {
        visitCounts[hour].count = count;
      }
    });

    return visitCounts;
  }

  async findAllEventsFull(): Promise<Event[]> {
    return this.eventsRepository.find({
      relations: [
        'creatorUser',
        'attendees',
        // ... se quiser outras relações
      ],
    });
  }
}
