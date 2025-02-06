import { EventsService } from '../events/events.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
interface PaginationOptions {
    page: number;
    limit: number;
}
export declare class MarketingService {
    private readonly eventsService;
    private readonly usersService;
    constructor(eventsService: EventsService, usersService: UsersService);
    findAllConfirmedParticipants(requestingUser: User, options: PaginationOptions): Promise<{
        totalAttendees: number;
        currentPage: number;
        totalPages: number;
        data: {
            id: any;
            nickname: any;
            email: any;
            phone: any;
        }[];
    }>;
    findAllParticipantsGrouped(requestingUser: User): Promise<{
        data: {
            eventId: any;
            eventName: any;
            eventDate: any;
            participants: any;
        }[];
    }>;
}
export {};
