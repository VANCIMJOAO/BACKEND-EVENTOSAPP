// src/marketing/marketing.controller.ts

import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { MarketingService } from './marketing.service';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/dto/user-role.enum';
import { User } from '../users/user.entity';

@Controller('marketing')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class MarketingController {
  constructor(private readonly marketingService: MarketingService) {}

  /**
   * 🔹 Retorna todos os participantes confirmados nos eventos
   * do usuário ORGANIZER ou, se ADMIN, de todos os eventos.
   * (paginado / forma “antiga”)
   * Ex: GET /marketing/participants?page=1&limit=20
   */
  @Get('participants')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  async getAllConfirmedParticipants(
    @Req() req: Request,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    // Casting para a sua entidade User
    const user = req.user as User;

    return this.marketingService.findAllConfirmedParticipants(user, {
      page: +page,
      limit: +limit,
    });
  }

  /**
   * 🔹 Retorna eventos e seus participantes confirmados (cada evento em um bloco),
   * para ADMIN ou ORGANIZER.
   * GET /marketing/participants/grouped
   */
  @Get('participants/grouped')
  @Roles(UserRole.ADMIN, UserRole.ORGANIZER)
  async getGroupedParticipants(@Req() req: Request) {
    const user = req.user as User;

    return this.marketingService.findAllParticipantsGrouped(user);
  }
}
