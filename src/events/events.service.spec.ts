// events.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { User } from '../users/user.entity';
import { UserRole } from '../users/dto/user-role.enum';
import { EventVisit } from './event-visit.entity';
import { EventsGateway } from './events.gateway';

// Desabilita a saída de log para todos os testes
Logger.overrideLogger([]);

describe('EventsService', () => {
  let eventsService: EventsService;
  let eventsRepository: Repository<Event>;
  let eventVisitRepository: Repository<EventVisit>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(EventVisit),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: EventsGateway,
          useValue: {
            notifyNewEvent: jest.fn(),
          },
        },
        // Mesmo que não seja necessário aqui (já que usaremos Logger.overrideLogger),
        // podemos manter o provider do Logger se desejar:
        {
          provide: Logger,
          useValue: {
            error: jest.fn(),
            log: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    eventsService = module.get<EventsService>(EventsService);
    eventsRepository = module.get<Repository<Event>>(getRepositoryToken(Event));
    eventVisitRepository = module.get<Repository<EventVisit>>(getRepositoryToken(EventVisit));
  });

  const mockUser: User = {
    id: 1,
    nickname: 'Organizador',
    email: 'organizador@email.com',
    password: '',
    cpf: '123.456.789-00',
    role: UserRole.ORGANIZER,
    avatar: '',
    description: '',
    friends: [],
    isProfileComplete: true,
    isPrivate: false,
    attendingEvents: [],
    favoriteEvents: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    events: [],
    sentFriendRequests: [],
    receivedFriendRequests: [],
    sentEventInvitations: [],
    receivedEventInvitations: [],
    receivedNotifications: [],
    sentMessages: [],
    receivedMessages: [],
    eventVisits: [],
  };

  const mockEvent: Event = {
    id: 1,
    name: 'Evento Teste',
    description: 'Descrição do evento',
    coverImage: 'image.jpg',
    placeName: 'Local Teste',
    eventDate: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    address: 'Rua 123',
    latitude: 0,
    longitude: 0,
    isFree: true,
    ticketPrice: null,
    registrationStatus: 'open',
    creatorUser: mockUser,
    attendees: [],
    attendeesCount: 0,
    interested: [],
    interestedCount: 0,
    visitCount: 0,
    eventVisits: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    categories: [],
    invitations: [],
  };

  beforeEach(() => {
    jest.spyOn(eventsRepository, 'create').mockImplementation((eventData) => {
      return {
        ...mockEvent,
        ...eventData,
        id: 1, // Garante um ID válido
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Event;
    });

    jest.spyOn(eventsRepository, 'save').mockImplementation(async (event) => {
      return {
        ...mockEvent,
        ...event,
        id: 1, // Garante um ID válido
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Event;
    });
  });

  it('deve ser definido', () => {
    expect(eventsService).toBeDefined();
  });

  it('deve criar um evento corretamente', async () => {
    const now = new Date();
    const eventData = {
      name: 'Evento Teste',
      placeName: 'Local Teste',
      eventDate: now.toISOString(),
      startTime: now.toISOString(),
      endTime: now.toISOString(),
      address: 'Rua 123',
      isFree: true,
      registrationStatus: 'open',
      description: 'Descrição do evento',
      categories: [],
    };

    const expectedCreatedEvent = {
      ...mockEvent,
      ...eventData,
      creatorUser: expect.objectContaining({ id: mockUser.id, email: mockUser.email }),
      attendees: expect.any(Array),
      interested: expect.any(Array),
      attendeesCount: expect.any(Number),
      interestedCount: expect.any(Number),
      visitCount: expect.any(Number),
      eventVisits: expect.any(Array),
      coverImage: null,
      eventDate: expect.any(Date),
      startTime: expect.any(Date),
      endTime: expect.any(Date),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    };

    // (Opcional) Comente ou remova o console.log para evitar output extra durante os testes
    // console.log('Evento Criado:', expectedCreatedEvent);

    const result = await eventsService.createEvent(eventData, mockUser, null);

    expect(result).toHaveProperty('id');
    expect(eventsRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Evento Teste',
      description: 'Descrição do evento',
      placeName: 'Local Teste',
      eventDate: expect.any(Date),
      startTime: expect.any(Date),
      endTime: expect.any(Date),
      address: 'Rua 123',
      isFree: true,
      registrationStatus: 'open',
      categories: [],
      coverImage: null,
    }));
    expect(eventsRepository.save).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject(expectedCreatedEvent);
  });

  it('deve retornar um erro ao tentar criar um evento inválido', async () => {
    jest.spyOn(eventsRepository, 'save').mockRejectedValue(new Error());

    await expect(
      eventsService.createEvent(
        {
          name: '',
          placeName: '',
          eventDate: new Date().toISOString(),
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
          address: '',
          isFree: true,
          registrationStatus: 'open',
          description: '',
          categories: [],
        },
        mockUser,
        null
      )
    ).rejects.toThrow(BadRequestException);
  });

  it('deve retornar um evento pelo ID', async () => {
    jest.spyOn(eventsRepository, 'findOne').mockResolvedValue(mockEvent);

    const result = await eventsService.findOneEvent(1);

    expect(result).toEqual(mockEvent);
  });

  it('deve lançar erro ao buscar evento inexistente', async () => {
    jest.spyOn(eventsRepository, 'findOne').mockResolvedValue(null);

    await expect(eventsService.findOneEvent(999)).rejects.toThrow(NotFoundException);
  });

  it('deve registrar uma visita corretamente', async () => {
    jest.spyOn(eventsRepository, 'findOne').mockResolvedValue(mockEvent);
    jest.spyOn(eventVisitRepository, 'findOne').mockResolvedValue(null);
    jest.spyOn(eventVisitRepository, 'create').mockReturnValue({
      event: mockEvent,
      user: { id: mockUser.id },
      visitedAt: new Date(),
    } as EventVisit);

    jest.spyOn(eventVisitRepository, 'save').mockResolvedValue({
      event: mockEvent,
      user: mockUser,
      visitedAt: new Date(),
    } as EventVisit);

    jest.spyOn(eventsRepository, 'save').mockResolvedValue(mockEvent);

    await eventsService.registerVisit(1, 1);

    expect(eventVisitRepository.create).toHaveBeenCalled();
    expect(eventVisitRepository.save).toHaveBeenCalled();
  });

  it('deve não registrar visita duplicada', async () => {
    jest.spyOn(eventsRepository, 'findOne').mockResolvedValue(mockEvent);
    jest.spyOn(eventVisitRepository, 'findOne').mockResolvedValue({} as EventVisit);

    await expect(eventsService.registerVisit(1, 1)).resolves.not.toThrow();
  });

  it('deve lançar erro ao marcar presença em evento inexistente', async () => {
    jest.spyOn(eventsRepository, 'findOne').mockResolvedValue(null);

    await expect(eventsService.markGoing(999, 1)).rejects.toThrow(NotFoundException);
  });
});
