import { Test, TestingModule } from '@nestjs/testing';
import { EventInvitationsController } from './event-invitations.controller';
import { EventInvitationsService } from './event-invitations.service';
import { BadRequestException } from '@nestjs/common';

describe('EventInvitationsController', () => {
  let controller: EventInvitationsController;
  let service: EventInvitationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventInvitationsController],
      providers: [
        {
          provide: EventInvitationsService,
          useValue: {
            sendInvites: jest.fn(),
            getUserInvitations: jest.fn(),
            respondToInvitation: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<EventInvitationsController>(EventInvitationsController);
    service = module.get<EventInvitationsService>(EventInvitationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendInvites', () => {
    it('deve enviar convites corretamente', async () => {
      jest.spyOn(service, 'sendInvites').mockResolvedValueOnce(undefined);

      const result = await controller.sendInvites(1, [2, 3], { user: { id: 1 } });

      expect(result).toEqual({ message: 'Convites enviados com sucesso.' });
      expect(service.sendInvites).toHaveBeenCalledWith({ id: 1 }, 1, [2, 3]);
    });

    it('deve lançar erro se friendIds não for um array de números', async () => {
      await expect(controller.sendInvites(1, 'invalid' as any, { user: { id: 1 } })).rejects.toThrow(BadRequestException);
    });
  });

  describe('respondToInvitation', () => {
    it('deve responder a um convite corretamente', async () => {
      jest.spyOn(service, 'respondToInvitation').mockResolvedValueOnce(undefined);

      const result = await controller.respondToInvitation(1, true, { user: { id: 1 } });

      expect(result).toEqual({ message: 'Resposta ao convite registrada.' });
      expect(service.respondToInvitation).toHaveBeenCalledWith(1, 1, true);
    });
  });
});
