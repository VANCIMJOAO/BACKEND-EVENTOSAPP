import { Test, TestingModule } from '@nestjs/testing';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { AuthGuard } from '@nestjs/passport';
import { NotFoundException } from '@nestjs/common';

describe('InsightsController', () => {
  let controller: InsightsController;
  let insightsService: InsightsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsightsController],
      providers: [
        {
          provide: InsightsService,
          useValue: {
            getEventVisitInsights: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard('jwt'))
      .useValue({ canActivate: jest.fn(() => true) }) // 🔹 Mock do AuthGuard para ignorar autenticação nos testes
      .compile();

    controller = module.get<InsightsController>(InsightsController);
    insightsService = module.get<InsightsService>(InsightsService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('getEventVisitInsights', () => {
    it('deve retornar insights de visitas para um evento existente', async () => {
      const mockInsights = [
        { hour: 10, count: 5 },
        { hour: 11, count: 8 },
      ];
      jest.spyOn(insightsService, 'getEventVisitInsights').mockResolvedValue(mockInsights);

      const result = await controller.getEventVisitInsights(1);

      expect(result).toEqual(mockInsights);
      expect(insightsService.getEventVisitInsights).toHaveBeenCalledWith(1);
    });

    it('deve lançar NotFoundException se o evento não existir', async () => {
      jest.spyOn(insightsService, 'getEventVisitInsights').mockRejectedValue(new NotFoundException());

      await expect(controller.getEventVisitInsights(999)).rejects.toThrow(NotFoundException);
    });
  });
});
