import { UsersService } from '../users/users.service';
import { EventsService } from '../events/events.service';
export declare class SearchController {
    private readonly usersService;
    private readonly eventsService;
    constructor(usersService: UsersService, eventsService: EventsService);
    search(term: string): Promise<{
        users: import("../users/user.entity").User[];
        events: import("../events/event.entity").Event[];
    }>;
}
