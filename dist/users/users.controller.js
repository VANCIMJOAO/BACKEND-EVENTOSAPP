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
var UsersController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const users_service_1 = require("./users.service");
const passport_1 = require("@nestjs/passport");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const user_role_enum_1 = require("./dto/user-role.enum");
const complete_profile_dto_1 = require("./dto/complete-profile.dto");
const user_profile_dto_1 = require("./dto/user-profile.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const event_dto_1 = require("../events/dto/event.dto");
let UsersController = UsersController_1 = class UsersController {
    constructor(usersService) {
        this.usersService = usersService;
        this.logger = new common_1.Logger(UsersController_1.name);
    }
    async getProfile(req) {
        this.logger.debug(`Requisição recebida com token: ${req.headers.authorization}`);
        this.logger.debug(`Usuário autenticado: ${JSON.stringify(req.user)}`);
        if (!req.user) {
            throw new common_1.UnauthorizedException('Usuário não autenticado.');
        }
        const userProfile = await this.usersService.findOneById(req.user.id, req.user.id);
        return (0, class_transformer_1.plainToInstance)(user_profile_dto_1.UserProfileDto, userProfile);
    }
    async updateProfile(req, updateData) {
        this.logger.debug(`Payload recebido no backend: ${JSON.stringify(updateData)}`);
        this.logger.debug(`Requisição recebida com ID do usuário: ${req.user.id}`);
        const updatePayload = { ...updateData, isProfileComplete: true };
        const updatedProfile = await this.usersService.update(req.user.id, updatePayload);
        return (0, class_transformer_1.plainToInstance)(user_profile_dto_1.UserProfileDto, updatedProfile);
    }
    async getUserById(id, req) {
        const userId = Number(id);
        if (isNaN(userId)) {
            throw new common_1.BadRequestException('ID deve ser um número válido.');
        }
        const profile = await this.usersService.findOneById(userId, req.user.id);
        return (0, class_transformer_1.plainToInstance)(user_profile_dto_1.UserProfileDto, profile);
    }
    async updateUser(id, updateData) {
        const numericId = Number(id);
        if (isNaN(numericId)) {
            throw new common_1.BadRequestException('ID deve ser um número válido.');
        }
        this.logger.debug(`Atualizando usuário com ID: ${numericId}`);
        const updatedProfile = await this.usersService.update(numericId, updateData);
        return (0, class_transformer_1.plainToInstance)(user_profile_dto_1.UserProfileDto, updatedProfile);
    }
    async toggleFavorite(req, eventId) {
        this.logger.debug(`Requisição recebida com token: ${req.headers.authorization}`);
        this.logger.debug(`Usuário no req: ${JSON.stringify(req.user)}`);
        if (!req.user) {
            throw new common_1.UnauthorizedException('Usuário não autenticado.');
        }
        const userId = req.user.id;
        const numericEventId = Number(eventId);
        if (isNaN(numericEventId)) {
            throw new common_1.BadRequestException('ID do evento deve ser um número válido.');
        }
        this.logger.debug(`Usuário ${userId} deseja favoritar/desfavoritar o evento ${numericEventId}`);
        const updatedProfile = await this.usersService.toggleFavoriteEvent(userId, numericEventId);
        return (0, class_transformer_1.plainToInstance)(user_profile_dto_1.UserProfileDto, updatedProfile);
    }
    async getFavorites(req) {
        const userId = req.user.id;
        const events = await this.usersService.getFavorites(userId);
        return (0, class_transformer_1.plainToInstance)(event_dto_1.EventDto, events);
    }
    async checkFavoriteStatus(req, eventId) {
        const userId = req.user.id;
        const numericEventId = Number(eventId);
        if (isNaN(numericEventId)) {
            throw new common_1.BadRequestException('ID do evento deve ser um número válido.');
        }
        const isFavorited = await this.usersService.isEventFavorited(userId, numericEventId);
        return { isFavorited };
    }
    async addFriend(req, friendId) {
        const userId = req.user.id;
        const numericFriendId = Number(friendId);
        if (isNaN(numericFriendId)) {
            throw new common_1.BadRequestException('ID do amigo deve ser um número válido.');
        }
        try {
            const profile = await this.usersService.addFriend(userId, numericFriendId);
            return (0, class_transformer_1.plainToInstance)(user_profile_dto_1.UserProfileDto, profile);
        }
        catch (error) {
            if (error instanceof common_1.ForbiddenException) {
                throw new common_1.BadRequestException(error.message);
            }
            throw error;
        }
    }
    async removeFriend(req, friendId) {
        const userId = req.user.id;
        const numericFriendId = Number(friendId);
        if (isNaN(numericFriendId)) {
            throw new common_1.BadRequestException('ID do amigo deve ser um número válido.');
        }
        const profile = await this.usersService.removeFriend(userId, numericFriendId);
        return (0, class_transformer_1.plainToInstance)(user_profile_dto_1.UserProfileDto, profile);
    }
    async getMyFriends(req) {
        const userId = req.user.id;
        const friends = await this.usersService.listFriends(userId);
        return (0, class_transformer_1.plainToInstance)(user_profile_dto_1.UserProfileDto, friends);
    }
    async getUserFriends(id) {
        const userId = Number(id);
        if (isNaN(userId)) {
            throw new common_1.BadRequestException('ID deve ser um número válido.');
        }
        const friends = await this.usersService.listFriends(userId);
        return (0, class_transformer_1.plainToInstance)(user_profile_dto_1.UserProfileDto, friends);
    }
    async updatePrivacy(req, body) {
        const { isPrivate } = body;
        this.logger.debug(`Atualizando privacidade do user ${req.user.id} para: ${isPrivate}`);
        const updatedProfile = await this.usersService.update(req.user.id, { isPrivate });
        return (0, class_transformer_1.plainToInstance)(user_profile_dto_1.UserProfileDto, updatedProfile);
    }
    async getGoingEvents(req) {
        const userId = req.user.id;
        const events = await this.usersService.getGoingEvents(userId);
        return (0, class_transformer_1.plainToInstance)(event_dto_1.EventDto, events);
    }
    async updateExpoPushToken(req, body) {
        this.logger.debug(`Atualizando expoPushToken para usuário ${req.user.id}: ${body.expoPushToken}`);
        if (!body.expoPushToken) {
            throw new common_1.BadRequestException('Expo Push Token é obrigatório');
        }
        const updatedUser = await this.usersService.updateExpoPushToken(req.user.id, body.expoPushToken);
        return updatedUser;
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Patch)('me'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, complete_profile_dto_1.CompleteProfileDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserById", null);
__decorate([
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUser", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Patch)('me/favorites/:eventId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "toggleFavorite", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('me/favorites'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getFavorites", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('me/favorites/:eventId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "checkFavoriteStatus", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('me/friends/:friendId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('friendId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "addFriend", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Delete)('me/friends/:friendId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('friendId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "removeFriend", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('me/friends'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getMyFriends", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)(':id/friends'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserFriends", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Patch)('me/privacy'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updatePrivacy", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('me/going'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getGoingEvents", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Patch)('me/expo-push-token'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateExpoPushToken", null);
exports.UsersController = UsersController = UsersController_1 = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map