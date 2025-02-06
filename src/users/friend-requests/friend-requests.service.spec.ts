import { Test, TestingModule } from '@nestjs/testing';
import { FriendRequestsService } from './friend-requests.service';
import { Repository, DataSource, EntityManager } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { FriendRequest, FriendRequestStatus } from './friend-request.entity';
import { User } from '../user.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('FriendRequestsService', () => {
  let service: FriendRequestsService;
  let friendRequestRepo: Repository<FriendRequest>;
  let userRepo: Repository<User>;
  let dataSource: DataSource;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FriendRequestsService,
        {
          provide: getRepositoryToken(FriendRequest),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneBy: jest.fn(),
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          // Usando DataSource (TypeORM v0.3+)
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FriendRequestsService>(FriendRequestsService);
    friendRequestRepo = module.get<Repository<FriendRequest>>(getRepositoryToken(FriendRequest));
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    dataSource = module.get<DataSource>(DataSource);
  });

  // Reinicia os mocks após cada teste para evitar interferências
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Funções helper para criar mocks “frescos”
  const createMockUser = (id: number, nickname: string): User => ({
    id,
    nickname,
    friends: [],
  } as User);

  const createMockFriendRequest = (): FriendRequest => ({
    id: 1,
    sender: createMockUser(1, 'User1'),
    receiver: createMockUser(2, 'User2'),
    status: FriendRequestStatus.PENDING,
    createdAt: new Date(),
  } as FriendRequest);

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  it('deve criar uma solicitação de amizade', async () => {
    const mockUser = createMockUser(1, 'User1');
    const mockUser2 = createMockUser(2, 'User2');

    // Simula a busca dos usuários
    jest.spyOn(userRepo, 'findOneBy').mockResolvedValueOnce(mockUser);
    jest.spyOn(userRepo, 'findOneBy').mockResolvedValueOnce(mockUser2);
    // Simula que não há solicitação pendente
    jest.spyOn(friendRequestRepo, 'findOne').mockResolvedValueOnce(null);
    // Simula o salvamento da nova solicitação
    const mockFriendRequest = createMockFriendRequest();
    jest.spyOn(friendRequestRepo, 'save').mockResolvedValueOnce(mockFriendRequest);

    const result = await service.createRequest(1, 2);
    expect(result).toEqual(mockFriendRequest);
  });

  it('deve lançar erro ao enviar solicitação para si mesmo', async () => {
    await expect(service.createRequest(1, 1)).rejects.toThrow(ForbiddenException);
  });

  it('deve lançar erro ao tentar criar uma solicitação para usuário inexistente', async () => {
    // Simula que o usuário receptor não existe
    jest.spyOn(userRepo, 'findOneBy').mockResolvedValueOnce(null);
    await expect(service.createRequest(1, 999)).rejects.toThrow(NotFoundException);
  });

  it('deve lançar erro ao criar uma solicitação já existente', async () => {
    const mockUser = createMockUser(1, 'User1');
    const mockUser2 = createMockUser(2, 'User2');
    const mockFriendRequest = createMockFriendRequest();
    jest.spyOn(userRepo, 'findOneBy').mockResolvedValueOnce(mockUser);
    jest.spyOn(userRepo, 'findOneBy').mockResolvedValueOnce(mockUser2);
    jest.spyOn(friendRequestRepo, 'findOne').mockResolvedValueOnce(mockFriendRequest);
    await expect(service.createRequest(1, 2)).rejects.toThrow(ForbiddenException);
  });

  it('deve aceitar uma solicitação de amizade', async () => {
    const mockFriendRequest = createMockFriendRequest();
    // Simula o EntityManager usado na transação
    const mockEntityManager = {
      findOne: jest.fn().mockResolvedValue(mockFriendRequest),
      save: jest.fn().mockResolvedValue({ ...mockFriendRequest, status: FriendRequestStatus.ACCEPTED }),
    } as unknown as EntityManager;

    // Utiliza mockImplementationOnce para garantir que esta implementação seja usada apenas neste teste
    jest.spyOn(dataSource, 'transaction').mockImplementationOnce(
      async (...args: any[]) => {
        const cb = args.length === 1 ? args[0] : args[1];
        return await cb(mockEntityManager);
      }
    );

    const result = await service.acceptRequest(1, 2);
    expect(result.status).toBe(FriendRequestStatus.ACCEPTED);
  });

  it('deve rejeitar uma solicitação de amizade', async () => {
    const mockFriendRequest = createMockFriendRequest();
    const mockEntityManager = {
      findOne: jest.fn().mockResolvedValue(mockFriendRequest),
      save: jest.fn().mockResolvedValue({ ...mockFriendRequest, status: FriendRequestStatus.REJECTED }),
    } as unknown as EntityManager;

    jest.spyOn(dataSource, 'transaction').mockImplementationOnce(
      async (...args: any[]) => {
        const cb = args.length === 1 ? args[0] : args[1];
        return await cb(mockEntityManager);
      }
    );

    const result = await service.rejectRequest(1, 2);
    expect(result.status).toBe(FriendRequestStatus.REJECTED);
  });

  it('deve buscar solicitações recebidas', async () => {
    const mockFriendRequest = createMockFriendRequest();
    jest.spyOn(friendRequestRepo, 'find').mockResolvedValueOnce([mockFriendRequest]);
    const result = await service.getReceivedRequests(2);
    expect(result).toEqual([mockFriendRequest]);
  });
});
