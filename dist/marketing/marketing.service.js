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
exports.MarketingService = void 0;
const common_1 = require("@nestjs/common");
const events_service_1 = require("../events/events.service");
const users_service_1 = require("../users/users.service");
const user_role_enum_1 = require("../users/dto/user-role.enum");
let MarketingService = class MarketingService {
    constructor(eventsService, usersService) {
        this.eventsService = eventsService;
        this.usersService = usersService;
    }
    async findAllConfirmedParticipants(requestingUser, options) {
        if (requestingUser.role !== user_role_enum_1.UserRole.ADMIN &&
            requestingUser.role !== user_role_enum_1.UserRole.ORGANIZER) {
            throw new common_1.ForbiddenException('Você não tem permissão para acessar esses dados.');
        }
        const { page, limit } = options;
        let events = [];
        if (requestingUser.role === user_role_enum_1.UserRole.ADMIN) {
            events = await this.eventsService.findAllEventsFull();
        }
        else {
            events = await this.eventsService.findEventsByCreator(requestingUser.id);
        }
        const allAttendees = [];
        for (const event of events) {
            if (event.attendees) {
                allAttendees.push(...event.attendees);
            }
        }
        const uniqueAttendees = Array.from(new Map(allAttendees.map((u) => [u.id, u])).values());
        const mappedAttendees = uniqueAttendees.map((attendee) => ({
            id: attendee.id,
            nickname: attendee.nickname,
            email: attendee.email,
            phone: attendee.phone ?? '',
        }));
        mappedAttendees.sort((a, b) => a.nickname.localeCompare(b.nickname));
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginated = mappedAttendees.slice(startIndex, endIndex);
        return {
            totalAttendees: mappedAttendees.length,
            currentPage: page,
            totalPages: Math.ceil(mappedAttendees.length / limit),
            data: paginated,
        };
    }
    async findAllParticipantsGrouped(requestingUser) {
        if (requestingUser.role !== user_role_enum_1.UserRole.ADMIN &&
            requestingUser.role !== user_role_enum_1.UserRole.ORGANIZER) {
            throw new common_1.ForbiddenException('Você não tem permissão para acessar esses dados.');
        }
        let events = [];
        if (requestingUser.role === user_role_enum_1.UserRole.ADMIN) {
            events = await this.eventsService.findAllEventsFull();
        }
        else {
            events = await this.eventsService.findEventsByCreator(requestingUser.id);
        }
        const data = events.map((event) => {
            const participants = event.attendees.map((attendee) => ({
                id: attendee.id,
                nickname: attendee.nickname,
                email: attendee.email,
                phone: attendee.phone || '',
            }));
            return {
                eventId: event.id,
                eventName: event.name,
                eventDate: event.eventDate,
                participants,
            };
        });
        return { data };
    }
};
exports.MarketingService = MarketingService;
exports.MarketingService = MarketingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [events_service_1.EventsService,
        users_service_1.UsersService])
], MarketingService);
//# sourceMappingURL=marketing.service.js.map