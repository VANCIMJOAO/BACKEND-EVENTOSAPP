import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Request } from 'express';
import { Event } from './event.entity';
import { ChatMessage, ChatService } from '../chat/chat.service';
export declare class EventsController {
    private readonly eventsService;
    private readonly chatService;
    constructor(eventsService: EventsService, chatService: ChatService);
    private readonly logger;
    createEvent(createEventDto: CreateEventDto, file: Express.Multer.File, req: Request): Promise<Event>;
    getEventsForManagement(req: Request): Promise<Event[]>;
    findAll(): Promise<any[]>;
    findEventsByUser(req: Request): Promise<Event[]>;
    findOneEvent(id: number): Promise<Event>;
    updateEvent(id: number, updateEventDto: UpdateEventDto, file: Express.Multer.File, req: Request): Promise<Event>;
    deleteEvent(id: number, req: Request): Promise<void>;
    markGoing(id: number, req: Request): Promise<Event>;
    unmarkGoing(id: number, req: Request): Promise<Event>;
    getChatPreview(eventId: number): Promise<{
        messages: ChatMessage[];
    }>;
    registerVisit(id: number, req: Request): Promise<void>;
}
