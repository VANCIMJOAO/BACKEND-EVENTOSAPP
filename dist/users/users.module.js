"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const users_service_1 = require("./users.service");
const users_controller_1 = require("./users.controller");
const user_entity_1 = require("./user.entity");
const events_module_1 = require("../events/events.module");
const auth_module_1 = require("../auth/auth.module");
const roles_guard_1 = require("../common/guards/roles.guard");
const core_1 = require("@nestjs/core");
const friend_requests_module_1 = require("./friend-requests/friend-requests.module");
const notifications_module_1 = require("../notifications/notifications.module");
let UsersModule = class UsersModule {
    constructor() {
        console.log('UsersModule inicializado');
    }
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User]),
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
            events_module_1.EventsModule,
            friend_requests_module_1.FriendRequestsModule,
            notifications_module_1.NotificationsModule,
        ],
        providers: [
            users_service_1.UsersService,
            roles_guard_1.RolesGuard,
            core_1.Reflector,
        ],
        controllers: [users_controller_1.UsersController],
        exports: [
            users_service_1.UsersService,
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User]),
        ],
    }),
    __metadata("design:paramtypes", [])
], UsersModule);
//# sourceMappingURL=users.module.js.map