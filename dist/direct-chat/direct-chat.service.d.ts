import { Repository } from 'typeorm';
import { DirectMessageEntity } from './direct-message.entity';
export interface DirectChatMessage {
    senderId: number;
    receiverId: number;
    content: string;
    timestamp: Date;
}
export declare class DirectChatService {
    private directMessageRepo;
    constructor(directMessageRepo: Repository<DirectMessageEntity>);
    getMessagesBetweenUsers(userA: number, userB: number): Promise<DirectMessageEntity[]>;
    addMessage(message: DirectChatMessage): Promise<DirectMessageEntity>;
    getConversations(userId: number): Promise<{
        otherUserId: number;
        lastMessageTime: any;
        lastMessage: any;
        nickname: any;
        avatar: any;
    }[]>;
}
