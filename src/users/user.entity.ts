import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Event } from '../events/event.entity';
import { UserRole } from './dto/user-role.enum';
import { FriendRequest } from './friend-requests/friend-request.entity';
import { Notification } from '../notifications/notification.entity';
import { EventInvitation } from '../event-invitations/event-invitation.entity';
import { DirectMessageEntity } from '../direct-chat/direct-message.entity';
import { EventVisit } from '../events/event-visit.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  nickname: string;

  @Column({ unique: true })
  cpf: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ nullable: true })
  description?: string;

  @Column('simple-array', { nullable: true })
  interests?: string[];

  @Column({ default: false })
  isProfileComplete: boolean;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ nullable: true })
  sex?: string;

  @Column({ nullable: true })
  birthDate?: string;

  @Column({ nullable: true })
  phone?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: false })
  isPrivate: boolean;

  @ManyToMany(() => Event, { cascade: true })
  @JoinTable()
  favoriteEvents: Event[];

  @OneToMany(() => Event, (event) => event.creatorUser)
  events: Event[];

  @ManyToMany(() => User, (user) => user.friends, { cascade: ['insert', 'update'] })
  @JoinTable({
    name: 'user_friends',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'friend_id',
      referencedColumnName: 'id',
    },
  })
  friends: User[];

  @OneToMany(() => FriendRequest, (fr) => fr.sender)
  sentFriendRequests: FriendRequest[];

  @OneToMany(() => FriendRequest, (fr) => fr.receiver)
  receivedFriendRequests: FriendRequest[];

  @OneToMany(() => EventInvitation, (inv) => inv.sender)
  sentEventInvitations: EventInvitation[];

  @OneToMany(() => EventInvitation, (inv) => inv.receiver)
  receivedEventInvitations: EventInvitation[];

  @OneToMany(() => Notification, (notification) => notification.receiver)
  receivedNotifications: Notification[];

  @ManyToMany(() => Event, (event) => event.attendees)
  attendingEvents: Event[];

  @OneToMany(() => DirectMessageEntity, (message) => message.sender)
  sentMessages: DirectMessageEntity[];

  @OneToMany(() => DirectMessageEntity, (message) => message.receiver)
  receivedMessages: DirectMessageEntity[];

  @OneToMany(() => EventVisit, (eventVisit) => eventVisit.user)
  eventVisits: EventVisit[];

  @Column({ nullable: true })
  expoPushToken?: string;
}
