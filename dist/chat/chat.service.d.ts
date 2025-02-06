import { Repository } from 'typeorm';
import { ChatMessageEntity } from './chat-message.entity';
export interface ChatMessage {
    id: string;
    eventId: number;
    senderId: number;
    senderName: string;
    content: string;
    timestamp: Date;
    reactions?: {
        [emoji: string]: number;
    };
}
export declare class ChatService {
    private chatMessageRepository;
    private readonly logger;
    constructor(chatMessageRepository: Repository<ChatMessageEntity>);
    getMessagesForEvent(eventId: number): Promise<ChatMessage[]>;
    addMessage(message: ChatMessage): Promise<void>;
}
