import { Notification, NotificationType } from './notification.entity';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
export declare class NotificationsService {
    private notificationsRepository;
    constructor(notificationsRepository: Repository<Notification>);
    createNotification(receiver: User, type: NotificationType, message: string, data?: {
        eventId?: number;
        invitationId?: number;
        friendRequestId?: number;
    }, sender?: User): Promise<Notification>;
    getUserNotifications(userId: number): Promise<Notification[]>;
    markAsRead(userId: number, notificationId: number): Promise<void>;
    private sendPushNotification;
    sendAndSaveNotification(receiver: User, type: NotificationType, message: string, expoPushToken: string, data?: {
        eventId?: number;
        invitationId?: number;
        friendRequestId?: number;
        userId?: number;
    }, sender?: User): Promise<Notification>;
    private getNotificationTitle;
}
