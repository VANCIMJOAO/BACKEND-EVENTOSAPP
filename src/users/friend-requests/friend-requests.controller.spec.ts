import { Test, TestingModule } from '@nestjs/testing';
import { FriendRequestsController } from './friend-requests.controller';
import { FriendRequestsService } from './friend-requests.service';
import { Request } from 'express';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { FriendRequest, FriendRequestStatus } from './friend-request.entity';
import { User } from '../user.entity';

describe('FriendRequestsController', () => {
  let controller: FriendRequestsController;
  let service: FriendRequestsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FriendRequestsController],
      providers: [
        {
          provide: FriendRequestsService,
          useValue: {
            createRequest: jest.fn(),
            getReceivedRequests: jest.fn(),
            acceptRequest: jest.fn(),
            rejectRequest: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<FriendRequestsController>(FriendRequestsController);
    service = module.get<FriendRequestsService>(FriendRequestsService);
  });

  // ✅ Criamos um usuário mockado
  const mockUser: User = {
    id: 1,
    nickname: 'User1',
    avatar: '',
    friends: [],
  } as User;

  const mockUser2: User = {
    id: 2,
    nickname: 'User2',
    avatar: '',
    friends: [],
  } as User;

  // ✅ Criamos uma solicitação de amizade mockada completa
  const mockFriendRequest: FriendRequest = {
    id: 1,
    sender: mockUser2, // Quem enviou
    receiver: mockUser, // Quem recebeu
    status: FriendRequestStatus.PENDING,
    createdAt: new Date(),
  } as FriendRequest;

  // ✅ Corrigimos o mockRequest com `as unknown as Request`
  const mockRequest = {
    user: { id: 1, nickname: 'User1' },
  } as unknown as Request;

  it('deve ser definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve criar uma solicitação de amizade', async () => {
    jest.spyOn(service, 'createRequest').mockResolvedValue(mockFriendRequest);

    const result = await controller.createRequest(mockRequest, '2');
    expect(result).toEqual(mockFriendRequest);
  });

  it('deve buscar solicitações recebidas', async () => {
    jest.spyOn(service, 'getReceivedRequests').mockResolvedValue([mockFriendRequest]);

    const result = await controller.getReceived(mockRequest);
    expect(result).toHaveLength(1);
    expect(result[0].message).toContain('User2 enviou uma solicitação de amizade.');
  });

  it('deve aceitar uma solicitação de amizade', async () => {
    jest.spyOn(service, 'acceptRequest').mockResolvedValue(mockFriendRequest);

    const result = await controller.acceptRequest(mockRequest, '1');
    expect(result).toEqual(mockFriendRequest);
  });

  it('deve rejeitar uma solicitação de amizade', async () => {
    jest.spyOn(service, 'rejectRequest').mockResolvedValue(mockFriendRequest);

    const result = await controller.rejectRequest(mockRequest, '1');
    expect(result).toEqual(mockFriendRequest);
  });

  it('deve lançar erro ao tentar aceitar solicitação inexistente', async () => {
    jest.spyOn(service, 'acceptRequest').mockRejectedValue(new NotFoundException());

    await expect(controller.acceptRequest(mockRequest, '999')).rejects.toThrow(NotFoundException);
  });
});
