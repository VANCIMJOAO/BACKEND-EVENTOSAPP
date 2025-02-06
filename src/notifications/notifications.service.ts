// notifications.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification, NotificationType, NotificationStatus } from './notification.entity';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import fetch from 'node-fetch';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  // Cria e salva a notificação no banco de dados
  async createNotification(
    receiver: User,
    type: NotificationType,
    message: string,
    data?: { eventId?: number; invitationId?: number; friendRequestId?: number },
    sender?: User,
  ): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      receiver: { id: receiver.id },
      type,
      message,
      data,
      sender: sender ? { id: sender.id } : null,
      status: NotificationStatus.UNREAD,
    });

    return this.notificationsRepository.save(notification);
  }

  // Busca as notificações do usuário
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { receiver: { id: userId } },
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
    });
  }

  // Marca uma notificação como lida
  async markAsRead(userId: number, notificationId: number): Promise<void> {
    const notification = await this.notificationsRepository.findOne({
      where: { id: notificationId, receiver: { id: userId } },
      relations: ['receiver'],
    });

    if (!notification) {
      throw new NotFoundException('Notificação não encontrada.');
    }

    notification.status = NotificationStatus.READ;
    await this.notificationsRepository.save(notification);
  }

  // Envia a push notification utilizando a API do Expo
  private async sendPushNotification(
    expoPushToken: string,
    title: string,
    body: string,
    data?: object
  ) {
    console.log('ExpoPushToken recebido:', expoPushToken);
    if (!expoPushToken.startsWith('ExponentPushToken')) {
      throw new BadRequestException('Token inválido');
    }

    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data,
    };

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const dataResponse = await response.json();
    console.log("Resposta Expo:", dataResponse);
  }

  // Cria a notificação, salva no banco e envia a push notification
  async sendAndSaveNotification(
    receiver: User,
    type: NotificationType,
    message: string,
    expoPushToken: string,
    data?: { eventId?: number; invitationId?: number; friendRequestId?: number; userId?: number },
    sender?: User,
  ): Promise<Notification> {
    // Salva a notificação no banco de dados
    const notification = await this.createNotification(receiver, type, message, data, sender);
    
    // Envia a push notification
    try {
      await this.sendPushNotification(
        expoPushToken,
        this.getNotificationTitle(type),
        message,
        { ...data, notificationId: notification.id }
      );
    } catch (error) {
      console.error('Erro ao enviar push notification:', error);
    }

    return notification;
  }

  private getNotificationTitle(type: NotificationType): string {
    switch (type) {
      case NotificationType.FRIEND_REQUEST:
        return 'Nova Solicitação de Amizade';
      case NotificationType.EVENT_INVITATION:
        return 'Novo Convite para Evento';
      case NotificationType.MESSAGE:
        return 'Nova Mensagem';
      default:
        return 'Nova Notificação';
    }
  }
}
