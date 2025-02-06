// src/insights/insights.controller.ts

import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  /**
   * 🔹 Endpoint para obter engajamento por hora de um evento.
   * GET /insights/events/:id/visits
   */
  @Get('events/:id/visits')
  async getEventVisitInsights(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ hour: number; count: number }[]> {
    return this.insightsService.getEventVisitInsights(id);
  }
}
