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
exports.FriendRequestsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const friend_request_entity_1 = require("./friend-request.entity");
const user_entity_1 = require("../user.entity");
const notifications_service_1 = require("../../notifications/notifications.service");
const notification_entity_1 = require("../../notifications/notification.entity");
const realtime_gateway_1 = require("../../realtime/realtime.gateway");
let FriendRequestsService = class FriendRequestsService {
    constructor(friendRequestRepo, userRepo, notificationsService, dataSource, realtimeGateway) {
        this.friendRequestRepo = friendRequestRepo;
        this.userRepo = userRepo;
        this.notificationsService = notificationsService;
        this.dataSource = dataSource;
        this.realtimeGateway = realtimeGateway;
    }
    async createRequest(senderId, receiverId) {
        if (senderId === receiverId) {
            throw new common_1.ForbiddenException('Não pode enviar solicitação a si mesmo.');
        }
        const [sender, receiver] = await Promise.all([
            this.userRepo.findOneBy({ id: senderId }),
            this.userRepo.findOneBy({ id: receiverId }),
        ]);
        if (!sender || !receiver) {
            throw new common_1.NotFoundException('Usuário não encontrado.');
        }
        const existing = await this.friendRequestRepo.findOne({
            where: {
                sender: { id: senderId },
                receiver: { id: receiverId },
                status: friend_request_entity_1.FriendRequestStatus.PENDING,
            },
        });
        if (existing) {
            throw new common_1.ForbiddenException('Solicitação pendente já existe.');
        }
        const newFriendRequest = await this.friendRequestRepo.save({
            sender,
            receiver,
            status: friend_request_entity_1.FriendRequestStatus.PENDING,
        });
        if (receiver.expoPushToken) {
            const message = `${sender.nickname} enviou uma solicitação de amizade.`;
            try {
                await this.notificationsService.sendAndSaveNotification(receiver, notification_entity_1.NotificationType.FRIEND_REQUEST, message, receiver.expoPushToken, { friendRequestId: newFriendRequest.id }, sender);
            }
            catch (error) {
                console.error('Erro ao enviar push notification:', error);
            }
        }
        this.realtimeGateway.notifyUser(receiver.id, {
            type: 'FRIEND_REQUEST',
            message: `${sender.nickname} enviou uma solicitação de amizade.`,
            data: { friendRequestId: newFriendRequest.id },
            createdAt: new Date(),
            status: 'PENDING',
            sender: {
                id: sender.id,
                nickname: sender.nickname,
                avatar: sender.avatar,
            },
        });
        return newFriendRequest;
    }
    async getReceivedRequests(userId) {
        const requests = await this.friendRequestRepo.find({
            where: { receiver: { id: userId } },
            relations: ['sender'],
            order: { createdAt: 'DESC' },
        });
        return requests;
    }
    async acceptRequest(requestId, userId) {
        return this.dataSource.transaction(async (manager) => {
            const request = await manager.findOne(friend_request_entity_1.FriendRequest, {
                where: { id: requestId },
                relations: ['sender', 'receiver'],
            });
            if (!request)
                throw new common_1.NotFoundException('Solicitação não encontrada');
            if (request.receiver.id !== userId)
                throw new common_1.ForbiddenException('Ação não permitida');
            if (request.status !== friend_request_entity_1.FriendRequestStatus.PENDING)
                throw new common_1.ForbiddenException('Solicitação já processada');
            request.status = friend_request_entity_1.FriendRequestStatus.ACCEPTED;
            await manager.save(request);
            const sender = await manager.findOne(user_entity_1.User, {
                where: { id: request.sender.id },
                relations: ['friends'],
            });
            const receiver = await manager.findOne(user_entity_1.User, {
                where: { id: request.receiver.id },
                relations: ['friends'],
            });
            if (!sender || !receiver)
                throw new common_1.NotFoundException('Usuário não encontrado');
            sender.friends = sender.friends || [];
            receiver.friends = receiver.friends || [];
            if (!sender.friends.some(friend => friend.id === receiver.id)) {
                sender.friends.push(receiver);
            }
            if (!receiver.friends.some(friend => friend.id === sender.id)) {
                receiver.friends.push(sender);
            }
            await manager.save(sender);
            await manager.save(receiver);
            this.realtimeGateway.notifyUser(sender.id, {
                type: 'FRIEND_REQUEST_ACCEPTED',
                message: `${receiver.nickname} aceitou sua solicitação de amizade.`,
                data: { friendRequestId: request.id },
                createdAt: new Date(),
                status: 'UNREAD',
            });
            return request;
        });
    }
    async rejectRequest(requestId, userId) {
        return this.dataSource.transaction(async (manager) => {
            const request = await manager.findOne(friend_request_entity_1.FriendRequest, {
                where: { id: requestId },
                relations: ['receiver', 'sender'],
            });
            if (!request)
                throw new common_1.NotFoundException('Solicitação não encontrada');
            if (request.receiver.id !== userId)
                throw new common_1.ForbiddenException('Ação não permitida');
            if (request.status !== friend_request_entity_1.FriendRequestStatus.PENDING)
                throw new common_1.ForbiddenException('Solicitação já processada');
            if (!request.sender) {
                throw new common_1.NotFoundException('Remetente não encontrado para essa solicitação');
            }
            request.status = friend_request_entity_1.FriendRequestStatus.REJECTED;
            this.realtimeGateway.notifyUser(request.sender.id, {
                type: 'FRIEND_REQUEST_REJECTED',
                message: `${request.receiver.nickname} rejeitou sua solicitação de amizade.`,
                data: { friendRequestId: request.id },
                createdAt: new Date(),
                status: 'UNREAD',
            });
            return manager.save(request);
        });
    }
};
exports.FriendRequestsService = FriendRequestsService;
exports.FriendRequestsService = FriendRequestsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(friend_request_entity_1.FriendRequest)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService,
        typeorm_2.DataSource,
        realtime_gateway_1.RealtimeGateway])
], FriendRequestsService);
//# sourceMappingURL=friend-requests.service.js.map