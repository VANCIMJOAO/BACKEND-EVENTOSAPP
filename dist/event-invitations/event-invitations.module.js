"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventInvitationsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const event_invitations_controller_1 = require("./event-invitations.controller");
const event_invitations_service_1 = require("./event-invitations.service");
const event_invitation_entity_1 = require("./event-invitation.entity");
const event_entity_1 = require("../events/event.entity");
const user_entity_1 = require("../users/user.entity");
const notifications_module_1 = require("../notifications/notifications.module");
let EventInvitationsModule = class EventInvitationsModule {
};
exports.EventInvitationsModule = EventInvitationsModule;
exports.EventInvitationsModule = EventInvitationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([event_invitation_entity_1.EventInvitation, event_entity_1.Event, user_entity_1.User]),
            notifications_module_1.NotificationsModule,
        ],
        controllers: [event_invitations_controller_1.EventInvitationsController],
        providers: [event_invitations_service_1.EventInvitationsService],
        exports: [event_invitations_service_1.EventInvitationsService],
    })
], EventInvitationsModule);
//# sourceMappingURL=event-invitations.module.js.map