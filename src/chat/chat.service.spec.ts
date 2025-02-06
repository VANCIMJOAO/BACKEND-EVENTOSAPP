import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ChatMessageEntity } from './chat-message.entity';

describe('ChatService', () => {
  let service: ChatService;
  let chatMessageRepository: Repository<ChatMessageEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: getRepositoryToken(ChatMessageEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    chatMessageRepository = module.get<Repository<ChatMessageEntity>>(getRepositoryToken(ChatMessageEntity));
  });

  afterEach(() => {
    jest.clearAllMocks(); // Limpa os mocks entre os testes
  });

  const mockMessage = (): ChatMessageEntity => ({
    id: '1',
    eventId: 1,
    senderId: 123,
    senderName: 'User1',
    content: 'Hello, world!',
    timestamp: new Date(),
    reactions: {},
  } as ChatMessageEntity);

  describe('getMessagesForEvent', () => {
    it('deve retornar mensagens de um evento', async () => {
      const mockMessages = [mockMessage(), mockMessage()];
      jest.spyOn(chatMessageRepository, 'find').mockResolvedValueOnce(mockMessages);

      const result = await service.getMessagesForEvent(1);

      expect(result).toEqual(mockMessages);
      expect(chatMessageRepository.find).toHaveBeenCalledWith({
        where: { eventId: 1 },
        order: { timestamp: 'ASC' },
      });
    });

    it('deve retornar um array vazio quando não houver mensagens', async () => {
      jest.spyOn(chatMessageRepository, 'find').mockResolvedValueOnce([]);

      const result = await service.getMessagesForEvent(2);

      expect(result).toEqual([]);
      expect(chatMessageRepository.find).toHaveBeenCalled();
    });
  });

  describe('addMessage', () => {
    it('deve adicionar uma nova mensagem', async () => {
      const newMessage = mockMessage();
      jest.spyOn(chatMessageRepository, 'findOne').mockResolvedValueOnce(null);
      jest.spyOn(chatMessageRepository, 'create').mockReturnValue(newMessage);
      jest.spyOn(chatMessageRepository, 'save').mockResolvedValueOnce(newMessage);

      await service.addMessage(newMessage);

      expect(chatMessageRepository.findOne).toHaveBeenCalledWith({ where: { id: newMessage.id } });
      expect(chatMessageRepository.create).toHaveBeenCalledWith(newMessage);
      expect(chatMessageRepository.save).toHaveBeenCalledWith(newMessage);
    });

    it('não deve adicionar uma mensagem duplicada', async () => {
      const existingMessage = mockMessage();
      jest.spyOn(chatMessageRepository, 'findOne').mockResolvedValueOnce(existingMessage);

      await service.addMessage(existingMessage);

      expect(chatMessageRepository.findOne).toHaveBeenCalledWith({ where: { id: existingMessage.id } });
      expect(chatMessageRepository.create).not.toHaveBeenCalled();
      expect(chatMessageRepository.save).not.toHaveBeenCalled();
    });
  });
});
