// src/events/events.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Req,
  ForbiddenException,
  NotFoundException,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UsePipes,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Event } from './event.entity';
import { User } from '../users/user.entity';
import { UserRole } from '../users/dto/user-role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Express } from 'express';
import { ChatMessage, ChatService } from '../chat/chat.service';

@UseGuards(AuthGuard('jwt'))
@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly chatService: ChatService, // Injeção do ChatService
  ) {}

  private readonly logger = new Logger(EventsController.name);

  /**
   * 🔹 Cria um novo evento.
   */
  @Post()
  @UseInterceptors(
    FileInterceptor('coverImage', {
      storage: diskStorage({
        destination: './uploads/events',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (
          file.mimetype === 'image/jpeg' ||
          file.mimetype === 'image/png' ||
          file.mimetype === 'image/jpg'
        ) {
          callback(null, true);
        } else {
          callback(
            new Error('Apenas arquivos de imagem são permitidos!'),
            false,
          );
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  @UsePipes(new ValidationPipe({ transform: true }))
  async createEvent(
    @Body() createEventDto: CreateEventDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<Event> {
    this.logger.debug(
      `createEventDto recebido: ${JSON.stringify(createEventDto)}`,
    );
    this.logger.debug(
      `isFree no controlador: ${createEventDto.isFree} (${typeof createEventDto.isFree})`,
    );

    const user = req.user as User;
    if (
      user.role !== UserRole.ORGANIZER &&
      user.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('Permission denied to create events.');
    }
    const coverImage = file ? file.path : null;
    return this.eventsService.createEvent(createEventDto, user, coverImage);
  }

  /**
   * 🔹 Recupera eventos para gerenciamento.
   */
  @Get('manage')
  async getEventsForManagement(@Req() req: Request): Promise<Event[]> {
    const user = req.user as User;

    if (user.role === UserRole.ADMIN) {
      return this.eventsService.findAllEvents();
    }

    if (user.role === UserRole.ORGANIZER) {
      return this.eventsService.findEventsByCreator(user.id);
    }

    throw new ForbiddenException('Permission denied.');
  }

  /**
   * 🔹 Recupera todos os eventos com histórico de visitas.
   */
  @Get('all')
  async findAll(): Promise<any[]> {
    const events = await this.eventsService.findAllEvents();

    const processedEvents = await Promise.all(
      events.map(async (event) => {
        const visitHistory = await this.eventsService.getVisitHistory(event.id);
        return {
          ...event,
          visitHistory, // Adiciona os dados processados
        };
      }),
    );

    return processedEvents;
  }

  /**
   * 🔹 Recupera eventos criados pelo usuário atual.
   */
  @Get('user')
  async findEventsByUser(@Req() req: Request): Promise<Event[]> {
    const user = req.user as User;
    return this.eventsService.findEventsByCreator(user.id);
  }

  /**
   * 🔹 Recupera um evento específico pelo ID.
   */
  @Get(':id')
  async findOneEvent(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Event> {
    const event = await this.eventsService.findOneEvent(id);
    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found.`);
    }
    return event;
  }

  /**
   * 🔹 Atualiza um evento existente.
   */
  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('coverImage', {
      storage: diskStorage({
        destination: './uploads/events',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (
          file.mimetype === 'image/jpeg' ||
          file.mimetype === 'image/png' ||
          file.mimetype === 'image/jpg'
        ) {
          callback(null, true);
        } else {
          callback(
            new Error('Apenas arquivos de imagem são permitidos!'),
            false,
          );
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ): Promise<Event> {
    const user = req.user as User;
    const event = await this.eventsService.findOneEvent(id);

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found.`);
    }

    if (
      user.role !== UserRole.ADMIN &&
      (user.role !== UserRole.ORGANIZER || event.creatorUser.id !== user.id)
    ) {
      throw new ForbiddenException('Permission denied to update this event.');
    }

    const coverImage = file ? file.path : event.coverImage;
    return this.eventsService.updateEvent(id, updateEventDto, user, coverImage);
  }

  /**
   * 🔹 Deleta um evento existente.
   */
  @Delete(':id')
  async deleteEvent(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ): Promise<void> {
    const user = req.user as User;
    const event = await this.eventsService.findOneEvent(id);

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found.`);
    }

    if (
      user.role !== UserRole.ADMIN &&
      (user.role !== UserRole.ORGANIZER || event.creatorUser.id !== user.id)
    ) {
      throw new ForbiddenException('Permission denied to delete this event.');
    }

    return this.eventsService.deleteEvent(id, user);
  }

  /**
   * 🔹 Marca um usuário como "going" para um evento.
   */
  @Patch(':id/going')
  async markGoing(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ): Promise<Event> {
    const user = req.user as User;
    await this.eventsService.markGoing(id, user.id);
    return this.eventsService.findOneEvent(id);
  }

  /**
   * 🔹 Desmarca um usuário como "going" para um evento.
   */
  @Delete(':id/going')
  async unmarkGoing(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ): Promise<Event> {
    const user = req.user as User;
    await this.eventsService.unmarkGoing(id, user.id);
    return this.eventsService.findOneEvent(id);
  }

  /**
   * 🔹 Recupera o preview do chat de um evento.
   */
  @Get(':id/chat/preview')
  async getChatPreview(
    @Param('id', ParseIntPipe) eventId: number,
  ): Promise<{ messages: ChatMessage[] }> {
    this.logger.log(
      `Recebendo requisição para preview do chat do evento ID: ${eventId}`,
    );

    // Aguarde a resolução da Promise retornada por getMessagesForEvent
    const messages = await this.chatService.getMessagesForEvent(eventId);

    this.logger.log(`Mensagens encontradas: ${JSON.stringify(messages)}`);
    return { messages };
  }

  /**
   * 🔹 Endpoint para registrar uma visita a um evento.
   * PATCH /events/:id/visit
   */
  @Patch(':id/visit')
  async registerVisit(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: Request,
  ): Promise<void> {
    const user = req.user as User;
    if (!user) {
      throw new ForbiddenException('Usuário não autenticado.');
    }
    await this.eventsService.registerVisit(id, user.id);
    // Nenhuma resposta ou notificação é enviada ao usuário
  }
}
