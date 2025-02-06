import { User } from '../users/user.entity';
import { Event } from './event.entity';
export declare class EventVisit {
    id: number;
    event: Event;
    user: User;
    visitedAt: Date;
}
