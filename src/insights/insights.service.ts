// src/insights/insights.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { EventsService } from '../events/events.service';

@Injectable()
export class InsightsService {
  constructor(private readonly eventsService: EventsService) {}

  /**
   * 🔹 Obtém o histórico de visitas agregadas por hora para um evento.
   * @param eventId ID do evento.
   */
  async getEventVisitInsights(eventId: number): Promise<{ hour: number; count: number }[]> {
    return this.eventsService.getVisitHistory(eventId);
  }
}
