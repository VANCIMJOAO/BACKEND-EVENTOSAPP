// src/chat/chat.gateway.ts

import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ChatService, ChatMessage } from './chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private chatService: ChatService) {}

  handleConnection(socket: Socket) {
    console.log(`Cliente conectado: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    console.log(`Cliente desconectado: ${socket.id}`);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @MessageBody() data: { eventId: number; userId: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const roomName = `event_${data.eventId}`;
    socket.join(roomName);
    console.log(`Usuário ${data.userId} entrou na sala ${roomName}`);

    const history = await this.chatService.getMessagesForEvent(data.eventId);
    console.log(`Enviando histórico de mensagens para a sala ${roomName}:`, history);
    socket.emit('chatHistory', history);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() data: { eventId: number; userId: number },
    @ConnectedSocket() socket: Socket,
  ) {
    const roomName = `event_${data.eventId}`;
    socket.leave(roomName);
    console.log(`Usuário ${data.userId} saiu da sala ${roomName}`);
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody()
    payload: {
      id: string; // Recebe o ID do cliente
      eventId: number;
      senderId: number;
      senderName: string;
      content: string;
    },
    @ConnectedSocket() socket: Socket,
  ): Promise<{ status: string }> { // Define o tipo de retorno para o acknowledgment
    console.log('Evento sendMessage recebido com payload:', payload);

    const roomName = `event_${payload.eventId}`;
    const newMessage: ChatMessage = {
      id: payload.id, // Usa o ID recebido do cliente
      eventId: payload.eventId,
      senderId: payload.senderId,
      senderName: payload.senderName,
      content: payload.content,
      timestamp: new Date(),
    };

    console.log('Nova mensagem criada:', newMessage);

    await this.chatService.addMessage(newMessage); // Salva no banco de dados
    console.log(`Mensagem adicionada ao serviço de chat.`);

    // Emitir para todos na sala, exceto o remetente
    socket.to(roomName).emit('receiveMessage', newMessage);
    console.log(`Mensagem emitida para a sala ${roomName}.`);

    // Emitir de volta para o remetente
    socket.emit('receiveMessage', newMessage);
    console.log(`Mensagem emitida de volta para o remetente.`);

    // Enviar acknowledgment
    console.log(`Enviando acknowledgment para o cliente: { status: 'ok' }`);
    return { status: 'ok' };
  }

  @SubscribeMessage('typing')
  handleTyping(@MessageBody() data: { eventId: number; userName: string }, @ConnectedSocket() socket: Socket) {
    console.log(`Evento typing recebido:`, data);
    socket.to(`event_${data.eventId}`).emit('userTyping', data);
  }

  @SubscribeMessage('stopTyping')
  handleStopTyping(@MessageBody() data: { eventId: number; userName: string }, @ConnectedSocket() socket: Socket) {
    console.log(`Evento stopTyping recebido:`, data);
    socket.to(`event_${data.eventId}`).emit('stopTyping', data);
  }
}
