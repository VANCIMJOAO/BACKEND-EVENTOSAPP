import { User } from '../users/user.entity';
export declare enum NotificationType {
    FRIEND_REQUEST = "FRIEND_REQUEST",
    EVENT_INVITATION = "EVENT_INVITATION",
    MESSAGE = "MESSAGE",
    EVENT_ATTENDANCE = "EVENT_ATTENDANCE",
    EVENT_UPDATE = "EVENT_UPDATE"
}
export declare enum NotificationStatus {
    UNREAD = "UNREAD",
    READ = "READ"
}
export declare class Notification {
    id: number;
    receiver: User;
    sender: User | null;
    type: NotificationType;
    message: string;
    data: {
        eventId?: number;
        invitationId?: number;
        friendRequestId?: number;
        userId?: number;
    };
    status: NotificationStatus;
    createdAt: Date;
}
