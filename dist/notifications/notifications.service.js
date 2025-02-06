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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const notification_entity_1 = require("./notification.entity");
const typeorm_2 = require("typeorm");
const node_fetch_1 = require("node-fetch");
let NotificationsService = class NotificationsService {
    constructor(notificationsRepository) {
        this.notificationsRepository = notificationsRepository;
    }
    async createNotification(receiver, type, message, data, sender) {
        const notification = this.notificationsRepository.create({
            receiver: { id: receiver.id },
            type,
            message,
            data,
            sender: sender ? { id: sender.id } : null,
            status: notification_entity_1.NotificationStatus.UNREAD,
        });
        return this.notificationsRepository.save(notification);
    }
    async getUserNotifications(userId) {
        return this.notificationsRepository.find({
            where: { receiver: { id: userId } },
            relations: ['sender', 'receiver'],
            order: { createdAt: 'DESC' },
        });
    }
    async markAsRead(userId, notificationId) {
        const notification = await this.notificationsRepository.findOne({
            where: { id: notificationId, receiver: { id: userId } },
            relations: ['receiver'],
        });
        if (!notification) {
            throw new common_1.NotFoundException('Notificação não encontrada.');
        }
        notification.status = notification_entity_1.NotificationStatus.READ;
        await this.notificationsRepository.save(notification);
    }
    async sendPushNotification(expoPushToken, title, body, data) {
        console.log('ExpoPushToken recebido:', expoPushToken);
        if (!expoPushToken.startsWith('ExponentPushToken')) {
            throw new common_1.BadRequestException('Token inválido');
        }
        const message = {
            to: expoPushToken,
            sound: 'default',
            title,
            body,
            data,
        };
        const response = await (0, node_fetch_1.default)('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-Encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });
        const dataResponse = await response.json();
        console.log("Resposta Expo:", dataResponse);
    }
    async sendAndSaveNotification(receiver, type, message, expoPushToken, data, sender) {
        const notification = await this.createNotification(receiver, type, message, data, sender);
        try {
            await this.sendPushNotification(expoPushToken, this.getNotificationTitle(type), message, { ...data, notificationId: notification.id });
        }
        catch (error) {
            console.error('Erro ao enviar push notification:', error);
        }
        return notification;
    }
    getNotificationTitle(type) {
        switch (type) {
            case notification_entity_1.NotificationType.FRIEND_REQUEST:
                return 'Nova Solicitação de Amizade';
            case notification_entity_1.NotificationType.EVENT_INVITATION:
                return 'Novo Convite para Evento';
            case notification_entity_1.NotificationType.MESSAGE:
                return 'Nova Mensagem';
            default:
                return 'Nova Notificação';
        }
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map