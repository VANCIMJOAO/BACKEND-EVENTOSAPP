import { User } from '../users/user.entity';
import { Event } from '../events/event.entity';
export declare enum InvitationStatus {
    PENDING = "PENDING",
    ACCEPTED = "ACCEPTED",
    REJECTED = "REJECTED"
}
export declare class EventInvitation {
    id: number;
    sender: User;
    receiver: User;
    event: Event;
    status: InvitationStatus;
    createdAt: Date;
    updatedAt: Date;
}
