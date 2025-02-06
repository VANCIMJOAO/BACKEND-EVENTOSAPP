// src/event-invitations/event-invitations.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe,
  ParseArrayPipe,
  BadRequestException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { EventInvitationsService } from './event-invitations.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('event-invitations')
export class EventInvitationsController {
  private readonly logger = new Logger(EventInvitationsController.name);

  constructor(private readonly invitationsService: EventInvitationsService) {}

  @Post(':eventId/invite')
  async sendInvites(
    @Param('eventId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) eventId: number,
    @Body('friendIds', new ParseArrayPipe({ items: Number, separator: ',' })) friendIds: number[],
    @Request() req,
  ): Promise<{ message: string }> {
    this.logger.log(`Convites enviados para o evento ID: ${eventId}, com amigos: ${friendIds}`);

    if (!friendIds || !Array.isArray(friendIds) || friendIds.some((id) => typeof id !== 'number')) {
      throw new BadRequestException('friendIds deve ser um array de números.');
    }

    const user = req.user;
    await this.invitationsService.sendInvites(user, eventId, friendIds);
    return { message: 'Convites enviados com sucesso.' };
  }

  @Get('invitations')
  async getUserInvitations(@Request() req) {
    this.logger.log('Requisição para buscar convites.');
    const userId = req.user?.id || req.user?.sub;

    if (!userId || isNaN(Number(userId))) {
      throw new BadRequestException('Invalid user ID format');
    }

    try {
      const invitations = await this.invitationsService.getUserInvitations(Number(userId));
      this.logger.log(`Convites encontrados: ${JSON.stringify(invitations.map((i) => i.id))}`);
      return invitations.map((invitation) => ({
        id: invitation.id,
        type: 'EVENT_INVITATION',
        message: `${invitation.sender.nickname} convidou você para o evento "${invitation.event.name}"`,
        data: {
          eventId: invitation.event.id,
          invitationId: invitation.id,
        },
        createdAt: invitation.createdAt,
        status: invitation.status,
        sender: {
          id: invitation.sender.id,
          nickname: invitation.sender.nickname,
          avatar: invitation.sender.avatar,
        },
      }));
    } catch (error) {
      this.logger.error(`Erro ao buscar convites: ${error.message}`);
      throw new BadRequestException('Error fetching invitations');
    }
  }

  @Patch('invitations/:id')
  async respondToInvitation(
    @Param('id', ParseIntPipe) id: number,
    @Body('accept') accept: boolean,
    @Request() req,
  ): Promise<{ message: string }> {
    const userId = req.user?.id;
    this.logger.log(`Usuário ID ${userId} respondendo ao convite ID ${id}, aceito: ${accept}`);
    await this.invitationsService.respondToInvitation(id, userId, accept);
    return { message: 'Resposta ao convite registrada.' };
  }
}
