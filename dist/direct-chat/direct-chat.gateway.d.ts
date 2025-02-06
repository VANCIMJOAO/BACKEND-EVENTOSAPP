import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { DirectChatService } from './direct-chat.service';
export declare class DirectChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly directChatService;
    server: Server;
    constructor(directChatService: DirectChatService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinDM(client: Socket, payload: {
        userId: number;
        otherUserId: number;
    }): Promise<void>;
    handleLeaveDM(client: Socket, payload: {
        userId: number;
        otherUserId: number;
    }): void;
    handleSendDirectMessage(client: Socket, payload: any): Promise<void>;
    sendConversationUpdate(updatedConversation: {
        receiverId: number;
        content: string;
        timestamp: string;
    }): void;
    private getRoomName;
}
