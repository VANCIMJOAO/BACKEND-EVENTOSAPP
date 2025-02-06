// src/chat/entities/chat-message.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('chat_messages')
export class ChatMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  eventId: number;

  @Column()
  senderId: number;

  @Column()
  senderName: string;

  @Column('text')
  content: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  timestamp: Date;

  @Column({ type: 'jsonb', nullable: true })
  reactions?: { [emoji: string]: number };
}
