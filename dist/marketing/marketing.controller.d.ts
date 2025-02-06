import { Request } from 'express';
import { MarketingService } from './marketing.service';
export declare class MarketingController {
    private readonly marketingService;
    constructor(marketingService: MarketingService);
    getAllConfirmedParticipants(req: Request, page?: number, limit?: number): Promise<{
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
    getGroupedParticipants(req: Request): Promise<{
        data: {
            eventId: any;
            eventName: any;
            eventDate: any;
            participants: any;
        }[];
    }>;
}
