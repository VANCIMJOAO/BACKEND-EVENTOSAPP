import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getUserNotifications(req: any): Promise<import("./notification.entity").Notification[]>;
    markAsRead(id: number, req: any): Promise<{
        message: string;
    }>;
}
