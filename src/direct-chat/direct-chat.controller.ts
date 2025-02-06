// src/direct-chat/direct-chat.controller.ts
import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { DirectChatService } from './direct-chat.service';

@Controller('direct-chat')
export class DirectChatController {
  constructor(private readonly directChatService: DirectChatService) {}

  @Get('conversations')
  async getConversations(@Query('userId') userId: number) {
    if (!userId) {
      throw new BadRequestException('UserId is required');
    }
    return this.directChatService.getConversations(userId);
  }

  @Get('history')
  async getHistory(@Query('userA') userA: number, @Query('userB') userB: number) {
    return this.directChatService.getMessagesBetweenUsers(userA, userB);
  }
}
