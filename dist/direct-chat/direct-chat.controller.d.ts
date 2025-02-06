import { DirectChatService } from './direct-chat.service';
export declare class DirectChatController {
    private readonly directChatService;
    constructor(directChatService: DirectChatService);
    getConversations(userId: number): Promise<{
        otherUserId: number;
        lastMessageTime: any;
        lastMessage: any;
        nickname: any;
        avatar: any;
    }[]>;
    getHistory(userA: number, userB: number): Promise<import("./direct-message.entity").DirectMessageEntity[]>;
}
