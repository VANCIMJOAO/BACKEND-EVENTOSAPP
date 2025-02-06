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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const event_entity_1 = require("../events/event.entity");
const user_role_enum_1 = require("./dto/user-role.enum");
const friend_request_entity_1 = require("./friend-requests/friend-request.entity");
const notification_entity_1 = require("../notifications/notification.entity");
const event_invitation_entity_1 = require("../event-invitations/event-invitation.entity");
const direct_message_entity_1 = require("../direct-chat/direct-message.entity");
const event_visit_entity_1 = require("../events/event-visit.entity");
let User = class User {
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "nickname", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "cpf", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "avatar", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], User.prototype, "interests", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isProfileComplete", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: user_role_enum_1.UserRole,
        default: user_role_enum_1.UserRole.USER,
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "sex", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "birthDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "isPrivate", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => event_entity_1.Event, { cascade: true }),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], User.prototype, "favoriteEvents", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => event_entity_1.Event, (event) => event.creatorUser),
    __metadata("design:type", Array)
], User.prototype, "events", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => User, (user) => user.friends, { cascade: ['insert', 'update'] }),
    (0, typeorm_1.JoinTable)({
        name: 'user_friends',
        joinColumn: {
            name: 'user_id',
            referencedColumnName: 'id',
        },
        inverseJoinColumn: {
            name: 'friend_id',
            referencedColumnName: 'id',
        },
    }),
    __metadata("design:type", Array)
], User.prototype, "friends", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => friend_request_entity_1.FriendRequest, (fr) => fr.sender),
    __metadata("design:type", Array)
], User.prototype, "sentFriendRequests", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => friend_request_entity_1.FriendRequest, (fr) => fr.receiver),
    __metadata("design:type", Array)
], User.prototype, "receivedFriendRequests", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => event_invitation_entity_1.EventInvitation, (inv) => inv.sender),
    __metadata("design:type", Array)
], User.prototype, "sentEventInvitations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => event_invitation_entity_1.EventInvitation, (inv) => inv.receiver),
    __metadata("design:type", Array)
], User.prototype, "receivedEventInvitations", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_entity_1.Notification, (notification) => notification.receiver),
    __metadata("design:type", Array)
], User.prototype, "receivedNotifications", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => event_entity_1.Event, (event) => event.attendees),
    __metadata("design:type", Array)
], User.prototype, "attendingEvents", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => direct_message_entity_1.DirectMessageEntity, (message) => message.sender),
    __metadata("design:type", Array)
], User.prototype, "sentMessages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => direct_message_entity_1.DirectMessageEntity, (message) => message.receiver),
    __metadata("design:type", Array)
], User.prototype, "receivedMessages", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => event_visit_entity_1.EventVisit, (eventVisit) => eventVisit.user),
    __metadata("design:type", Array)
], User.prototype, "eventVisits", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "expoPushToken", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)()
], User);
//# sourceMappingURL=user.entity.js.map