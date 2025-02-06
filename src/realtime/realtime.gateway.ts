// src/realtime/realtime.gateway.ts
import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  
  @WebSocketGateway({
    cors: {
      origin: '*', // ajuste conforme os domínios permitidos
    },
  })
  export class RealtimeGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    // Um mapa simples para armazenar: userId -> socket.id
    private activeUsers: Map<number, string> = new Map();
  
    afterInit(server: Server) {
      console.log('Realtime Gateway inicializado');
    }
  
    handleConnection(client: Socket) {
      console.log(`Cliente conectado: ${client.id}`);
      // Se enviar o token como query, você pode extrair o userId a partir dele.
      // Exemplo: http://localhost?userId=123
      const { userId } = client.handshake.query;
      if (userId) {
        // Converter para número e armazenar
        this.activeUsers.set(Number(userId), client.id);
        console.log(`Usuário ${userId} associado ao socket ${client.id}`);
      }
    }
  
    handleDisconnect(client: Socket) {
      console.log(`Cliente desconectado: ${client.id}`);
      // Remover o usuário associado
      for (const [userId, socketId] of this.activeUsers.entries()) {
        if (socketId === client.id) {
          this.activeUsers.delete(userId);
          break;
        }
      }
    }
  
    // Método para enviar notificação para um usuário (se estiver conectado)
    notifyUser(userId: number, payload: any) {
      const socketId = this.activeUsers.get(userId);
      if (socketId) {
        this.server.to(socketId).emit('notification', payload);
        console.log(`Notificação enviada para o usuário ${userId} no socket ${socketId}`);
      } else {
        console.log(`Usuário ${userId} não está conectado`);
      }
    }
  
    // Exemplo de método para juntar uma sala, se necessário
    @SubscribeMessage('joinRoom')
    handleJoinRoom(@MessageBody() data: { room: string }, @ConnectedSocket() client: Socket) {
      client.join(data.room);
      client.emit('joinedRoom', { room: data.room });
    }
  }
  