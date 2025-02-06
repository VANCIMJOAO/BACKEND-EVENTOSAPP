import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { ChatService } from '../chat/chat.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { User } from '../users/user.entity';
import { UserRole } from '../users/dto/user-role.enum';
import { Event } from './event.entity';

describe('EventsController', () => {
  let eventsController: EventsController;
  let eventsService: EventsService;
  let chatService: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: {
            createEvent: jest.fn(),
            findAll: jest.fn(),
            findOneEvent: jest.fn(),
            updateEvent: jest.fn(),
            deleteEvent: jest.fn(),
            markGoing: jest.fn(),
            unmarkGoing: jest.fn(),
            registerVisit: jest.fn(),
          },
        },
        {
          provide: ChatService,
          useValue: {
            getMessagesForEvent: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    eventsController = module.get<EventsController>(EventsController);
    eventsService = module.get<EventsService>(EventsService);
    chatService = module.get<ChatService>(ChatService);
  });

  const mockEvent: Event = {
    id: 1,
    name: 'Evento Teste',
    placeName: 'Local Teste',
    eventDate: new Date(),
    creatorUser: { id: 1 } as User,
  } as Event;

  const mockUser: User = {
    id: 1,
    role: UserRole.ORGANIZER,
  } as User;

  it('deve ser definido', () => {
    expect(eventsController).toBeDefined();
  });

  it('deve criar um evento', async () => {
    jest.spyOn(eventsService, 'createEvent').mockResolvedValue(mockEvent);

    const result = await eventsController.createEvent(
      {
        name: 'Evento Teste',
        placeName: 'Local Teste',
        eventDate: new Date().toISOString(),
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        address: 'Rua 123',
        isFree: true,
        registrationStatus: 'open',
        description: '',
        categories: [],
      },
      null,
      { user: mockUser } as unknown as Request
    );

    expect(result).toEqual(mockEvent);
  });

  it('deve retornar um evento pelo ID', async () => {
    jest.spyOn(eventsService, 'findOneEvent').mockResolvedValue(mockEvent);

    const result = await eventsController.findOneEvent(1);

    expect(result).toEqual(mockEvent);
  });

  it('deve lançar erro ao buscar evento inexistente', async () => {
    jest.spyOn(eventsService, 'findOneEvent').mockRejectedValue(new NotFoundException());

    await expect(eventsController.findOneEvent(999)).rejects.toThrow(NotFoundException);
  });

  it('deve marcar presença em um evento', async () => {
    jest.spyOn(eventsService, 'markGoing').mockResolvedValue(mockEvent); // ✅ Garante que markGoing retorna mockEvent
    jest.spyOn(eventsService, 'findOneEvent').mockResolvedValue(mockEvent); // ✅ Garante que findOneEvent retorna mockEvent
  
    const result = await eventsController.markGoing(1, { user: mockUser } as unknown as Request);
  
    expect(result).toEqual(mockEvent); // ✅ Agora result tem o mockEvent corretamente
  });
  

  it('deve lançar erro ao deletar evento sem permissão', async () => {
    jest.spyOn(eventsService, 'findOneEvent').mockResolvedValue(mockEvent); // ✅ Garantir que o evento existe
    jest.spyOn(eventsService, 'deleteEvent').mockRejectedValue(new ForbiddenException()); // ✅ Teste correto

    await expect(eventsController.deleteEvent(1, { user: mockUser } as unknown as Request)).rejects.toThrow(ForbiddenException);
  });
});
