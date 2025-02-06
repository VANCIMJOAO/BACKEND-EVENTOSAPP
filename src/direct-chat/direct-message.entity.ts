import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne
} from 'typeorm';
import { User } from '../users/user.entity';


@Entity('direct_messages')
export class DirectMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.sentMessages, { eager: false })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedMessages, { eager: false })
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Column()
  senderId: number;

  @Column()
  receiverId: number;

  @Column('text')
  content: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  timestamp: Date;
}

