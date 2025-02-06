// src/notifications/notifications.controller.ts

import { Controller, Get, Patch, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Obtém todas as notificações do usuário autenticado
   */
  @Get()
  async getUserNotifications(@Request() req) {
    const user = req.user;
    return this.notificationsService.getUserNotifications(user.id);
  }

  /**
   * Marca uma notificação como lida
   */
  @Patch(':id/read')
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    const user = req.user;
    await this.notificationsService.markAsRead(user.id, id);
    return { message: 'Notificação marcada como lida.' };
  }
}
