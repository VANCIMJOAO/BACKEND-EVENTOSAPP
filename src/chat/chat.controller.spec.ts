import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatMessage } from './chat.service';
import { AuthGuard } from '@nestjs/passport';

describe('ChatController', () => {
  let controller: ChatController;
  let service: ChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: {
            getMessagesForEvent: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt')) // Simula o AuthGuard
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<ChatController>(ChatController);
    service = module.get<ChatService>(ChatService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Limpa os mocks entre os testes
  });

  const mockMessage = (): ChatMessage => ({
    id: '1',
    eventId: 1,
    senderId: 123,
    senderName: 'User1',
    content: 'Hello, world!',
    timestamp: new Date(),
    reactions: {},
  });

  describe('getChatPreview', () => {
    it('deve retornar os 3 últimos messages', async () => {
      const messages = [mockMessage(), mockMessage(), mockMessage(), mockMessage()];
      jest.spyOn(service, 'getMessagesForEvent').mockResolvedValueOnce(messages);

      const result = await controller.getChatPreview('1');

      expect(result.messages.length).toBe(3);
      expect(result.messages).toEqual(messages.slice(-3));
      expect(service.getMessagesForEvent).toHaveBeenCalledWith(1);
    });

    it('deve retornar menos de 3 mensagens se houver menos', async () => {
      const messages = [mockMessage(), mockMessage()];
      jest.spyOn(service, 'getMessagesForEvent').mockResolvedValueOnce(messages);

      const result = await controller.getChatPreview('1');

      expect(result.messages.length).toBe(2);
      expect(result.messages).toEqual(messages);
      expect(service.getMessagesForEvent).toHaveBeenCalledWith(1);
    });

    it('deve retornar array vazio se não houver mensagens', async () => {
      jest.spyOn(service, 'getMessagesForEvent').mockResolvedValueOnce([]);

      const result = await controller.getChatPreview('1');

      expect(result.messages.length).toBe(0);
      expect(result.messages).toEqual([]);
      expect(service.getMessagesForEvent).toHaveBeenCalledWith(1);
    });
  });
});
