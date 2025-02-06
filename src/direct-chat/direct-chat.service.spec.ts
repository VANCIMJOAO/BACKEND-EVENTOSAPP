import { Test, TestingModule } from '@nestjs/testing';
import { DirectChatService } from './direct-chat.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DirectMessageEntity } from './direct-message.entity';

describe('DirectChatService', () => {
  let service: DirectChatService;
  let directMessageRepo: Repository<DirectMessageEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DirectChatService,
        {
          provide: getRepositoryToken(DirectMessageEntity),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnThis(),
              leftJoin: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              groupBy: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              setParameter: jest.fn().mockReturnThis(),
              getRawMany: jest.fn().mockResolvedValue([]),
            }),
          },
        },
      ],
    }).compile();

    service = module.get<DirectChatService>(DirectChatService);
    directMessageRepo = module.get<Repository<DirectMessageEntity>>(getRepositoryToken(DirectMessageEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockMessage = (): DirectMessageEntity => ({
    id: '1',
    senderId: 1,
    receiverId: 2,
    content: 'Olá!',
    timestamp: new Date(),
  } as DirectMessageEntity);

  describe('getMessagesBetweenUsers', () => {
    it('deve retornar mensagens entre dois usuários', async () => {
      const messages = [mockMessage(), mockMessage()];
      jest.spyOn(directMessageRepo, 'find').mockResolvedValueOnce(messages);

      const result = await service.getMessagesBetweenUsers(1, 2);

      expect(result).toEqual(messages);
      expect(directMessageRepo.find).toHaveBeenCalledWith({
        where: [
          { senderId: 1, receiverId: 2 },
          { senderId: 2, receiverId: 1 },
        ],
        order: { timestamp: 'ASC' },
      });
    });

    it('deve retornar um array vazio se não houver mensagens', async () => {
      jest.spyOn(directMessageRepo, 'find').mockResolvedValueOnce([]);

      const result = await service.getMessagesBetweenUsers(1, 2);

      expect(result).toEqual([]);
      expect(directMessageRepo.find).toHaveBeenCalled();
    });
  });

  describe('addMessage', () => {
    it('deve adicionar uma nova mensagem', async () => {
      const newMessage = mockMessage();
      jest.spyOn(directMessageRepo, 'create').mockReturnValue(newMessage);
      jest.spyOn(directMessageRepo, 'save').mockResolvedValueOnce(newMessage);

      const result = await service.addMessage(newMessage);

      expect(directMessageRepo.create).toHaveBeenCalledWith(newMessage);
      expect(directMessageRepo.save).toHaveBeenCalledWith(newMessage);
      expect(result).toEqual(newMessage);
    });
  });

  describe('getConversations', () => {
    it('deve retornar as conversas do usuário', async () => {
      const mockConversations = [
        { otherUserId: 2, lastMessage: 'Oi!', lastMessageTime: new Date(), nickname: 'User2', avatar: 'avatar2.png' },
        { otherUserId: 3, lastMessage: 'E aí?', lastMessageTime: new Date(), nickname: 'User3', avatar: 'avatar3.png' },
      ];

      jest.spyOn(directMessageRepo.createQueryBuilder(), 'getRawMany').mockResolvedValueOnce(mockConversations);

      const result = await service.getConversations(1);

      expect(result).toEqual([
        { otherUserId: 2, lastMessage: 'Oi!', lastMessageTime: expect.any(Date), nickname: 'User2', avatar: 'avatar2.png' },
        { otherUserId: 3, lastMessage: 'E aí?', lastMessageTime: expect.any(Date), nickname: 'User3', avatar: 'avatar3.png' },
      ]);
    });

    it('deve retornar um array vazio se não houver conversas', async () => {
      jest.spyOn(directMessageRepo.createQueryBuilder(), 'getRawMany').mockResolvedValueOnce([]);

      const result = await service.getConversations(1);

      expect(result).toEqual([]);
    });
  });
});
