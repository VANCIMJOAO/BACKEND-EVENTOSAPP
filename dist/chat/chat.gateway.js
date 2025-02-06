"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const chat_service_1 = require("./chat.service");
let ChatGateway = class ChatGateway {
    constructor(chatService) {
        this.chatService = chatService;
    }
    handleConnection(socket) {
        console.log(`Cliente conectado: ${socket.id}`);
    }
    handleDisconnect(socket) {
        console.log(`Cliente desconectado: ${socket.id}`);
    }
    async handleJoinRoom(data, socket) {
        const roomName = `event_${data.eventId}`;
        socket.join(roomName);
        console.log(`Usuário ${data.userId} entrou na sala ${roomName}`);
        const history = await this.chatService.getMessagesForEvent(data.eventId);
        console.log(`Enviando histórico de mensagens para a sala ${roomName}:`, history);
        socket.emit('chatHistory', history);
    }
    handleLeaveRoom(data, socket) {
        const roomName = `event_${data.eventId}`;
        socket.leave(roomName);
        console.log(`Usuário ${data.userId} saiu da sala ${roomName}`);
    }
    async handleSendMessage(payload, socket) {
        console.log('Evento sendMessage recebido com payload:', payload);
        const roomName = `event_${payload.eventId}`;
        const newMessage = {
            id: payload.id,
            eventId: payload.eventId,
            senderId: payload.senderId,
            senderName: payload.senderName,
            content: payload.content,
            timestamp: new Date(),
        };
        console.log('Nova mensagem criada:', newMessage);
        await this.chatService.addMessage(newMessage);
        console.log(`Mensagem adicionada ao serviço de chat.`);
        socket.to(roomName).emit('receiveMessage', newMessage);
        console.log(`Mensagem emitida para a sala ${roomName}.`);
        socket.emit('receiveMessage', newMessage);
        console.log(`Mensagem emitida de volta para o remetente.`);
        console.log(`Enviando acknowledgment para o cliente: { status: 'ok' }`);
        return { status: 'ok' };
    }
    handleTyping(data, socket) {
        console.log(`Evento typing recebido:`, data);
        socket.to(`event_${data.eventId}`).emit('userTyping', data);
    }
    handleStopTyping(data, socket) {
        console.log(`Evento stopTyping recebido:`, data);
        socket.to(`event_${data.eventId}`).emit('stopTyping', data);
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.SubscribeMessage)('joinRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveRoom'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleLeaveRoom", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendMessage'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTyping", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('stopTyping'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, socket_io_1.Socket]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleStopTyping", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({ cors: true }),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map