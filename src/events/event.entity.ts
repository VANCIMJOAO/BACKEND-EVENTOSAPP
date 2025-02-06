// src/events/event.entity.ts

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { EventInvitation } from '../event-invitations/event-invitation.entity';
import { EventVisit } from './event-visit.entity'; // Importa a nova entidade

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // Nome do Evento (obrigatório)

  @Column('text')
  description: string; // Descrição do Evento

  @Column({ nullable: true })
  coverImage: string; // Imagem de Capa do Evento

  @Column({ type: 'json', nullable: true })
  categories: string[];

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true })
  longitude: number | null;

  @Column()
  placeName: string; // Nome do Local (obrigatório)

  @Column({ type: 'timestamp with time zone' })
  eventDate: Date; // Data do Evento (obrigatório)

  @Column({ type: 'timestamp with time zone' })
  startTime: Date; // Hora Inicial (obrigatório)

  @Column({ type: 'timestamp with time zone' })
  endTime: Date; // Hora Final (obrigatório)

  @Column()
  address: string; // Endereço do Evento (obrigatório)

  @Column({ default: true })
  isFree: boolean; // Indica se o evento é gratuito

  @Column({ nullable: true })
  ticketPrice: string; // Preço do Ingresso (se aplicável)

  @Column({ default: 'open' })
  registrationStatus: string; // Status de inscrições (aberto, fechado, cancelado)

  @ManyToOne(() => User, (user) => user.events, { eager: true })
  creatorUser: User; // Criador do evento

  @OneToMany(() => EventInvitation, (invitation) => invitation.event)
  invitations: EventInvitation[]; // Relação com convites

  @Column({ default: 0 })
  attendeesCount: number; // Contagem de participantes

  @ManyToMany(() => User)
  @JoinTable()
  interested: User[]; // Lista de interessados

  @Column({ default: 0 })
  interestedCount: number; // Contagem de interessados

  @CreateDateColumn()
  createdAt: Date; // Data de criação do evento

  @UpdateDateColumn()
  updatedAt: Date; // Data de última atualização

  @ManyToMany(() => User, (user) => user.attendingEvents, { eager: true })
  @JoinTable({
    name: 'events_attendees_user',
    joinColumn: { name: 'eventId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' },
  })
  attendees: User[];

  @Column({ default: 0 })
  visitCount: number;

  @OneToMany(() => EventVisit, (eventVisit) => eventVisit.event)
  eventVisits: EventVisit[];
}
