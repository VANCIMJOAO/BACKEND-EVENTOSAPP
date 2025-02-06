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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./user.entity");
const event_entity_1 = require("../events/event.entity");
const user_role_enum_1 = require("./dto/user-role.enum");
const user_profile_dto_1 = require("./dto/user-profile.dto");
const class_transformer_1 = require("class-transformer");
const argon2 = require("argon2");
const friend_requests_service_1 = require("./friend-requests/friend-requests.service");
const notification_entity_1 = require("../notifications/notification.entity");
const notifications_service_1 = require("../notifications/notifications.service");
let UsersService = UsersService_1 = class UsersService {
    constructor(usersRepository, eventsRepository, friendRequestsService, notificationsService) {
        this.usersRepository = usersRepository;
        this.eventsRepository = eventsRepository;
        this.friendRequestsService = friendRequestsService;
        this.notificationsService = notificationsService;
        this.logger = new common_1.Logger(UsersService_1.name);
        this.logger.debug('UsersService inicializado');
        this.logger.debug(`Dependências injetadas:
      - usersRepository: ${!!this.usersRepository},
      - eventsRepository: ${!!this.eventsRepository},
      - friendRequestsService: ${!!this.friendRequestsService},
      - notificationsService: ${!!this.notificationsService}`);
    }
    async findOneByEmail(email) {
        this.logger.debug(`Buscando usuário pelo email: ${email}`);
        return this.usersRepository.findOne({ where: { email } });
    }
    async findOneEntityById(id) {
        return this.usersRepository.findOne({
            where: { id },
            relations: ['favoriteEvents', 'friends', 'sentFriendRequests', 'receivedFriendRequests'],
        });
    }
    async findOneById(id, requestingUserId) {
        const user = await this.usersRepository.findOne({
            where: { id },
            relations: ['favoriteEvents', 'friends'],
        });
        if (!user) {
            throw new common_1.NotFoundException(`Usuário com ID ${id} não encontrado.`);
        }
        const isSelf = requestingUserId === user.id;
        const isFriend = user.friends?.some(f => f.id === requestingUserId);
        if (user.isPrivate && !isSelf && !isFriend) {
            return (0, class_transformer_1.plainToInstance)(user_profile_dto_1.UserProfileDto, {
                id: user.id,
                nickname: user.nickname,
                avatar: user.avatar,
                role: user.role,
                isPrivate: user.isPrivate,
            }, { excludeExtraneousValues: true });
        }
        return (0, class_transformer_1.plainToInstance)(user_profile_dto_1.UserProfileDto, user, { excludeExtraneousValues: true });
    }
    async create(registerDto) {
        this.logger.debug(`Criando usuário com email: ${registerDto.email}`);
        const hashedPassword = await argon2.hash(registerDto.password);
        const user = this.usersRepository.create({
            email: registerDto.email,
            password: hashedPassword,
            nickname: registerDto.nickname,
            cpf: registerDto.cpf.replace(/\D/g, ''),
            role: user_role_enum_1.UserRole.USER,
        });
        return this.usersRepository.save(user);
    }
    async update(id, updateData) {
        this.logger.debug(`Atualizando usuário com ID: ${id} - Dados: ${JSON.stringify(updateData)}`);
        await this.usersRepository.update(id, updateData);
        const updatedUser = await this.usersRepository.findOne({
            where: { id },
            relations: ['favoriteEvents', 'friends'],
        });
        return (0, class_transformer_1.plainToInstance)(user_profile_dto_1.UserProfileDto, updatedUser, { excludeExtraneousValues: true });
    }
    async toggleFavoriteEvent(userId, eventId) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            relations: ['favoriteEvents'],
        });
        if (!user)
            throw new common_1.NotFoundException('Usuário não encontrado');
        const index = user.favoriteEvents.findIndex((evt) => evt.id === eventId);
        const event = await this.eventsRepository.findOne({ where: { id: eventId } });
        if (!event)
            throw new common_1.NotFoundException('Evento não encontrado');
        if (index === -1) {
            user.favoriteEvents.push(event);
        }
        else {
            user.favoriteEvents.splice(index, 1);
        }
        await this.usersRepository.save(user);
        return this.findOneById(userId, userId);
    }
    async assignRole(id, role) {
        await this.usersRepository.update(id, { role });
        return this.findOneById(id, id);
    }
    async getFavorites(userId) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            relations: ['favoriteEvents'],
        });
        return user?.favoriteEvents || [];
    }
    async isEventFavorited(userId, eventId) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            relations: ['favoriteEvents'],
        });
        return user?.favoriteEvents?.some((evt) => evt.id === eventId) || false;
    }
    async addFriend(userId, friendId) {
        if (userId === friendId)
            throw new common_1.ForbiddenException('Não pode adicionar a si mesmo');
        const [user, friend] = await Promise.all([
            this.usersRepository.findOne({
                where: { id: userId },
                relations: ['friends']
            }),
            this.usersRepository.findOne({
                where: { id: friendId },
                relations: ['friends']
            })
        ]);
        if (!user || !friend)
            throw new common_1.NotFoundException('Usuário não encontrado');
        if (user.friends.some(f => f.id === friendId))
            throw new common_1.NotFoundException('Já são amigos');
        if (friend.isPrivate) {
            const request = await this.friendRequestsService.createRequest(userId, friendId);
            await this.notificationsService.createNotification(friend, notification_entity_1.NotificationType.FRIEND_REQUEST, `${user.nickname} enviou solicitação de amizade`, { friendRequestId: request.id }, user);
            throw new common_1.ForbiddenException('Solicitação enviada para perfil privado');
        }
        user.friends.push(friend);
        friend.friends.push(user);
        await this.usersRepository.save([user, friend]);
        await this.notificationsService.createNotification(friend, notification_entity_1.NotificationType.FRIEND_REQUEST, `${user.nickname} adicionou você como amigo`, { friendRequestId: null }, user);
        return this.findOneById(userId, userId);
    }
    async removeFriend(userId, friendId) {
        const [user, friend] = await Promise.all([
            this.usersRepository.findOne({
                where: { id: userId },
                relations: ['friends']
            }),
            this.usersRepository.findOne({
                where: { id: friendId },
                relations: ['friends']
            })
        ]);
        if (!user || !friend)
            throw new common_1.NotFoundException('Usuário não encontrado');
        user.friends = user.friends.filter(f => f.id !== friendId);
        friend.friends = friend.friends.filter(f => f.id !== userId);
        await this.usersRepository.save([user, friend]);
        await this.notificationsService.createNotification(friend, notification_entity_1.NotificationType.FRIEND_REQUEST, `${user.nickname} removeu a amizade`, null, user);
        return this.findOneById(userId, userId);
    }
    async listFriends(userId) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            relations: ['friends'],
        });
        return user?.friends || [];
    }
    async searchUsersByNickname(term) {
        return this.usersRepository.find({
            where: { nickname: (0, typeorm_2.Like)(`%${term}%`) },
            select: ['id', 'nickname', 'avatar', 'role'],
        });
    }
    async getGoingEvents(userId) {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            relations: ['attendingEvents'],
        });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado.');
        }
        return user.attendingEvents || [];
    }
    async updateExpoPushToken(userId, token) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado');
        }
        user.expoPushToken = token;
        const updatedUser = await this.usersRepository.save(user);
        return (0, class_transformer_1.plainToInstance)(user_profile_dto_1.UserProfileDto, updatedUser, { excludeExtraneousValues: true });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        friend_requests_service_1.FriendRequestsService,
        notifications_service_1.NotificationsService])
], UsersService);
//# sourceMappingURL=users.service.js.map