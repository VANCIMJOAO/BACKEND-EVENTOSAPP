import { ChatService } from './chat.service';
import { ChatMessage } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getChatPreview(eventId: string): Promise<{
        messages: ChatMessage[];
    }>;
}
