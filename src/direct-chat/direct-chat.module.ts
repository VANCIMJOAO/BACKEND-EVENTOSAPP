import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DirectMessageEntity } from './direct-message.entity';
import { DirectChatService } from './direct-chat.service';
import { DirectChatGateway } from './direct-chat.gateway';
import { DirectChatController } from './direct-chat.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DirectMessageEntity])], // Registro da entidade aqui
  providers: [DirectChatService, DirectChatGateway], // Serviços e gateways
  controllers: [DirectChatController], // Controladores
  exports: [DirectChatService], // Exporta o serviço para outros módulos
})
export class DirectChatModule {}
