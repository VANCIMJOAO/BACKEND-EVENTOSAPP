// src/friend-requests/friend-requests.module.ts

import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendRequest } from './friend-request.entity';
import { FriendRequestsService } from './friend-requests.service';
import { FriendRequestsController } from './friend-requests.controller';
import { UsersModule } from '../users.module';
import { NotificationsModule } from '../../notifications/notifications.module';
import { RealtimeModule } from '../../realtime/realtime.module';  // Importação do módulo realtime

@Module({
  imports: [
    TypeOrmModule.forFeature([FriendRequest]),
    forwardRef(() => UsersModule),
    NotificationsModule,
    RealtimeModule, // Adicione aqui
  ],
  providers: [FriendRequestsService],
  controllers: [FriendRequestsController],
  exports: [FriendRequestsService],
})
export class FriendRequestsModule {}
