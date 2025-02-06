// src/chat/chat.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatMessageEntity } from './chat-message.entity';

export interface ChatMessage {
  id: string;
  eventId: number;
  senderId: number;
  senderName: string;
  content: string;
  timestamp: Date;
  reactions?: { [emoji: string]: number };
}

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(ChatMessageEntity)
    private chatMessageRepository: Repository<ChatMessageEntity>,
  ) {}

  async getMessagesForEvent(eventId: number): Promise<ChatMessage[]> {
    this.logger.debug(`Buscando mensagens para o evento: ${eventId}`);
    const messages = await this.chatMessageRepository.find({
      where: { eventId },
      order: { timestamp: 'ASC' },
    });
    this.logger.debug(`Recuperado ${messages.length} mensagens para o evento ${eventId}`);
    return messages;
  }

  async addMessage(message: ChatMessage): Promise<void> {
    const exists = await this.chatMessageRepository.findOne({ where: { id: message.id } });
    if (!exists) {
      const newMessage = this.chatMessageRepository.create(message);
      await this.chatMessageRepository.save(newMessage);
      this.logger.debug(`Mensagem adicionada: ${newMessage.id}`);
    } else {
      this.logger.warn(`Tentativa de adicionar mensagem duplicada: ${message.id}`);
    }
  }
}
