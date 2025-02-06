import { EventsService } from '../events/events.service';
export declare class InsightsService {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    getEventVisitInsights(eventId: number): Promise<{
        hour: number;
        count: number;
    }[]>;
}
