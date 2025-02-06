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
var EventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const event_entity_1 = require("./event.entity");
const user_entity_1 = require("../users/user.entity");
const user_role_enum_1 = require("../users/dto/user-role.enum");
const events_gateway_1 = require("./events.gateway");
const event_visit_entity_1 = require("./event-visit.entity");
const moment = require("moment-timezone");
let EventsService = EventsService_1 = class EventsService {
    constructor(eventsRepository, eventVisitRepository, eventsGateway) {
        this.eventsRepository = eventsRepository;
        this.eventVisitRepository = eventVisitRepository;
        this.eventsGateway = eventsGateway;
        this.logger = new common_1.Logger(EventsService_1.name);
    }
    async createEvent(createEventDto, user, coverImage) {
        this.logger.log(`Creating event for user: ${user.email}`);
        this.logger.debug(`DTO recebido: ${JSON.stringify(createEventDto)}`);
        const { name, description, categories, placeName, eventDate, startTime, endTime, address, isFree, ticketPrice, registrationStatus, } = createEventDto;
        this.logger.debug(`isFree recebido: ${isFree} (${typeof isFree})`);
        const timeZone = 'America/Sao_Paulo';
        let adjustedEventDate = moment.tz(eventDate, timeZone).utc().toDate();
        let adjustedStartTime = moment.tz(startTime, timeZone).utc().toDate();
        let adjustedEndTime = moment.tz(endTime, timeZone).utc().toDate();
        if (adjustedEndTime < adjustedStartTime) {
            adjustedEndTime = moment(adjustedEndTime).add(1, 'day').toDate();
        }
        const event = this.eventsRepository.create({
            name,
            description,
            coverImage,
            categories,
            placeName,
            eventDate: adjustedEventDate,
            startTime: adjustedStartTime,
            endTime: adjustedEndTime,
            address,
            isFree,
            ticketPrice: isFree ? null : ticketPrice,
            registrationStatus: registrationStatus || 'open',
            creatorUser: user,
            attendees: [],
            attendeesCount: 0,
            interested: [],
            interestedCount: 0,
            visitCount: 0,
        });
        this.logger.debug(`Evento criado: ${JSON.stringify(event)}`);
        try {
            return await this.eventsRepository.save(event);
        }
        catch (error) {
            this.logger.error('Error creating event', error.stack);
            throw new common_1.BadRequestException('Erro ao criar o evento.');
        }
    }
    async findAllEvents() {
        const events = await this.eventsRepository.find({
            relations: [
                'creatorUser',
                'attendees',
                'interested',
                'eventVisits',
                'eventVisits.user',
            ],
            select: [
                'id',
                'name',
                'eventDate',
                'placeName',
                'categories',
                'address',
                'coverImage',
                'attendeesCount',
                'visitCount',
            ],
        });
        return events.map((event) => ({
            id: event.id,
            title: event.name,
            eventDate: event.eventDate,
            location: event.placeName,
            address: event.address,
            categories: event.categories || ['Geral'],
            latitude: event.latitude,
            longitude: event.longitude,
            attendees: event.attendees.map((attendee) => ({
                id: attendee.id,
                profileImage: attendee.avatar || 'https://via.placeholder.com/150',
            })),
            attendeesCount: event.attendeesCount,
            visitCount: event.visitCount,
            image: event.coverImage,
            creatorUser: {
                id: event.creatorUser.id,
                nickname: event.creatorUser.nickname,
                profileImage: event.creatorUser.avatar,
            },
            visitHistory: [],
        }));
    }
    async findOneEvent(id) {
        const event = await this.eventsRepository.findOne({
            where: { id },
            relations: [
                'creatorUser',
                'attendees',
                'interested',
                'eventVisits',
                'eventVisits.user',
            ],
        });
        if (!event) {
            throw new common_1.NotFoundException(`Event with ID ${id} not found.`);
        }
        return event;
    }
    async updateEvent(id, updateEventDto, user, coverImage) {
        const event = await this.findOneEvent(id);
        if (!event) {
            throw new common_1.NotFoundException(`Evento com ID ${id} não encontrado.`);
        }
        if (user.role !== user_role_enum_1.UserRole.ADMIN && event.creatorUser.id !== user.id) {
            throw new common_1.ForbiddenException('Você não tem permissão para atualizar este evento.');
        }
        const { name, description, categories, placeName, eventDate, startTime, endTime, address, isFree, ticketPrice, registrationStatus, } = updateEventDto;
        const timeZone = 'America/Sao_Paulo';
        let adjustedEndTime = endTime
            ? moment.tz(endTime, timeZone).utc().toDate()
            : event.endTime;
        let adjustedStartTime = startTime
            ? moment.tz(startTime, timeZone).utc().toDate()
            : event.startTime;
        let adjustedEventDate = eventDate
            ? moment.tz(eventDate, timeZone).utc().toDate()
            : event.eventDate;
        if (adjustedEndTime < adjustedStartTime) {
            adjustedEndTime = moment(adjustedEndTime)
                .add(1, 'day')
                .utc()
                .toDate();
        }
        Object.assign(event, {
            name: name ?? event.name,
            description: description ?? event.description,
            coverImage: coverImage ?? event.coverImage,
            categories: categories ?? event.categories,
            placeName: placeName ?? event.placeName,
            eventDate: adjustedEventDate,
            startTime: adjustedStartTime,
            endTime: adjustedEndTime,
            address: address ?? event.address,
            isFree: isFree !== undefined ? isFree : event.isFree,
            ticketPrice: isFree ? null : ticketPrice ?? event.ticketPrice,
            registrationStatus: registrationStatus ?? event.registrationStatus,
            visitCount: event.visitCount,
        });
        try {
            const updatedEvent = await this.eventsRepository.save(event);
            return updatedEvent;
        }
        catch (error) {
            this.logger.error('Erro ao atualizar evento:', error.stack);
            throw new common_1.BadRequestException('Erro ao atualizar o evento.');
        }
    }
    async deleteEvent(id, user) {
        const event = await this.findOneEvent(id);
        if (user.role !== user_role_enum_1.UserRole.ADMIN && event.creatorUser.id !== user.id) {
            throw new common_1.ForbiddenException('Você não tem permissão para deletar este evento.');
        }
        await this.eventsRepository.delete(id);
    }
    async findEventsByCreator(creatorId) {
        return this.eventsRepository.find({
            where: { creatorUser: { id: creatorId } },
            relations: [
                'creatorUser',
                'attendees',
                'interested',
                'eventVisits',
                'eventVisits.user',
            ],
        });
    }
    async markGoing(eventId, userId) {
        const event = await this.findOneEvent(eventId);
        const user = await this.eventsRepository.manager.findOne(user_entity_1.User, {
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.NotFoundException(`Usuário com ID ${userId} não encontrado.`);
        }
        if (!event.attendees.some((attendee) => attendee.id === userId)) {
            event.attendees.push(user);
            event.attendeesCount++;
        }
        return this.eventsRepository.save(event);
    }
    async unmarkGoing(eventId, userId) {
        const event = await this.findOneEvent(eventId);
        const newAttendees = event.attendees.filter((u) => u.id !== userId);
        if (newAttendees.length < event.attendees.length) {
            event.attendees = newAttendees;
            event.attendeesCount = Math.max(0, event.attendeesCount - 1);
        }
        return this.eventsRepository.save(event);
    }
    async searchEventsByName(term) {
        return this.eventsRepository.find({
            where: { name: (0, typeorm_2.Like)(`%${term}%`) },
            select: ['id', 'name', 'eventDate', 'coverImage'],
            relations: ['creatorUser'],
        });
    }
    async findAllPublicEvents() {
        return this.eventsRepository.find({
            where: { registrationStatus: 'open' },
            relations: ['creatorUser', 'attendees', 'interested'],
        });
    }
    async registerVisit(eventId, userId) {
        const event = await this.eventsRepository.findOne({ where: { id: eventId } });
        if (!event) {
            throw new common_1.NotFoundException(`Evento com ID ${eventId} não encontrado.`);
        }
        const existingVisit = await this.eventVisitRepository.findOne({
            where: {
                event: { id: eventId },
                user: { id: userId },
            },
        });
        if (existingVisit) {
            this.logger.warn(`Usuário ID ${userId} já registrou uma visita para o evento ID ${eventId}.`);
            return;
        }
        const visit = this.eventVisitRepository.create({
            event,
            user: { id: userId },
        });
        await this.eventVisitRepository.save(visit);
        event.visitCount++;
        await this.eventsRepository.save(event);
    }
    async getVisitHistory(eventId) {
        const event = await this.eventsRepository.findOne({ where: { id: eventId } });
        if (!event) {
            throw new common_1.NotFoundException(`Evento com ID ${eventId} não encontrado.`);
        }
        const rawVisits = await this.eventVisitRepository
            .createQueryBuilder('eventVisit')
            .select("EXTRACT(HOUR FROM eventVisit.visitedAt AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')", 'hour')
            .addSelect('COUNT(*)', 'count')
            .where('eventVisit.eventId = :eventId', { eventId })
            .groupBy('hour')
            .orderBy('hour', 'ASC')
            .getRawMany();
        const visitCounts = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
        rawVisits.forEach((visit) => {
            const hour = parseInt(visit.hour, 10);
            const count = parseInt(visit.count, 10);
            if (!isNaN(hour) && hour >= 0 && hour < 24) {
                visitCounts[hour].count = count;
            }
        });
        return visitCounts;
    }
    async findAllEventsFull() {
        return this.eventsRepository.find({
            relations: [
                'creatorUser',
                'attendees',
            ],
        });
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = EventsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(event_entity_1.Event)),
    __param(1, (0, typeorm_1.InjectRepository)(event_visit_entity_1.EventVisit)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        events_gateway_1.EventsGateway])
], EventsService);
//# sourceMappingURL=events.service.js.map