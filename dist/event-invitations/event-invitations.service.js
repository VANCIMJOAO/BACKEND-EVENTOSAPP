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
exports.EventInvitationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_invitation_entity_1 = require("./event-invitation.entity");
const user_entity_1 = require("../users/user.entity");
const event_entity_1 = require("../events/event.entity");
const notifications_service_1 = require("../notifications/notifications.service");
const notification_entity_1 = require("../notifications/notification.entity");
let EventInvitationsService = class EventInvitationsService {
    constructor(invitationsRepository, eventsRepository, usersRepository, notificationsService) {
        this.invitationsRepository = invitationsRepository;
        this.eventsRepository = eventsRepository;
        this.usersRepository = usersRepository;
        this.notificationsService = notificationsService;
    }
    async sendInvites(sender, eventId, receiverIds) {
        const event = await this.eventsRepository.findOne({
            where: { id: eventId },
            relations: ['creatorUser'],
        });
        if (!event) {
            throw new common_1.NotFoundException('Evento não encontrado.');
        }
        if (event.creatorUser.id !== sender.id && sender.role !== 'ADMIN') {
            throw new common_1.ForbiddenException('Você não tem permissão para convidar para este evento.');
        }
        const existingInvitations = await this.invitationsRepository.find({
            where: {
                event: { id: eventId },
                receiver: { id: (0, typeorm_2.In)(receiverIds) },
                status: event_invitation_entity_1.InvitationStatus.PENDING,
            },
        });
        const existingReceiverIds = existingInvitations.map((inv) => inv.receiver.id);
        const newReceiverIds = receiverIds.filter((id) => !existingReceiverIds.includes(id));
        if (newReceiverIds.length === 0) {
            throw new common_1.BadRequestException('Todos os amigos selecionados já foram convidados.');
        }
        const newReceivers = await this.usersRepository.find({
            where: { id: (0, typeorm_2.In)(newReceiverIds) },
        });
        const invitations = newReceivers.map((receiver) => {
            return this.invitationsRepository.create({
                sender,
                receiver,
                event,
            });
        });
        const savedInvitations = await this.invitationsRepository.save(invitations);
        for (const receiver of newReceivers) {
            const invitation = savedInvitations.find((inv) => inv.receiver.id === receiver.id);
            if (invitation && receiver.expoPushToken) {
                await this.notificationsService.sendAndSaveNotification(receiver, notification_entity_1.NotificationType.EVENT_INVITATION, `${sender.nickname} te convidou para o evento "${event.name}".`, receiver.expoPushToken, { eventId: event.id, invitationId: invitation.id }, sender);
            }
        }
    }
    async respondToInvitation(invitationId, userId, accept) {
        const invitation = await this.invitationsRepository.findOne({
            where: { id: invitationId },
            relations: ['event', 'receiver', 'sender'],
        });
        if (!invitation) {
            throw new common_1.NotFoundException('Convite não encontrado.');
        }
        if (invitation.receiver.id !== userId) {
            throw new common_1.ForbiddenException('Você não tem permissão para responder a este convite.');
        }
        if (invitation.status !== event_invitation_entity_1.InvitationStatus.PENDING) {
            throw new common_1.BadRequestException('Este convite já foi respondido.');
        }
        invitation.status = accept ? event_invitation_entity_1.InvitationStatus.ACCEPTED : event_invitation_entity_1.InvitationStatus.REJECTED;
        await this.invitationsRepository.save(invitation);
        if (accept) {
            const event = await this.eventsRepository.findOne({
                where: { id: invitation.event.id },
                relations: ['attendees', 'creatorUser'],
            });
            if (!event) {
                throw new common_1.NotFoundException('Evento não encontrado.');
            }
            if (!event.attendees.some((att) => att.id === userId)) {
                const user = await this.usersRepository.findOne({ where: { id: userId } });
                event.attendees.push(user);
                await this.eventsRepository.save(event);
            }
            if (event.creatorUser.expoPushToken) {
                await this.notificationsService.sendAndSaveNotification(event.creatorUser, notification_entity_1.NotificationType.EVENT_ATTENDANCE, `${invitation.receiver.nickname} aceitou seu convite para ${event.name}!`, event.creatorUser.expoPushToken, { eventId: event.id, userId: invitation.receiver.id });
            }
        }
    }
    async getUserInvitations(userId) {
        if (!userId || isNaN(userId)) {
            throw new common_1.BadRequestException('ID de usuário inválido.');
        }
        return this.invitationsRepository.find({
            where: { receiver: { id: userId }, status: event_invitation_entity_1.InvitationStatus.PENDING },
            relations: ['sender', 'event', 'receiver'],
            order: { createdAt: 'DESC' },
        });
    }
    async getEventInvitations(eventId) {
        return this.invitationsRepository.find({
            where: { event: { id: eventId } },
            relations: ['receiver', 'sender'],
            order: { createdAt: 'DESC' },
        });
    }
    async cancelInvitation(invitationId, userId) {
        const invitation = await this.invitationsRepository.findOne({
            where: { id: invitationId },
            relations: ['sender', 'event'],
        });
        if (!invitation) {
            throw new common_1.NotFoundException('Convite não encontrado.');
        }
        if (invitation.sender.id !== userId && invitation.event.creatorUser.id !== userId) {
            throw new common_1.ForbiddenException('Você não tem permissão para cancelar este convite.');
        }
        await this.invitationsRepository.remove(invitation);
        if (invitation.receiver.expoPushToken) {
            await this.notificationsService.sendAndSaveNotification(invitation.receiver, notification_entity_1.NotificationType.EVENT_UPDATE, `O convite para ${invitation.event.name} foi cancelado.`, invitation.receiver.expoPushToken, { eventId: invitation.event.id }, invitation.sender);
        }
    }
};
exports.EventInvitationsService = EventInvitationsService;
exports.EventInvitationsService = EventInvitationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_invitation_entity_1.EventInvitation)),
    __param(1, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notifications_service_1.NotificationsService])
], EventInvitationsService);
//# sourceMappingURL=event-invitations.service.js.map