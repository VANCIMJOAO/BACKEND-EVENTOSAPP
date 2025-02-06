export declare class ChatMessageEntity {
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
