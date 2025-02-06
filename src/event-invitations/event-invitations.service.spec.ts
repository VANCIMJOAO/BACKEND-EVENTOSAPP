import { Test, TestingModule } from '@nestjs/testing';
import { EventInvitationsService } from './event-invitations.service';
import { Repository, DeepPartial } from 'typeorm';  // ✅ Importando DeepPartial corretamente
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventInvitation, InvitationStatus } from './event-invitation.entity';
import { User } from '../users/user.entity';
import { Event } from '../events/event.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

describe('EventInvitationsService', () => {
  let service: EventInvitationsService;
  let invitationsRepository: Repository<EventInvitation>;
  let eventsRepository: Repository<Event>;
  let usersRepository: Repository<User>;
  let notificationsService: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventInvitationsService,
        {
          provide: getRepositoryToken(EventInvitation),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Event),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            sendAndSaveNotification: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EventInvitationsService>(EventInvitationsService);
    invitationsRepository = module.get<Repository<EventInvitation>>(getRepositoryToken(EventInvitation));
    eventsRepository = module.get<Repository<Event>>(getRepositoryToken(Event));
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    notificationsService = module.get<NotificationsService>(NotificationsService);

    // 🔥 Mock do método create para retornar o objeto passado (evita undefined)
    jest.spyOn(invitationsRepository, 'create').mockImplementation((invite: any) => invite);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ Criando mocks completos das entidades
  const mockUser = (): User =>
    ({
      id: 1,
      email: 'user1@email.com',
      password: 'hashedpassword',
      nickname: 'User1',
      cpf: '12345678900',
      role: 'USER',
      expoPushToken: 'token123',
      isProfileComplete: true,
      isPrivate: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      eventsCreated: [],
      sentInvitations: [],
      receivedInvitations: [],
    } as unknown as User);

  const mockEvent = (): Event =>
    ({
      id: 1,
      name: 'Evento Teste',
      description: 'Um evento teste',
      coverImage: 'cover.png',
      categories: ['Música'],
      latitude: null,
      longitude: null,
      placeName: 'Praça Central',
      eventDate: new Date(),
      startTime: '14:00',
      endTime: '18:00',
      address: 'Rua Principal, 123',
      createdAt: new Date(),
      updatedAt: new Date(),
      creatorUser: mockUser(),
      attendees: [],
      eventVisits: [],
    } as unknown as Event);

  const mockInvitation = (): EventInvitation =>
    ({
      id: 1,
      sender: mockUser(),
      receiver: mockUser(),
      event: mockEvent(),
      status: InvitationStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as unknown as EventInvitation);

  describe('sendInvites', () => {
    it('deve lançar erro se o evento não for encontrado', async () => {
      jest.spyOn(eventsRepository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.sendInvites(mockUser(), 99, [2])).rejects.toThrow(NotFoundException);
    });

    it('deve lançar erro se o usuário não tiver permissão para convidar', async () => {
      const event = { ...mockEvent(), creatorUser: { id: 99 } as User };
      jest.spyOn(eventsRepository, 'findOne').mockResolvedValueOnce(event);
      await expect(service.sendInvites(mockUser(), 1, [2])).rejects.toThrow(ForbiddenException);
    });

    it('deve enviar convites corretamente', async () => {
      const event = mockEvent();
      const receiver = { ...mockUser(), id: 2 };
      jest.spyOn(eventsRepository, 'findOne').mockResolvedValueOnce(event);
      jest.spyOn(invitationsRepository, 'find').mockResolvedValueOnce([]);
      jest.spyOn(usersRepository, 'find').mockResolvedValueOnce([receiver]);

      // ✅ Mock de save() que sempre retorna um array de convites
      jest.spyOn(invitationsRepository, 'save').mockImplementation(
        async (invites: DeepPartial<EventInvitation> | DeepPartial<EventInvitation>[]) => {
          if (Array.isArray(invites)) {
            return Promise.resolve(
              invites.map((invite) => ({
                ...mockInvitation(),
                ...invite,
                sender: mockUser(),
                receiver: { ...mockUser(), id: invite.receiver?.id ?? 0 },
                event: mockEvent(),
                createdAt: new Date(),
                updatedAt: new Date(),
              }))
            ) as any; // Forçando o cast para any para evitar conflito de tipagem
          }
          return Promise.resolve([
            {
              ...mockInvitation(),
              ...invites,
              sender: mockUser(),
              receiver: { ...mockUser(), id: invites.receiver?.id ?? 0 },
              event: mockEvent(),
              createdAt: new Date(),
              updatedAt: new Date(),
            }
          ]) as any;
        }
      );

      await service.sendInvites(mockUser(), 1, [2]);

      expect(invitationsRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('respondToInvitation', () => {
    it('deve lançar erro se o convite não for encontrado', async () => {
      jest.spyOn(invitationsRepository, 'findOne').mockResolvedValueOnce(null);
      await expect(service.respondToInvitation(99, 1, true)).rejects.toThrow(NotFoundException);
    });

    it('deve lançar erro se o usuário não for o destinatário', async () => {
      const invitation = { ...mockInvitation(), receiver: { id: 99 } as User };
      jest.spyOn(invitationsRepository, 'findOne').mockResolvedValueOnce(invitation);
      await expect(service.respondToInvitation(1, 1, true)).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar erro se o convite já foi respondido', async () => {
      const invitation = { ...mockInvitation(), status: InvitationStatus.ACCEPTED };
      jest.spyOn(invitationsRepository, 'findOne').mockResolvedValueOnce(invitation);
      await expect(service.respondToInvitation(1, 1, true)).rejects.toThrow(BadRequestException);
    });

    it('deve aceitar convite corretamente', async () => {
      const invitation = mockInvitation();
      jest.spyOn(invitationsRepository, 'findOne').mockResolvedValueOnce(invitation);
      jest.spyOn(eventsRepository, 'findOne').mockResolvedValueOnce(mockEvent());
      jest.spyOn(invitationsRepository, 'save').mockResolvedValueOnce(invitation);
      await service.respondToInvitation(1, 1, true);
      expect(invitationsRepository.save).toHaveBeenCalled();
    });
  });
});
