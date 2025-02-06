// src/users/users.controller.ts
import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  UseGuards,
  Request,
  BadRequestException,
  UnauthorizedException,
  Post,
  Delete,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from './dto/user-role.enum';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { UserProfileDto } from './dto/user-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { EventDto } from '../events/dto/event.dto';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  // Obter perfil do usuário autenticado
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getProfile(@Request() req): Promise<UserProfileDto> {
    this.logger.debug(`Requisição recebida com token: ${req.headers.authorization}`);
    this.logger.debug(`Usuário autenticado: ${JSON.stringify(req.user)}`);

    if (!req.user) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }

    const userProfile = await this.usersService.findOneById(req.user.id, req.user.id);
    return plainToInstance(UserProfileDto, userProfile);
  }

  // Atualizar perfil do usuário autenticado
  @UseGuards(AuthGuard('jwt'))
  @Patch('me')
  async updateProfile(
    @Request() req,
    @Body() updateData: CompleteProfileDto,
  ): Promise<UserProfileDto> {
    this.logger.debug(`Payload recebido no backend: ${JSON.stringify(updateData)}`);
    this.logger.debug(`Requisição recebida com ID do usuário: ${req.user.id}`);

    const updatePayload = { ...updateData, isProfileComplete: true };
    const updatedProfile = await this.usersService.update(req.user.id, updatePayload);
    return plainToInstance(UserProfileDto, updatedProfile);
  }

  // Obter perfil de outro usuário
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getUserById(
    @Param('id') id: string,
    @Request() req,
  ): Promise<UserProfileDto> {
    const userId = Number(id);
    if (isNaN(userId)) {
      throw new BadRequestException('ID deve ser um número válido.');
    }
    const profile = await this.usersService.findOneById(userId, req.user.id);
    return plainToInstance(UserProfileDto, profile);
  }

  // Atualizar usuário (apenas ADMIN)
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: UpdateUserDto,
  ): Promise<UserProfileDto> {
    const numericId = Number(id);
    if (isNaN(numericId)) {
      throw new BadRequestException('ID deve ser um número válido.');
    }
    this.logger.debug(`Atualizando usuário com ID: ${numericId}`);
    const updatedProfile = await this.usersService.update(numericId, updateData);
    return plainToInstance(UserProfileDto, updatedProfile);
  }

  // Favoritar/Desfavoritar evento
  @UseGuards(AuthGuard('jwt'))
  @Patch('me/favorites/:eventId')
  async toggleFavorite(
    @Request() req,
    @Param('eventId') eventId: string,
  ): Promise<UserProfileDto> {
    this.logger.debug(`Requisição recebida com token: ${req.headers.authorization}`);
    this.logger.debug(`Usuário no req: ${JSON.stringify(req.user)}`);

    if (!req.user) {
      throw new UnauthorizedException('Usuário não autenticado.');
    }

    const userId = req.user.id;
    const numericEventId = Number(eventId);
    if (isNaN(numericEventId)) {
      throw new BadRequestException('ID do evento deve ser um número válido.');
    }

    this.logger.debug(`Usuário ${userId} deseja favoritar/desfavoritar o evento ${numericEventId}`);
    const updatedProfile = await this.usersService.toggleFavoriteEvent(userId, numericEventId);
    return plainToInstance(UserProfileDto, updatedProfile);
  }

  // Obter eventos favoritos do usuário (usa DTO para eventos)
  @UseGuards(AuthGuard('jwt'))
  @Get('me/favorites')
  async getFavorites(@Request() req): Promise<EventDto[]> {
    const userId = req.user.id;
    const events = await this.usersService.getFavorites(userId);
    return plainToInstance(EventDto, events);
  }

  // Verificar se um evento está favoritado
  @UseGuards(AuthGuard('jwt'))
  @Get('me/favorites/:eventId')
  async checkFavoriteStatus(
    @Request() req,
    @Param('eventId') eventId: string,
  ): Promise<{ isFavorited: boolean }> {
    const userId = req.user.id;
    const numericEventId = Number(eventId);
    if (isNaN(numericEventId)) {
      throw new BadRequestException('ID do evento deve ser um número válido.');
    }
    const isFavorited = await this.usersService.isEventFavorited(userId, numericEventId);
    return { isFavorited };
  }

  // Adicionar amigo
  @UseGuards(AuthGuard('jwt'))
  @Post('me/friends/:friendId')
  async addFriend(
    @Request() req,
    @Param('friendId') friendId: string,
  ): Promise<UserProfileDto> {
    const userId = req.user.id;
    const numericFriendId = Number(friendId);
    if (isNaN(numericFriendId)) {
      throw new BadRequestException('ID do amigo deve ser um número válido.');
    }
    try {
      const profile = await this.usersService.addFriend(userId, numericFriendId);
      return plainToInstance(UserProfileDto, profile);
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  // Remover amigo
  @UseGuards(AuthGuard('jwt'))
  @Delete('me/friends/:friendId')
  async removeFriend(
    @Request() req,
    @Param('friendId') friendId: string,
  ): Promise<UserProfileDto> {
    const userId = req.user.id;
    const numericFriendId = Number(friendId);
    if (isNaN(numericFriendId)) {
      throw new BadRequestException('ID do amigo deve ser um número válido.');
    }
    const profile = await this.usersService.removeFriend(userId, numericFriendId);
    return plainToInstance(UserProfileDto, profile);
  }

  // Listar amigos do usuário autenticado (usa DTO)
  @UseGuards(AuthGuard('jwt'))
  @Get('me/friends')
  async getMyFriends(@Request() req): Promise<UserProfileDto[]> {
    const userId = req.user.id;
    const friends = await this.usersService.listFriends(userId);
    return plainToInstance(UserProfileDto, friends);
  }

  // Listar amigos de outro usuário (usa DTO)
  @UseGuards(AuthGuard('jwt'))
  @Get(':id/friends')
  async getUserFriends(@Param('id') id: string): Promise<UserProfileDto[]> {
    const userId = Number(id);
    if (isNaN(userId)) {
      throw new BadRequestException('ID deve ser um número válido.');
    }
    const friends = await this.usersService.listFriends(userId);
    return plainToInstance(UserProfileDto, friends);
  }

  // Alterar privacidade do usuário autenticado
  @UseGuards(AuthGuard('jwt'))
  @Patch('me/privacy')
  async updatePrivacy(
    @Request() req,
    @Body() body: { isPrivate: boolean },
  ): Promise<UserProfileDto> {
    const { isPrivate } = body;
    this.logger.debug(`Atualizando privacidade do user ${req.user.id} para: ${isPrivate}`);
    const updatedProfile = await this.usersService.update(req.user.id, { isPrivate });
    return plainToInstance(UserProfileDto, updatedProfile);
  }

  // Obter eventos em que o usuário está confirmado (usa DTO para eventos)
  @UseGuards(AuthGuard('jwt'))
  @Get('me/going')
  async getGoingEvents(@Request() req): Promise<EventDto[]> {
    const userId = req.user.id;
    const events = await this.usersService.getGoingEvents(userId);
    return plainToInstance(EventDto, events);
  }

  // Atualizar Expo Push Token do usuário
  @UseGuards(AuthGuard('jwt'))
  @Patch('me/expo-push-token')
  async updateExpoPushToken(
    @Request() req,
    @Body() body: { expoPushToken: string },
  ): Promise<any> {
    this.logger.debug(`Atualizando expoPushToken para usuário ${req.user.id}: ${body.expoPushToken}`);
    if (!body.expoPushToken) {
      throw new BadRequestException('Expo Push Token é obrigatório');
    }
    const updatedUser = await this.usersService.updateExpoPushToken(req.user.id, body.expoPushToken);
    return updatedUser;
  }
}
