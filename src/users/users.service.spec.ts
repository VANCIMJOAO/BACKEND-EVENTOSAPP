import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { FriendRequestsService } from './friend-requests/friend-requests.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UserProfileDto } from './dto/user-profile.dto';
import { plainToInstance } from 'class-transformer';
import * as argon2 from 'argon2';
import { UserRole } from './dto/user-role.enum';
import { Event } from '../events/event.entity';

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: Repository<User>;
  let eventsRepository: Repository<Event>;
  let friendRequestsService: FriendRequestsService;
  let notificationsService: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Event), // ✅ Adicionado para corrigir erro de dependência
          useClass: Repository,
        },
        {
          provide: FriendRequestsService,
          useValue: { createRequest: jest.fn() },
        },
        {
          provide: NotificationsService,
          useValue: { createNotification: jest.fn() },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    eventsRepository = module.get<Repository<Event>>(getRepositoryToken(Event));
    friendRequestsService = module.get<FriendRequestsService>(FriendRequestsService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  const baseMockUser = {
    id: 1,
    email: 'test@example.com',
    password: '',
    nickname: 'testuser',
    friends: [],
    avatar: '',
    description: '',
    isProfileComplete: true,
    role: UserRole.USER,
    isPrivate: false,
  } as User;

  it('deve ser definido', () => {
    expect(usersService).toBeDefined();
  });

  it('deve buscar um usuário pelo ID', async () => {
    jest.spyOn(usersRepository, 'findOne').mockResolvedValue(baseMockUser);

    const result = await usersService.findOneById(1);
    expect(result).toEqual(plainToInstance(UserProfileDto, baseMockUser));
  });

  it('deve lançar NotFoundException ao buscar um usuário inexistente', async () => {
    jest.spyOn(usersRepository, 'findOne').mockResolvedValue(null);
  
    await expect(usersService.findOneById(999)).rejects.toThrow(
      new NotFoundException(`Usuário com ID 999 não encontrado.`)
    );
  });

  it('deve adicionar um amigo', async () => {
    const user1 = { ...baseMockUser, id: 1, friends: [] };
    const user2 = { ...baseMockUser, id: 2, friends: [] };

    jest.spyOn(usersRepository, 'findOne').mockImplementation(async (options) => {
      return (options?.where as { id: number })?.id === 1 ? user1 :
             (options?.where as { id: number })?.id === 2 ? user2 : null;
    });

    jest.spyOn(usersRepository, 'save').mockImplementation(async (user) => user as User);

    await usersService.addFriend(1, 2);

    expect(user1.friends).toContain(user2);
    expect(user2.friends).toContain(user1);
  });

  it('deve lançar ForbiddenException ao adicionar a si mesmo como amigo', async () => {
    await expect(usersService.addFriend(1, 1)).rejects.toThrow(ForbiddenException);
  });

  it('deve criar um usuário corretamente', async () => {
    const hashedPassword = await argon2.hash('Test@123');
    const newUser = { ...baseMockUser, id: 2, password: hashedPassword };

    jest.spyOn(usersRepository, 'create').mockReturnValue(newUser);
    jest.spyOn(usersRepository, 'save').mockResolvedValue(newUser);

    const result = await usersService.create({
      email: 'test@example.com',
      password: 'Test@123',
      nickname: 'testuser',
      cpf: ''
    });

    expect(result).toEqual(newUser);
  });
});
