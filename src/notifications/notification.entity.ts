// src/notifications/notification.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

export enum NotificationType {
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  EVENT_INVITATION = 'EVENT_INVITATION',
  MESSAGE = 'MESSAGE',
  EVENT_ATTENDANCE = 'EVENT_ATTENDANCE',
  EVENT_UPDATE = 'EVENT_UPDATE'
}

export enum NotificationStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.receivedNotifications, { eager: true })
  receiver: User;

  @ManyToOne(() => User, { nullable: true, eager: true })
  sender: User | null;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column('varchar', { nullable: false, length: 255, default: '' }) // Valor padrão
  message: string;
  

  @Column('json', { nullable: true })
  data: {
    eventId?: number;
    invitationId?: number;
    friendRequestId?: number;
    userId?: number; // Adicionado
  };
  

  @Column({
    type: 'enum',
    enum: NotificationStatus,
    default: NotificationStatus.UNREAD,
  })
  status: NotificationStatus;

  @CreateDateColumn()
  createdAt: Date;

  
}
