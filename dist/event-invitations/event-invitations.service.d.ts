import { Repository } from 'typeorm';
import { EventInvitation } from './event-invitation.entity';
import { User } from '../users/user.entity';
import { Event } from '../events/event.entity';
import { NotificationsService } from '../notifications/notifications.service';
export declare class EventInvitationsService {
    private invitationsRepository;
    private eventsRepository;
    private usersRepository;
    private notificationsService;
    constructor(invitationsRepository: Repository<EventInvitation>, eventsRepository: Repository<Event>, usersRepository: Repository<User>, notificationsService: NotificationsService);
    sendInvites(sender: User, eventId: number, receiverIds: number[]): Promise<void>;
    respondToInvitation(invitationId: number, userId: number, accept: boolean): Promise<void>;
    getUserInvitations(userId: number): Promise<EventInvitation[]>;
    getEventInvitations(eventId: number): Promise<EventInvitation[]>;
    cancelInvitation(invitationId: number, userId: number): Promise<void>;
}
