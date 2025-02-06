import { Test, TestingModule } from '@nestjs/testing';
import { DirectChatController } from './direct-chat.controller';
import { DirectChatService } from './direct-chat.service';
import { BadRequestException } from '@nestjs/common';
import { DirectMessageEntity } from './direct-message.entity';

describe('DirectChatController', () => {
  let controller: DirectChatController;
  let service: DirectChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DirectChatController],
      providers: [
        {
          provide: DirectChatService,
          useValue: {
            getConversations: jest.fn(),
            getMessagesBetweenUsers: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DirectChatController>(DirectChatController);
    service = module.get<DirectChatService>(DirectChatService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockMessage = (): DirectMessageEntity => ({
    id: '1',
    senderId: 1,
    receiverId: 2,
    content: 'Oi!',
    timestamp: new Date(),
    sender: { id: 1, nickname: 'User1', avatar: 'avatar1.png' } as any, // Simula relação ManyToOne
    receiver: { id: 2, nickname: 'User2', avatar: 'avatar2.png' } as any,
  });

  describe('getConversations', () => {
    it('deve retornar conversas do usuário', async () => {
      const mockConversations = [
        { otherUserId: 2, lastMessage: 'Oi!', lastMessageTime: new Date(), nickname: 'User2', avatar: 'avatar2.png' },
      ];

      jest.spyOn(service, 'getConversations').mockResolvedValueOnce(mockConversations);

      const result = await controller.getConversations(1);

      expect(result).toEqual(mockConversations);
      expect(service.getConversations).toHaveBeenCalledWith(1);
    });

    it('deve lançar erro se o userId não for fornecido', async () => {
      await expect(controller.getConversations(undefined)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getHistory', () => {
    it('deve retornar o histórico de mensagens entre dois usuários', async () => {
      const mockMessages = [mockMessage(), mockMessage()]; // Agora as mensagens possuem a estrutura correta

      jest.spyOn(service, 'getMessagesBetweenUsers').mockResolvedValueOnce(mockMessages);

      const result = await controller.getHistory(1, 2);

      expect(result).toEqual(mockMessages);
      expect(service.getMessagesBetweenUsers).toHaveBeenCalledWith(1, 2);
    });
  });
});
