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
var EventsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const events_service_1 = require("./events.service");
const create_event_dto_1 = require("./dto/create-event.dto");
const update_event_dto_1 = require("./dto/update-event.dto");
const passport_1 = require("@nestjs/passport");
const user_role_enum_1 = require("../users/dto/user-role.enum");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const chat_service_1 = require("../chat/chat.service");
let EventsController = EventsController_1 = class EventsController {
    constructor(eventsService, chatService) {
        this.eventsService = eventsService;
        this.chatService = chatService;
        this.logger = new common_1.Logger(EventsController_1.name);
    }
    async createEvent(createEventDto, file, req) {
        this.logger.debug(`createEventDto recebido: ${JSON.stringify(createEventDto)}`);
        this.logger.debug(`isFree no controlador: ${createEventDto.isFree} (${typeof createEventDto.isFree})`);
        const user = req.user;
        if (user.role !== user_role_enum_1.UserRole.ORGANIZER &&
            user.role !== user_role_enum_1.UserRole.ADMIN) {
            throw new common_1.ForbiddenException('Permission denied to create events.');
        }
        const coverImage = file ? file.path : null;
        return this.eventsService.createEvent(createEventDto, user, coverImage);
    }
    async getEventsForManagement(req) {
        const user = req.user;
        if (user.role === user_role_enum_1.UserRole.ADMIN) {
            return this.eventsService.findAllEvents();
        }
        if (user.role === user_role_enum_1.UserRole.ORGANIZER) {
            return this.eventsService.findEventsByCreator(user.id);
        }
        throw new common_1.ForbiddenException('Permission denied.');
    }
    async findAll() {
        const events = await this.eventsService.findAllEvents();
        const processedEvents = await Promise.all(events.map(async (event) => {
            const visitHistory = await this.eventsService.getVisitHistory(event.id);
            return {
                ...event,
                visitHistory,
            };
        }));
        return processedEvents;
    }
    async findEventsByUser(req) {
        const user = req.user;
        return this.eventsService.findEventsByCreator(user.id);
    }
    async findOneEvent(id) {
        const event = await this.eventsService.findOneEvent(id);
        if (!event) {
            throw new common_1.NotFoundException(`Event with ID ${id} not found.`);
        }
        return event;
    }
    async updateEvent(id, updateEventDto, file, req) {
        const user = req.user;
        const event = await this.eventsService.findOneEvent(id);
        if (!event) {
            throw new common_1.NotFoundException(`Event with ID ${id} not found.`);
        }
        if (user.role !== user_role_enum_1.UserRole.ADMIN &&
            (user.role !== user_role_enum_1.UserRole.ORGANIZER || event.creatorUser.id !== user.id)) {
            throw new common_1.ForbiddenException('Permission denied to update this event.');
        }
        const coverImage = file ? file.path : event.coverImage;
        return this.eventsService.updateEvent(id, updateEventDto, user, coverImage);
    }
    async deleteEvent(id, req) {
        const user = req.user;
        const event = await this.eventsService.findOneEvent(id);
        if (!event) {
            throw new common_1.NotFoundException(`Event with ID ${id} not found.`);
        }
        if (user.role !== user_role_enum_1.UserRole.ADMIN &&
            (user.role !== user_role_enum_1.UserRole.ORGANIZER || event.creatorUser.id !== user.id)) {
            throw new common_1.ForbiddenException('Permission denied to delete this event.');
        }
        return this.eventsService.deleteEvent(id, user);
    }
    async markGoing(id, req) {
        const user = req.user;
        await this.eventsService.markGoing(id, user.id);
        return this.eventsService.findOneEvent(id);
    }
    async unmarkGoing(id, req) {
        const user = req.user;
        await this.eventsService.unmarkGoing(id, user.id);
        return this.eventsService.findOneEvent(id);
    }
    async getChatPreview(eventId) {
        this.logger.log(`Recebendo requisição para preview do chat do evento ID: ${eventId}`);
        const messages = await this.chatService.getMessagesForEvent(eventId);
        this.logger.log(`Mensagens encontradas: ${JSON.stringify(messages)}`);
        return { messages };
    }
    async registerVisit(id, req) {
        const user = req.user;
        if (!user) {
            throw new common_1.ForbiddenException('Usuário não autenticado.');
        }
        await this.eventsService.registerVisit(id, user.id);
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('coverImage', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/events',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            },
        }),
        fileFilter: (req, file, callback) => {
            if (file.mimetype === 'image/jpeg' ||
                file.mimetype === 'image/png' ||
                file.mimetype === 'image/jpg') {
                callback(null, true);
            }
            else {
                callback(new Error('Apenas arquivos de imagem são permitidos!'), false);
            }
        },
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_event_dto_1.CreateEventDto, Object, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "createEvent", null);
__decorate([
    (0, common_1.Get)('manage'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getEventsForManagement", null);
__decorate([
    (0, common_1.Get)('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('user'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findEventsByUser", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "findOneEvent", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('coverImage', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/events',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            },
        }),
        fileFilter: (req, file, callback) => {
            if (file.mimetype === 'image/jpeg' ||
                file.mimetype === 'image/png' ||
                file.mimetype === 'image/jpg') {
                callback(null, true);
            }
            else {
                callback(new Error('Apenas arquivos de imagem são permitidos!'), false);
            }
        },
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_event_dto_1.UpdateEventDto, Object, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "updateEvent", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "deleteEvent", null);
__decorate([
    (0, common_1.Patch)(':id/going'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "markGoing", null);
__decorate([
    (0, common_1.Delete)(':id/going'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "unmarkGoing", null);
__decorate([
    (0, common_1.Get)(':id/chat/preview'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "getChatPreview", null);
__decorate([
    (0, common_1.Patch)(':id/visit'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], EventsController.prototype, "registerVisit", null);
exports.EventsController = EventsController = EventsController_1 = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('events'),
    __metadata("design:paramtypes", [events_service_1.EventsService,
        chat_service_1.ChatService])
], EventsController);
//# sourceMappingURL=events.controller.js.map