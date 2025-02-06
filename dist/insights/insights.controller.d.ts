import { InsightsService } from './insights.service';
export declare class InsightsController {
    private readonly insightsService;
    constructor(insightsService: InsightsService);
    getEventVisitInsights(id: number): Promise<{
        hour: number;
        count: number;
    }[]>;
}
