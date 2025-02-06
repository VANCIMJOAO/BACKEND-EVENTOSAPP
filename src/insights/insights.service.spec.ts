import { Test, TestingModule } from '@nestjs/testing';
import { InsightsService } from './insights.service';
import { EventsService } from '../events/events.service';
import { NotFoundException } from '@nestjs/common';

describe('InsightsService', () => {
  let service: InsightsService;
  let eventsService: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsightsService,
        {
          provide: EventsService,
          useValue: {
            getVisitHistory: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<InsightsService>(InsightsService);
    eventsService = module.get<EventsService>(EventsService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('getEventVisitInsights', () => {
    it('deve retornar visitas agregadas por hora', async () => {
      const mockVisitHistory = [
        { hour: 9, count: 3 },
        { hour: 10, count: 6 },
      ];
      jest.spyOn(eventsService, 'getVisitHistory').mockResolvedValue(mockVisitHistory);

      const result = await service.getEventVisitInsights(1);

      expect(result).toEqual(mockVisitHistory);
      expect(eventsService.getVisitHistory).toHaveBeenCalledWith(1);
    });

    it('deve lançar NotFoundException se o evento não existir', async () => {
      jest.spyOn(eventsService, 'getVisitHistory').mockRejectedValue(new NotFoundException());

      await expect(service.getEventVisitInsights(999)).rejects.toThrow(NotFoundException);
    });
  });
});
