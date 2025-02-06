// src/chat/chat.controller.ts

import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatMessage } from './chat.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('events/:eventId/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('preview')
  @UseGuards(AuthGuard('jwt'))
  async getChatPreview(@Param('eventId') eventId: string): Promise<{ messages: ChatMessage[] }> {
    console.log('Recebendo solicitações para o evento:', eventId);
    const messages = await this.chatService.getMessagesForEvent(Number(eventId));
    const lastMessages = messages.slice(-3);
    return { messages: lastMessages };
  }
}
