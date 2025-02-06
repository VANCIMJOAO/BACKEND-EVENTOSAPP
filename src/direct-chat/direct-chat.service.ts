// src/direct-chat/direct-chat.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DirectMessageEntity } from './direct-message.entity';

export interface DirectChatMessage {
  senderId: number;
  receiverId: number;
  content: string;
  timestamp: Date;
}

@Injectable()
export class DirectChatService {
  constructor(
    @InjectRepository(DirectMessageEntity)
    private directMessageRepo: Repository<DirectMessageEntity>,
  ) {}

  async getMessagesBetweenUsers(userA: number, userB: number): Promise<DirectMessageEntity[]> {
    return this.directMessageRepo.find({
      where: [
        { senderId: userA, receiverId: userB },
        { senderId: userB, receiverId: userA },
      ],
      order: { timestamp: 'ASC' },
    });
  }

  async addMessage(message: DirectChatMessage): Promise<DirectMessageEntity> {
    const newMsg = this.directMessageRepo.create(message);
    const savedMsg = await this.directMessageRepo.save(newMsg);
    return savedMsg;
  }

  async getConversations(userId: number) {
    const conversations = await this.directMessageRepo
      .createQueryBuilder('message')
      .select([
        `CASE WHEN message."senderId" = :userId THEN message."receiverId" ELSE message."senderId" END AS "otherUserId"`,
        `MAX(message.timestamp) AS "lastMessageTime"`,
        `(SELECT dm.content FROM direct_messages dm 
          WHERE (dm."senderId" = message."senderId" AND dm."receiverId" = message."receiverId")
             OR (dm."senderId" = message."receiverId" AND dm."receiverId" = message."senderId")
          ORDER BY dm.timestamp DESC LIMIT 1) AS "lastMessage"`,
      ])
      .leftJoin('User', 'user', `user.id = 
        CASE WHEN message."senderId" = :userId THEN message."receiverId" ELSE message."senderId" END`)
      .where(`message."senderId" = :userId OR message."receiverId" = :userId`, { userId })
      .groupBy(`CASE WHEN message."senderId" = :userId THEN message."receiverId" ELSE message."senderId" END, user.nickname, user.avatar`)
      .orderBy('"lastMessageTime"', 'DESC')
      .setParameter('userId', userId)
      .getRawMany();

    return conversations.map((conv) => ({
      otherUserId: Number(conv.otherUserId),
      lastMessageTime: conv.lastMessageTime,
      lastMessage: conv.lastMessage,
      nickname: conv.nickname,
      avatar: conv.avatar,
    }));
  }
}
