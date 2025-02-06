import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService } from './chat.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private chatService;
    constructor(chatService: ChatService);
    handleConnection(socket: Socket): void;
    handleDisconnect(socket: Socket): void;
    handleJoinRoom(data: {
        eventId: number;
        userId: number;
    }, socket: Socket): Promise<void>;
    handleLeaveRoom(data: {
        eventId: number;
        userId: number;
    }, socket: Socket): void;
    handleSendMessage(payload: {
        id: string;
        eventId: number;
        senderId: number;
        senderName: string;
        content: string;
    }, socket: Socket): Promise<{
        status: string;
    }>;
    handleTyping(data: {
        eventId: number;
        userName: string;
    }, socket: Socket): void;
    handleStopTyping(data: {
        eventId: number;
        userName: string;
    }, socket: Socket): void;
}
