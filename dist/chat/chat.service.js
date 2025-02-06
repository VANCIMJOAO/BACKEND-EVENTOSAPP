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
var ChatService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chat_message_entity_1 = require("./chat-message.entity");
let ChatService = ChatService_1 = class ChatService {
    constructor(chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.logger = new common_1.Logger(ChatService_1.name);
    }
    async getMessagesForEvent(eventId) {
        this.logger.debug(`Buscando mensagens para o evento: ${eventId}`);
        const messages = await this.chatMessageRepository.find({
            where: { eventId },
            order: { timestamp: 'ASC' },
        });
        this.logger.debug(`Recuperado ${messages.length} mensagens para o evento ${eventId}`);
        return messages;
    }
    async addMessage(message) {
        const exists = await this.chatMessageRepository.findOne({ where: { id: message.id } });
        if (!exists) {
            const newMessage = this.chatMessageRepository.create(message);
            await this.chatMessageRepository.save(newMessage);
            this.logger.debug(`Mensagem adicionada: ${newMessage.id}`);
        }
        else {
            this.logger.warn(`Tentativa de adicionar mensagem duplicada: ${message.id}`);
        }
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = ChatService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chat_message_entity_1.ChatMessageEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ChatService);
//# sourceMappingURL=chat.service.js.map