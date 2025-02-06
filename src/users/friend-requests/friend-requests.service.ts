// src/users/friend-requests/friend-requests.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FriendRequest, FriendRequestStatus } from './friend-request.entity';
import { User } from '../user.entity';
import { NotificationsService } from '../../notifications/notifications.service';
import { NotificationType } from '../../notifications/notification.entity';
import { RealtimeGateway } from '../../realtime/realtime.gateway';

@Injectable()
export class FriendRequestsService {
  constructor(
    @InjectRepository(FriendRequest)
    private friendRequestRepo: Repository<FriendRequest>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private notificationsService: NotificationsService,
    @InjectDataSource() private dataSource: DataSource,
    private realtimeGateway: RealtimeGateway, // injeção do gateway
  ) {}

  async createRequest(senderId: number, receiverId: number): Promise<FriendRequest> {
    if (senderId === receiverId) {
      throw new ForbiddenException('Não pode enviar solicitação a si mesmo.');
    }
  
    const [sender, receiver] = await Promise.all([
      this.userRepo.findOneBy({ id: senderId }),
      this.userRepo.findOneBy({ id: receiverId }),
    ]);
  
    if (!sender || !receiver) {
      throw new NotFoundException('Usuário não encontrado.');
    }
  
    const existing = await this.friendRequestRepo.findOne({
      where: {
        sender: { id: senderId },
        receiver: { id: receiverId },
        status: FriendRequestStatus.PENDING,
      },
    });
  
    if (existing) {
      throw new ForbiddenException('Solicitação pendente já existe.');
    }
  
    const newFriendRequest = await this.friendRequestRepo.save({
      sender,
      receiver,
      status: FriendRequestStatus.PENDING,
    });
  
    // Envie uma notificação push (se aplicável)
    if (receiver.expoPushToken) {
      const message = `${sender.nickname} enviou uma solicitação de amizade.`;
      try {
        await this.notificationsService.sendAndSaveNotification(
          receiver,
          NotificationType.FRIEND_REQUEST,
          message,
          receiver.expoPushToken,
          { friendRequestId: newFriendRequest.id },
          sender,
        );
      } catch (error) {
        console.error('Erro ao enviar push notification:', error);
      }
    }
  
    // Notificar o receptor em tempo real
    this.realtimeGateway.notifyUser(receiver.id, {
      type: 'FRIEND_REQUEST',
      message: `${sender.nickname} enviou uma solicitação de amizade.`,
      data: { friendRequestId: newFriendRequest.id },
      createdAt: new Date(),
      status: 'PENDING', // Agora o status é PENDING
      // **Inclua as informações do sender**
      sender: {
        id: sender.id,
        nickname: sender.nickname,
        avatar: sender.avatar,
      },
    });
  
    return newFriendRequest;
  }
  

  async getReceivedRequests(userId: number): Promise<FriendRequest[]> {
    const requests = await this.friendRequestRepo.find({
      where: { receiver: { id: userId } },
      relations: ['sender'],
      order: { createdAt: 'DESC' },
    });
    return requests;
  }

  async acceptRequest(requestId: number, userId: number): Promise<FriendRequest> {
    return this.dataSource.transaction(async (manager) => {
      const request = await manager.findOne(FriendRequest, {
        where: { id: requestId },
        relations: ['sender', 'receiver'],
      });
      if (!request) throw new NotFoundException('Solicitação não encontrada');
      if (request.receiver.id !== userId) throw new ForbiddenException('Ação não permitida');
      if (request.status !== FriendRequestStatus.PENDING)
        throw new ForbiddenException('Solicitação já processada');

      request.status = FriendRequestStatus.ACCEPTED;
      await manager.save(request);

      const sender = await manager.findOne(User, {
        where: { id: request.sender.id },
        relations: ['friends'],
      });
      const receiver = await manager.findOne(User, {
        where: { id: request.receiver.id },
        relations: ['friends'],
      });
      if (!sender || !receiver) throw new NotFoundException('Usuário não encontrado');

      sender.friends = sender.friends || [];
      receiver.friends = receiver.friends || [];

      if (!sender.friends.some(friend => friend.id === receiver.id)) {
        sender.friends.push(receiver);
      }
      if (!receiver.friends.some(friend => friend.id === sender.id)) {
        receiver.friends.push(sender);
      }

      await manager.save(sender);
      await manager.save(receiver);

      // Notifique o sender (remetente) que sua solicitação foi aceita
      this.realtimeGateway.notifyUser(sender.id, {
        type: 'FRIEND_REQUEST_ACCEPTED',
        message: `${receiver.nickname} aceitou sua solicitação de amizade.`,
        data: { friendRequestId: request.id },
        createdAt: new Date(),
        status: 'UNREAD',
      });

      return request;
    });
  }

  async rejectRequest(requestId: number, userId: number): Promise<FriendRequest> {
    return this.dataSource.transaction(async (manager) => {
      const request = await manager.findOne(FriendRequest, {
        where: { id: requestId },
        relations: ['receiver', 'sender'], // Certifique-se de incluir 'sender'
      });
  
      if (!request) throw new NotFoundException('Solicitação não encontrada');
      if (request.receiver.id !== userId) throw new ForbiddenException('Ação não permitida');
      if (request.status !== FriendRequestStatus.PENDING)
        throw new ForbiddenException('Solicitação já processada');
  
      // Se o sender não estiver definido, lance um erro ou trate a situação
      if (!request.sender) {
        throw new NotFoundException('Remetente não encontrado para essa solicitação');
      }
  
      request.status = FriendRequestStatus.REJECTED;
  
      // Notifique o sender que a solicitação foi rejeitada
      this.realtimeGateway.notifyUser(request.sender.id, {
        type: 'FRIEND_REQUEST_REJECTED',
        message: `${request.receiver.nickname} rejeitou sua solicitação de amizade.`,
        data: { friendRequestId: request.id },
        createdAt: new Date(),
        status: 'UNREAD',
      });
  
      return manager.save(request);
    });
  }
  
  
}
