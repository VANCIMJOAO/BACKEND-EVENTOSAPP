import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { User } from '../users/user.entity';
import { EventsGateway } from './events.gateway';
import { EventVisit } from './event-visit.entity';
export declare class EventsService {
    private readonly eventsRepository;
    private readonly eventVisitRepository;
    private readonly eventsGateway;
    private readonly logger;
    constructor(eventsRepository: Repository<Event>, eventVisitRepository: Repository<EventVisit>, eventsGateway: EventsGateway);
    createEvent(createEventDto: CreateEventDto, user: User, coverImage: string | null): Promise<Event>;
    findAllEvents(): Promise<any[]>;
    findOneEvent(id: number): Promise<Event>;
    updateEvent(id: number, updateEventDto: Partial<UpdateEventDto>, user: User, coverImage: string | null): Promise<Event>;
    deleteEvent(id: number, user: User): Promise<void>;
    findEventsByCreator(creatorId: number): Promise<Event[]>;
    markGoing(eventId: number, userId: number): Promise<Event>;
    unmarkGoing(eventId: number, userId: number): Promise<Event>;
    searchEventsByName(term: string): Promise<Event[]>;
    findAllPublicEvents(): Promise<Event[]>;
    registerVisit(eventId: number, userId: number): Promise<void>;
    getVisitHistory(eventId: number): Promise<{
        hour: number;
        count: number;
    }[]>;
    findAllEventsFull(): Promise<Event[]>;
}
