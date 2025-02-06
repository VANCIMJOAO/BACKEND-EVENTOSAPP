import { User } from '../users/user.entity';
import { EventInvitation } from '../event-invitations/event-invitation.entity';
import { EventVisit } from './event-visit.entity';
export declare class Event {
    id: number;
    name: string;
    description: string;
    coverImage: string;
    categories: string[];
    latitude: number | null;
    longitude: number | null;
    placeName: string;
    eventDate: Date;
    startTime: Date;
    endTime: Date;
    address: string;
    isFree: boolean;
    ticketPrice: string;
    registrationStatus: string;
    creatorUser: User;
    invitations: EventInvitation[];
    attendeesCount: number;
    interested: User[];
    interestedCount: number;
    createdAt: Date;
    updatedAt: Date;
    attendees: User[];
    visitCount: number;
    eventVisits: EventVisit[];
}
