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
var EventInvitationsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventInvitationsController = void 0;
const common_1 = require("@nestjs/common");
const event_invitations_service_1 = require("./event-invitations.service");
const passport_1 = require("@nestjs/passport");
let EventInvitationsController = EventInvitationsController_1 = class EventInvitationsController {
    constructor(invitationsService) {
        this.invitationsService = invitationsService;
        this.logger = new common_1.Logger(EventInvitationsController_1.name);
    }
    async sendInvites(eventId, friendIds, req) {
        this.logger.log(`Convites enviados para o evento ID: ${eventId}, com amigos: ${friendIds}`);
        if (!friendIds || !Array.isArray(friendIds) || friendIds.some((id) => typeof id !== 'number')) {
            throw new common_1.BadRequestException('friendIds deve ser um array de números.');
        }
        const user = req.user;
        await this.invitationsService.sendInvites(user, eventId, friendIds);
        return { message: 'Convites enviados com sucesso.' };
    }
    async getUserInvitations(req) {
        this.logger.log('Requisição para buscar convites.');
        const userId = req.user?.id || req.user?.sub;
        if (!userId || isNaN(Number(userId))) {
            throw new common_1.BadRequestException('Invalid user ID format');
        }
        try {
            const invitations = await this.invitationsService.getUserInvitations(Number(userId));
            this.logger.log(`Convites encontrados: ${JSON.stringify(invitations.map((i) => i.id))}`);
            return invitations.map((invitation) => ({
                id: invitation.id,
                type: 'EVENT_INVITATION',
                message: `${invitation.sender.nickname} convidou você para o evento "${invitation.event.name}"`,
                data: {
                    eventId: invitation.event.id,
                    invitationId: invitation.id,
                },
                createdAt: invitation.createdAt,
                status: invitation.status,
                sender: {
                    id: invitation.sender.id,
                    nickname: invitation.sender.nickname,
                    avatar: invitation.sender.avatar,
                },
            }));
        }
        catch (error) {
            this.logger.error(`Erro ao buscar convites: ${error.message}`);
            throw new common_1.BadRequestException('Error fetching invitations');
        }
    }
    async respondToInvitation(id, accept, req) {
        const userId = req.user?.id;
        this.logger.log(`Usuário ID ${userId} respondendo ao convite ID ${id}, aceito: ${accept}`);
        await this.invitationsService.respondToInvitation(id, userId, accept);
        return { message: 'Resposta ao convite registrada.' };
    }
};
exports.EventInvitationsController = EventInvitationsController;
__decorate([
    (0, common_1.Post)(':eventId/invite'),
    __param(0, (0, common_1.Param)('eventId', new common_1.ParseIntPipe({ errorHttpStatusCode: common_1.HttpStatus.BAD_REQUEST }))),
    __param(1, (0, common_1.Body)('friendIds', new common_1.ParseArrayPipe({ items: Number, separator: ',' }))),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Array, Object]),
    __metadata("design:returntype", Promise)
], EventInvitationsController.prototype, "sendInvites", null);
__decorate([
    (0, common_1.Get)('invitations'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EventInvitationsController.prototype, "getUserInvitations", null);
__decorate([
    (0, common_1.Patch)('invitations/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('accept')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Boolean, Object]),
    __metadata("design:returntype", Promise)
], EventInvitationsController.prototype, "respondToInvitation", null);
exports.EventInvitationsController = EventInvitationsController = EventInvitationsController_1 = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('event-invitations'),
    __metadata("design:paramtypes", [event_invitations_service_1.EventInvitationsService])
], EventInvitationsController);
//# sourceMappingURL=event-invitations.controller.js.map