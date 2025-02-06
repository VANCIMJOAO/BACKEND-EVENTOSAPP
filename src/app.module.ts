// src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { PrometheusModule, makeCounterProvider } from '@willsoto/nestjs-prometheus';

// Módulos internos do sistema
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { ChatModule } from './chat/chat.module';
import { SearchModule } from './search/search.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EventInvitationsModule } from './event-invitations/event-invitations.module';
import { DirectChatModule } from './direct-chat/direct-chat.module';
import { InsightsModule } from './insights/insights.module';
import { RealtimeModule } from './realtime/realtime.module';
import { MarketingModule } from './marketing/marketing.module';

// Logger
import { AppLogger } from './logger/logger.service';

// Entidades do banco de dados
import { User } from './users/user.entity';
import { FriendRequest } from './users/friend-requests/friend-request.entity';
import { Event } from './events/event.entity';
import { EventInvitation } from './event-invitations/event-invitation.entity';
import { Notification } from './notifications/notification.entity';
import { ChatMessageEntity } from './chat/chat-message.entity';
import { DirectMessageEntity } from './direct-chat/direct-message.entity';
import { EventVisit } from './events/event-visit.entity';

// Throttler personalizado para suportar proxies
import { Injectable } from '@nestjs/common';
import { ThrottlerGuard as BaseThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottlerBehindProxyGuard extends BaseThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    return new Promise<string>((resolve) => {
      // Captura o IP do usuário, considerando que podem existir proxies (req.ips é um array)
      const tracker = req.ips && req.ips.length > 0 ? req.ips[0] : req.ip;
      resolve(tracker);
    });
  }
}

@Module({
  imports: [
    // Carrega as variáveis de ambiente globalmente
    ConfigModule.forRoot({ isGlobal: true }),

    // Configuração do cache com Redis
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async (config: ConfigService) => ({
        store: redisStore,
        host: config.get('REDIS_HOST') || 'localhost',
        port: config.get('REDIS_PORT') || 6379,
      }),
      inject: [ConfigService],
    }),

    // Configuração do ThrottlerModule com múltiplos perfis de limitação de requisições
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1000, limit: 3 },
      { name: 'medium', ttl: 10000, limit: 20 },
      { name: 'long', ttl: 60000, limit: 100 },
    ]),

    // Configuração do TypeORM para PostgreSQL
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        synchronize: true,
        ssl: { rejectUnauthorized: false },
        entities: [
          User,
          FriendRequest,
          Event,
          EventInvitation,
          Notification,
          ChatMessageEntity,
          DirectMessageEntity,
          EventVisit,
        ],
      }),
      inject: [ConfigService],
    }),

    // Registro de entidades para uso em repositórios específicos
    TypeOrmModule.forFeature([User, FriendRequest]),

    // Importação dos módulos principais da aplicação
    UsersModule,
    AuthModule,
    EventsModule,
    ChatModule,
    SearchModule,
    NotificationsModule,
    EventInvitationsModule,
    DirectChatModule,
    InsightsModule,
    RealtimeModule,
    MarketingModule,

    // Registro do módulo Prometheus
    PrometheusModule.register({
      path: '/metrics', // Endpoint onde as métricas serão expostas (ex.: http://localhost:3000/metrics)
      defaultLabels: {
        app: 'MeuApp', // Label padrão para todas as métricas
      },
      defaultMetrics: {
        enabled: true, // Habilita a coleta das métricas padrão (CPU, memória, etc.)
        // Removido o "config: { timeout: 5000 }" pois a propriedade timeout não existe.
      },
      // Caso deseje usar Pushgateway, descomente e configure:
      // pushgateway: { url: 'http://127.0.0.1:9091' },
    }),
  ],
  providers: [
    AppLogger,
    // Provider para métrica customizada (Counter)
    makeCounterProvider({
      name: 'custom_requests_total',
      help: 'Total de requisições customizadas',
    }),
    // Aplica o ThrottlerGuard globalmente com suporte a proxies
    { provide: APP_GUARD, useClass: ThrottlerBehindProxyGuard },
  ],
})
export class AppModule {}
