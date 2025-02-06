// src/chat/chat.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatMessageEntity } from './chat-message.entity';
import { ChatController } from './chat.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessageEntity]),
    AuthModule, // Se precisar de autenticação no controller
  ],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
  exports: [ChatService], // Exporta o ChatService para outros módulos
})
export class ChatModule {}
