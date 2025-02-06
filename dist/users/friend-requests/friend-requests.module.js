"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRequestsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const friend_request_entity_1 = require("./friend-request.entity");
const friend_requests_service_1 = require("./friend-requests.service");
const friend_requests_controller_1 = require("./friend-requests.controller");
const users_module_1 = require("../users.module");
const notifications_module_1 = require("../../notifications/notifications.module");
const realtime_module_1 = require("../../realtime/realtime.module");
let FriendRequestsModule = class FriendRequestsModule {
};
exports.FriendRequestsModule = FriendRequestsModule;
exports.FriendRequestsModule = FriendRequestsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([friend_request_entity_1.FriendRequest]),
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
            notifications_module_1.NotificationsModule,
            realtime_module_1.RealtimeModule,
        ],
        providers: [friend_requests_service_1.FriendRequestsService],
        controllers: [friend_requests_controller_1.FriendRequestsController],
        exports: [friend_requests_service_1.FriendRequestsService],
    })
], FriendRequestsModule);
//# sourceMappingURL=friend-requests.module.js.map