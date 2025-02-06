// src/search/search.controller.ts

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from '../users/users.service';
import { EventsService } from '../events/events.service';
import { Like } from 'typeorm';

@UseGuards(AuthGuard('jwt'))
@Controller('search')
export class SearchController {
  constructor(
    private readonly usersService: UsersService,
    private readonly eventsService: EventsService
  ) {}

  @Get()
  async search(@Query('q') term: string) {
    // Se não enviou nada no query
    if (!term) {
      return { users: [], events: [] };
    }

    // Busque usuários
    const users = await this.usersService.searchUsersByNickname(term);
    // Busque eventos
    const events = await this.eventsService.searchEventsByName(term);

    return {
      users,
      events,
    };
  }
}
