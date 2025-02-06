// src/direct-chat/direct-chat.gateway.ts
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { DirectChatService } from './direct-chat.service';
import { DirectMessageEntity } from './direct-message.entity';

@WebSocketGateway({
  cors: {
    origin: '*', // Ajuste conforme sua necessidade de CORS
  },
})
export class DirectChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly directChatService: DirectChatService) {}

  // Dispara quando um cliente se conecta
  handleConnection(client: Socket) {
    console.log(`[DirectChatGateway] Cliente conectado: ${client.id}`);
  }

  // Dispara quando um cliente se desconecta
  handleDisconnect(client: Socket) {
    console.log(`[DirectChatGateway] Cliente desconectado: ${client.id}`);
  }

  // Evento que o front-end emite para entrar em uma sala de DM
  @SubscribeMessage('joinDM')
  async handleJoinDM(client: Socket, payload: { userId: number; otherUserId: number }) {
    const roomName = this.getRoomName(payload.userId, payload.otherUserId);
    console.log(`Cliente ${client.id} entrou na sala: ${roomName}`);
    client.join(roomName);

    // Envia histórico atual de mensagens para o cliente que entrou na sala
    const history = await this.directChatService.getMessagesBetweenUsers(payload.userId, payload.otherUserId);
    client.emit('directChatHistory', history);
  }

  // Evento que o front-end emite ao sair de uma sala de DM
  @SubscribeMessage('leaveDM')
  handleLeaveDM(client: Socket, payload: { userId: number; otherUserId: number }) {
    const roomName = this.getRoomName(payload.userId, payload.otherUserId);
    console.log(`Cliente ${client.id} saiu da sala: ${roomName}`);
    client.leave(roomName);
  }

  // Evento que o front-end emite para enviar uma mensagem
// src/direct-chat/direct-chat.gateway.ts

@SubscribeMessage('sendDirectMessage')
async handleSendDirectMessage(client: Socket, payload: any) {
  console.log('[sendDirectMessage] Recebido:', payload);

  try {
    const savedMsg = await this.directChatService.addMessage({
      senderId: payload.senderId,
      receiverId: payload.receiverId,
      content: payload.content,
      timestamp: new Date(payload.timestamp),
    });

    if (!savedMsg || !savedMsg.id) {
      console.error('[Erro] Falha ao salvar a mensagem no banco.');
      return;
    }

    // Emitir para a sala de chat
    const roomName = this.getRoomName(payload.senderId, payload.receiverId);
    this.server.to(roomName).emit('receiveDirectMessage', savedMsg);

    // Emitir atualização de conversa para ambos os usuários
    this.server.emit('conversationUpdate', {
      otherUserId: payload.receiverId,
      lastMessage: savedMsg.content,
      lastMessageTime: savedMsg.timestamp,
    });
    this.server.emit('conversationUpdate', {
      otherUserId: payload.senderId,
      lastMessage: savedMsg.content,
      lastMessageTime: savedMsg.timestamp,
    });
    
  } catch (error) {
    console.error('[Erro] Erro ao salvar mensagem:', error);
  }
}

  /**
   * Método para emitir atualizações de conversas (ex.: quando uma mensagem é enviada).
   * Pode ser chamado diretamente do service ou de outro lugar no gateway.
   */
  sendConversationUpdate(updatedConversation: {
    receiverId: number;
    content: string;
    timestamp: string;
  }) {
    console.log('Emitindo atualização de conversa:', updatedConversation);
    this.server.emit('conversationUpdate', {
      otherUserId: updatedConversation.receiverId,
      lastMessage: updatedConversation.content,
      lastMessageTime: updatedConversation.timestamp,
    });
  }

  /**
   * Gera o nome de sala para dois IDs de usuário.
   * Exemplo: userId=1, otherUserId=5 => sala "dm-1-5" (ordenado).
   */
  private getRoomName(userA: number, userB: number) {
    const sorted = [userA, userB].sort((a, b) => a - b);
    return `dm-${sorted[0]}-${sorted[1]}`;
  }
}
