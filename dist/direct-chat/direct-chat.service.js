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
exports.DirectChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const direct_message_entity_1 = require("./direct-message.entity");
let DirectChatService = class DirectChatService {
    constructor(directMessageRepo) {
        this.directMessageRepo = directMessageRepo;
    }
    async getMessagesBetweenUsers(userA, userB) {
        return this.directMessageRepo.find({
            where: [
                { senderId: userA, receiverId: userB },
                { senderId: userB, receiverId: userA },
            ],
            order: { timestamp: 'ASC' },
        });
    }
    async addMessage(message) {
        const newMsg = this.directMessageRepo.create(message);
        const savedMsg = await this.directMessageRepo.save(newMsg);
        return savedMsg;
    }
    async getConversations(userId) {
        const conversations = await this.directMessageRepo
            .createQueryBuilder('message')
            .select([
            `CASE WHEN message."senderId" = :userId THEN message."receiverId" ELSE message."senderId" END AS "otherUserId"`,
            `MAX(message.timestamp) AS "lastMessageTime"`,
            `(SELECT dm.content FROM direct_messages dm 
          WHERE (dm."senderId" = message."senderId" AND dm."receiverId" = message."receiverId")
             OR (dm."senderId" = message."receiverId" AND dm."receiverId" = message."senderId")
          ORDER BY dm.timestamp DESC LIMIT 1) AS "lastMessage"`,
        ])
            .leftJoin('User', 'user', `user.id = 
        CASE WHEN message."senderId" = :userId THEN message."receiverId" ELSE message."senderId" END`)
            .where(`message."senderId" = :userId OR message."receiverId" = :userId`, { userId })
            .groupBy(`CASE WHEN message."senderId" = :userId THEN message."receiverId" ELSE message."senderId" END, user.nickname, user.avatar`)
            .orderBy('"lastMessageTime"', 'DESC')
            .setParameter('userId', userId)
            .getRawMany();
        return conversations.map((conv) => ({
            otherUserId: Number(conv.otherUserId),
            lastMessageTime: conv.lastMessageTime,
            lastMessage: conv.lastMessage,
            nickname: conv.nickname,
            avatar: conv.avatar,
        }));
    }
};
exports.DirectChatService = DirectChatService;
exports.DirectChatService = DirectChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(direct_message_entity_1.DirectMessageEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DirectChatService);
//# sourceMappingURL=direct-chat.service.js.map