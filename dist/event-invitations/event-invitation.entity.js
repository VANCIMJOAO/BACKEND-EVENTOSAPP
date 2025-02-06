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
exports.EventInvitation = exports.InvitationStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const event_entity_1 = require("../events/event.entity");
var InvitationStatus;
(function (InvitationStatus) {
    InvitationStatus["PENDING"] = "PENDING";
    InvitationStatus["ACCEPTED"] = "ACCEPTED";
    InvitationStatus["REJECTED"] = "REJECTED";
})(InvitationStatus || (exports.InvitationStatus = InvitationStatus = {}));
let EventInvitation = class EventInvitation {
};
exports.EventInvitation = EventInvitation;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EventInvitation.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.sentEventInvitations, { eager: true }),
    __metadata("design:type", user_entity_1.User)
], EventInvitation.prototype, "sender", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.receivedEventInvitations, { eager: true }),
    __metadata("design:type", user_entity_1.User)
], EventInvitation.prototype, "receiver", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => event_entity_1.Event, (event) => event.invitations, { eager: true }),
    __metadata("design:type", event_entity_1.Event)
], EventInvitation.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: InvitationStatus,
        default: InvitationStatus.PENDING,
    }),
    __metadata("design:type", String)
], EventInvitation.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], EventInvitation.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], EventInvitation.prototype, "updatedAt", void 0);
exports.EventInvitation = EventInvitation = __decorate([
    (0, typeorm_1.Entity)('event_invitations')
], EventInvitation);
//# sourceMappingURL=event-invitation.entity.js.map