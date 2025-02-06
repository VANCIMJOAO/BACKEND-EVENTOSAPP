// src/event-invitations/event-invitations.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { EventInvitation, InvitationStatus } from './event-invitation.entity';
import { User } from '../users/user.entity';
import { Event } from '../events/event.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/notification.entity';

@Injectable()
export class EventInvitationsService {
  constructor(
    @InjectRepository(EventInvitation)
    private invitationsRepository: Repository<EventInvitation>,
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private notificationsService: NotificationsService,
  ) {}

  async sendInvites(sender: User, eventId: number, receiverIds: number[]): Promise<void> {
    const event = await this.eventsRepository.findOne({
      where: { id: eventId },
      relations: ['creatorUser'],
    });

    if (!event) {
      throw new NotFoundException('Evento não encontrado.');
    }

    if (event.creatorUser.id !== sender.id && sender.role !== 'ADMIN') {
      throw new ForbiddenException('Você não tem permissão para convidar para este evento.');
    }

    const existingInvitations = await this.invitationsRepository.find({
      where: {
        event: { id: eventId },
        receiver: { id: In(receiverIds) },
        status: InvitationStatus.PENDING,
      },
    });

    const existingReceiverIds = existingInvitations.map((inv) => inv.receiver.id);
    const newReceiverIds = receiverIds.filter((id) => !existingReceiverIds.includes(id));

    if (newReceiverIds.length === 0) {
      throw new BadRequestException('Todos os amigos selecionados já foram convidados.');
    }

    const newReceivers = await this.usersRepository.find({
      where: { id: In(newReceiverIds) },
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
        await this.notificationsService.sendAndSaveNotification(
          receiver,
          NotificationType.EVENT_INVITATION,
          `${sender.nickname} te convidou para o evento "${event.name}".`,
          receiver.expoPushToken,
          { eventId: event.id, invitationId: invitation.id },
          sender,
        );
      }
    }
  }

  async respondToInvitation(invitationId: number, userId: number, accept: boolean): Promise<void> {
    const invitation = await this.invitationsRepository.findOne({
      where: { id: invitationId },
      relations: ['event', 'receiver', 'sender'],
    });

    if (!invitation) {
      throw new NotFoundException('Convite não encontrado.');
    }

    if (invitation.receiver.id !== userId) {
      throw new ForbiddenException('Você não tem permissão para responder a este convite.');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Este convite já foi respondido.');
    }

    invitation.status = accept ? InvitationStatus.ACCEPTED : InvitationStatus.REJECTED;
    await this.invitationsRepository.save(invitation);

    if (accept) {
      const event = await this.eventsRepository.findOne({
        where: { id: invitation.event.id },
        relations: ['attendees', 'creatorUser'],
      });

      if (!event) {
        throw new NotFoundException('Evento não encontrado.');
      }

      if (!event.attendees.some((att) => att.id === userId)) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        event.attendees.push(user);
        await this.eventsRepository.save(event);
      }

      if (event.creatorUser.expoPushToken) {
        await this.notificationsService.sendAndSaveNotification(
          event.creatorUser,
          NotificationType.EVENT_ATTENDANCE,
          `${invitation.receiver.nickname} aceitou seu convite para ${event.name}!`,
          event.creatorUser.expoPushToken,
          { eventId: event.id, userId: invitation.receiver.id },
        );
      }
    }
  }

  async getUserInvitations(userId: number): Promise<EventInvitation[]> {
    if (!userId || isNaN(userId)) {
      throw new BadRequestException('ID de usuário inválido.');
    }

    return this.invitationsRepository.find({
      where: { receiver: { id: userId }, status: InvitationStatus.PENDING },
      relations: ['sender', 'event', 'receiver'],
      order: { createdAt: 'DESC' },
    });
  }

  async getEventInvitations(eventId: number): Promise<EventInvitation[]> {
    return this.invitationsRepository.find({
      where: { event: { id: eventId } },
      relations: ['receiver', 'sender'],
      order: { createdAt: 'DESC' },
    });
  }

  async cancelInvitation(invitationId: number, userId: number): Promise<void> {
    const invitation = await this.invitationsRepository.findOne({
      where: { id: invitationId },
      relations: ['sender', 'event'],
    });

    if (!invitation) {
      throw new NotFoundException('Convite não encontrado.');
    }

    if (invitation.sender.id !== userId && invitation.event.creatorUser.id !== userId) {
      throw new ForbiddenException('Você não tem permissão para cancelar este convite.');
    }

    await this.invitationsRepository.remove(invitation);

    if (invitation.receiver.expoPushToken) {
      await this.notificationsService.sendAndSaveNotification(
        invitation.receiver,
        NotificationType.EVENT_UPDATE,
        `O convite para ${invitation.event.name} foi cancelado.`,
        invitation.receiver.expoPushToken,
        { eventId: invitation.event.id },
        invitation.sender,
      );
    }
  }
}
