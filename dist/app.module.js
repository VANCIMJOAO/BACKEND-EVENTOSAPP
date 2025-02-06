"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = exports.ThrottlerBehindProxyGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const cache_manager_1 = require("@nestjs/cache-manager");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const config_1 = require("@nestjs/config");
const redisStore = require("cache-manager-redis-store");
const nestjs_prometheus_1 = require("@willsoto/nestjs-prometheus");
const users_module_1 = require("./users/users.module");
const auth_module_1 = require("./auth/auth.module");
const events_module_1 = require("./events/events.module");
const chat_module_1 = require("./chat/chat.module");
const search_module_1 = require("./search/search.module");
const notifications_module_1 = require("./notifications/notifications.module");
const event_invitations_module_1 = require("./event-invitations/event-invitations.module");
const direct_chat_module_1 = require("./direct-chat/direct-chat.module");
const insights_module_1 = require("./insights/insights.module");
const realtime_module_1 = require("./realtime/realtime.module");
const marketing_module_1 = require("./marketing/marketing.module");
const logger_service_1 = require("./logger/logger.service");
const user_entity_1 = require("./users/user.entity");
const friend_request_entity_1 = require("./users/friend-requests/friend-request.entity");
const event_entity_1 = require("./events/event.entity");
const event_invitation_entity_1 = require("./event-invitations/event-invitation.entity");
const notification_entity_1 = require("./notifications/notification.entity");
const chat_message_entity_1 = require("./chat/chat-message.entity");
const direct_message_entity_1 = require("./direct-chat/direct-message.entity");
const event_visit_entity_1 = require("./events/event-visit.entity");
const common_2 = require("@nestjs/common");
const throttler_2 = require("@nestjs/throttler");
let ThrottlerBehindProxyGuard = class ThrottlerBehindProxyGuard extends throttler_2.ThrottlerGuard {
    getTracker(req) {
        return new Promise((resolve) => {
            const tracker = req.ips && req.ips.length > 0 ? req.ips[0] : req.ip;
            resolve(tracker);
        });
    }
};
exports.ThrottlerBehindProxyGuard = ThrottlerBehindProxyGuard;
exports.ThrottlerBehindProxyGuard = ThrottlerBehindProxyGuard = __decorate([
    (0, common_2.Injectable)()
], ThrottlerBehindProxyGuard);
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            cache_manager_1.CacheModule.registerAsync({
                isGlobal: true,
                useFactory: async (config) => ({
                    store: redisStore,
                    host: config.get('REDIS_HOST') || 'localhost',
                    port: config.get('REDIS_PORT') || 6379,
                }),
                inject: [config_1.ConfigService],
            }),
            throttler_1.ThrottlerModule.forRoot([
                { name: 'short', ttl: 1000, limit: 3 },
                { name: 'medium', ttl: 10000, limit: 20 },
                { name: 'long', ttl: 60000, limit: 100 },
            ]),
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: (config) => ({
                    type: 'postgres',
                    url: config.get('DATABASE_URL'),
                    synchronize: true,
                    ssl: { rejectUnauthorized: false },
                    entities: [
                        user_entity_1.User,
                        friend_request_entity_1.FriendRequest,
                        event_entity_1.Event,
                        event_invitation_entity_1.EventInvitation,
                        notification_entity_1.Notification,
                        chat_message_entity_1.ChatMessageEntity,
                        direct_message_entity_1.DirectMessageEntity,
                        event_visit_entity_1.EventVisit,
                    ],
                }),
                inject: [config_1.ConfigService],
            }),
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, friend_request_entity_1.FriendRequest]),
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            events_module_1.EventsModule,
            chat_module_1.ChatModule,
            search_module_1.SearchModule,
            notifications_module_1.NotificationsModule,
            event_invitations_module_1.EventInvitationsModule,
            direct_chat_module_1.DirectChatModule,
            insights_module_1.InsightsModule,
            realtime_module_1.RealtimeModule,
            marketing_module_1.MarketingModule,
            nestjs_prometheus_1.PrometheusModule.register({
                path: '/metrics',
                defaultLabels: {
                    app: 'MeuApp',
                },
                defaultMetrics: {
                    enabled: true,
                },
            }),
        ],
        providers: [
            logger_service_1.AppLogger,
            (0, nestjs_prometheus_1.makeCounterProvider)({
                name: 'custom_requests_total',
                help: 'Total de requisições customizadas',
            }),
            { provide: core_1.APP_GUARD, useClass: ThrottlerBehindProxyGuard },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map