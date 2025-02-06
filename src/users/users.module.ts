// src/users/users.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { EventsModule } from '../events/events.module';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../common/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { FriendRequestsModule } from './friend-requests/friend-requests.module';
import { NotificationsModule } from '../notifications/notifications.module'; 

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => AuthModule),
    EventsModule,
    FriendRequestsModule,
    NotificationsModule,
  ],
  providers: [
    UsersService,
    RolesGuard,
    Reflector,
  ],
  controllers: [UsersController],
  exports: [
    UsersService,
    TypeOrmModule.forFeature([User]),
  ],
})
export class UsersModule {
  constructor() {
    console.log('UsersModule inicializado');
  }
}

