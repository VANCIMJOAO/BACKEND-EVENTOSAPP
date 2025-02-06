import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { User } from './user.entity';
import { Event as EventEntity } from '../events/event.entity';
import { UserRole } from './dto/user-role.enum';
import { RegisterDto } from '../auth/dto/register.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { plainToInstance } from 'class-transformer';
import * as argon2 from 'argon2';
import { FriendRequestsService } from './friend-requests/friend-requests.service';
import { NotificationType } from '../notifications/notification.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(EventEntity)
    private eventsRepository: Repository<EventEntity>,
    private friendRequestsService: FriendRequestsService,
    private notificationsService: NotificationsService,
  ) {this.logger.debug('UsersService inicializado');
    this.logger.debug(`Dependências injetadas:
      - usersRepository: ${!!this.usersRepository},
      - eventsRepository: ${!!this.eventsRepository},
      - friendRequestsService: ${!!this.friendRequestsService},
      - notificationsService: ${!!this.notificationsService}`);}

  async findOneByEmail(email: string): Promise<User | undefined> {
    this.logger.debug(`Buscando usuário pelo email: ${email}`);
    return this.usersRepository.findOne({ where: { email } });
  }

  async findOneEntityById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['favoriteEvents', 'friends', 'sentFriendRequests', 'receivedFriendRequests'],
    });
  }

  async findOneById(id: number, requestingUserId?: number): Promise<UserProfileDto> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['favoriteEvents', 'friends'],
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
    }

    const isSelf = requestingUserId === user.id;
    const isFriend = user.friends?.some(f => f.id === requestingUserId);

    if (user.isPrivate && !isSelf && !isFriend) {
      return plainToInstance(UserProfileDto, {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar,
        role: user.role,
        isPrivate: user.isPrivate,
      }, { excludeExtraneousValues: true });
    }

    return plainToInstance(UserProfileDto, user, { excludeExtraneousValues: true });
  }

  async create(registerDto: RegisterDto): Promise<User> {
    this.logger.debug(`Criando usuário com email: ${registerDto.email}`);
    const hashedPassword = await argon2.hash(registerDto.password);
    const user = this.usersRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      nickname: registerDto.nickname,
      cpf: registerDto.cpf.replace(/\D/g, ''),
      role: UserRole.USER,
    });
    return this.usersRepository.save(user);
  }

  async update(id: number, updateData: Partial<User>): Promise<UserProfileDto | null> {
    this.logger.debug(`Atualizando usuário com ID: ${id} - Dados: ${JSON.stringify(updateData)}`);
    await this.usersRepository.update(id, updateData);
    const updatedUser = await this.usersRepository.findOne({
      where: { id },
      relations: ['favoriteEvents', 'friends'],
    });
    return plainToInstance(UserProfileDto, updatedUser, { excludeExtraneousValues: true });
  }

  async toggleFavoriteEvent(userId: number, eventId: number): Promise<UserProfileDto | null> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['favoriteEvents'],
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    const index = user.favoriteEvents.findIndex((evt) => evt.id === eventId);
    const event = await this.eventsRepository.findOne({ where: { id: eventId } });

    if (!event) throw new NotFoundException('Evento não encontrado');

    if (index === -1) {
      user.favoriteEvents.push(event);
    } else {
      user.favoriteEvents.splice(index, 1);
    }

    await this.usersRepository.save(user);
    return this.findOneById(userId, userId);
  }

  async assignRole(id: number, role: UserRole): Promise<UserProfileDto | null> {
    await this.usersRepository.update(id, { role });
    return this.findOneById(id, id);
  }

  async getFavorites(userId: number): Promise<EventEntity[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['favoriteEvents'],
    });
    return user?.favoriteEvents || [];
  }

  async isEventFavorited(userId: number, eventId: number): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['favoriteEvents'],
    });
    return user?.favoriteEvents?.some((evt) => evt.id === eventId) || false;
  }

  async addFriend(userId: number, friendId: number): Promise<UserProfileDto> {
    if (userId === friendId) throw new ForbiddenException('Não pode adicionar a si mesmo');

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

    if (!user || !friend) throw new NotFoundException('Usuário não encontrado');
    if (user.friends.some(f => f.id === friendId)) throw new NotFoundException('Já são amigos');

    if (friend.isPrivate) {
      const request = await this.friendRequestsService.createRequest(userId, friendId);

      await this.notificationsService.createNotification(
        friend,
        NotificationType.FRIEND_REQUEST,
        `${user.nickname} enviou solicitação de amizade`,
        { friendRequestId: request.id },
        user
      );

      throw new ForbiddenException('Solicitação enviada para perfil privado');
    }

    user.friends.push(friend);
    friend.friends.push(user);
    await this.usersRepository.save([user, friend]);

    await this.notificationsService.createNotification(
      friend,
      NotificationType.FRIEND_REQUEST,
      `${user.nickname} adicionou você como amigo`,
      { friendRequestId: null },
      user
    );

    return this.findOneById(userId, userId) as Promise<UserProfileDto>;
  }

  async removeFriend(userId: number, friendId: number): Promise<UserProfileDto> {
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

    if (!user || !friend) throw new NotFoundException('Usuário não encontrado');

    user.friends = user.friends.filter(f => f.id !== friendId);
    friend.friends = friend.friends.filter(f => f.id !== userId);
    await this.usersRepository.save([user, friend]);

    await this.notificationsService.createNotification(
      friend,
      NotificationType.FRIEND_REQUEST,
      `${user.nickname} removeu a amizade`,
      null,
      user
    );

    return this.findOneById(userId, userId) as Promise<UserProfileDto>;
  }

  async listFriends(userId: number): Promise<User[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['friends'],
    });
    return user?.friends || [];
  }

  async searchUsersByNickname(term: string) {
    return this.usersRepository.find({
      where: { nickname: Like(`%${term}%`) },
      select: ['id', 'nickname', 'avatar', 'role'],
    });
  }

  async getGoingEvents(userId: number): Promise<EventEntity[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['attendingEvents'],
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado.');
    }

    return user.attendingEvents || [];
  }

  async updateExpoPushToken(userId: number, token: string): Promise<UserProfileDto> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    // Atualiza o token
    user.expoPushToken = token;
    const updatedUser = await this.usersRepository.save(user);
    // Retorna o perfil atualizado convertido para DTO
    return plainToInstance(UserProfileDto, updatedUser, { excludeExtraneousValues: true });
  }
}
