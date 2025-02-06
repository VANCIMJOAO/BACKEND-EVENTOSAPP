// src/events/event-visit.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Event } from './event.entity';

@Entity()
@Unique(['event', 'user']) // Garante que cada par evento-usuário seja único
export class EventVisit {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Event, (event) => event.eventVisits, { onDelete: 'CASCADE' })
  event: Event;

  @ManyToOne(() => User, (user) => user.eventVisits, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  visitedAt: Date;
}
