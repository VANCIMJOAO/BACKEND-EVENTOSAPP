import { User } from '../users/user.entity';
export declare class DirectMessageEntity {
    id: string;
    sender: User;
    receiver: User;
    senderId: number;
    receiverId: number;
    content: string;
    timestamp: Date;
}
