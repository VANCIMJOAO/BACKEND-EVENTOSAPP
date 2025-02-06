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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const direct_chat_service_1 = require("./direct-chat.service");
let DirectChatGateway = class DirectChatGateway {
    constructor(directChatService) {
        this.directChatService = directChatService;
    }
    handleConnection(client) {
        console.log(`[DirectChatGateway] Cliente conectado: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`[DirectChatGateway] Cliente desconectado: ${client.id}`);
    }
    async handleJoinDM(client, payload) {
        const roomName = this.getRoomName(payload.userId, payload.otherUserId);
        console.log(`Cliente ${client.id} entrou na sala: ${roomName}`);
        client.join(roomName);
        const history = await this.directChatService.getMessagesBetweenUsers(payload.userId, payload.otherUserId);
        client.emit('directChatHistory', history);
    }
    handleLeaveDM(client, payload) {
        const roomName = this.getRoomName(payload.userId, payload.otherUserId);
        console.log(`Cliente ${client.id} saiu da sala: ${roomName}`);
        client.leave(roomName);
    }
    async handleSendDirectMessage(client, payload) {
        console.log('[sendDirectMessage] Recebido:', payload);
        try {
            const savedMsg = await this.directChatService.addMessage({
                senderId: payload.senderId,
                receiverId: payload.receiverId,
                content: payload.content,
                timestamp: new Date(payload.timestamp),
            });
            if (!savedMsg || !savedMsg.id) {
                console.error('[Erro] Falha ao salvar a mensagem no banco.');
                return;
            }
            const roomName = this.getRoomName(payload.senderId, payload.receiverId);
            this.server.to(roomName).emit('receiveDirectMessage', savedMsg);
            this.server.emit('conversationUpdate', {
                otherUserId: payload.receiverId,
                lastMessage: savedMsg.content,
                lastMessageTime: savedMsg.timestamp,
            });
            this.server.emit('conversationUpdate', {
                otherUserId: payload.senderId,
                lastMessage: savedMsg.content,
                lastMessageTime: savedMsg.timestamp,
            });
        }
        catch (error) {
            console.error('[Erro] Erro ao salvar mensagem:', error);
        }
    }
    sendConversationUpdate(updatedConversation) {
        console.log('Emitindo atualização de conversa:', updatedConversation);
        this.server.emit('conversationUpdate', {
            otherUserId: updatedConversation.receiverId,
            lastMessage: updatedConversation.content,
            lastMessageTime: updatedConversation.timestamp,
        });
    }
    getRoomName(userA, userB) {
        const sorted = [userA, userB].sort((a, b) => a - b);
        return `dm-${sorted[0]}-${sorted[1]}`;
    }
};
exports.DirectChatGateway = DirectChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], DirectChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinDM'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], DirectChatGateway.prototype, "handleJoinDM", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveDM'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], DirectChatGateway.prototype, "handleLeaveDM", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('sendDirectMessage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], DirectChatGateway.prototype, "handleSendDirectMessage", null);
exports.DirectChatGateway = DirectChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
        },
    }),
    __metadata("design:paramtypes", [direct_chat_service_1.DirectChatService])
], DirectChatGateway);
//# sourceMappingURL=direct-chat.gateway.js.map