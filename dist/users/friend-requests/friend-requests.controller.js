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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendRequestsController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const friend_requests_service_1 = require("./friend-requests.service");
let FriendRequestsController = class FriendRequestsController {
    constructor(frService) {
        this.frService = frService;
    }
    createRequest(req, receiverId) {
        return this.frService.createRequest(req.user.id, Number(receiverId));
    }
    async getReceived(req) {
        console.log('🔹 Buscando solicitações de amizade para:', req.user.id);
        const requests = await this.frService.getReceivedRequests(req.user.id);
        return requests.map((request) => ({
            id: request.id,
            type: 'FRIEND_REQUEST',
            message: `${request.sender.nickname} enviou uma solicitação de amizade.`,
            data: { friendRequestId: request.id },
            createdAt: request.createdAt,
            status: request.status,
            sender: {
                id: request.sender.id,
                nickname: request.sender.nickname,
                avatar: request.sender.avatar,
            },
        }));
    }
    acceptRequest(req, requestId) {
        return this.frService.acceptRequest(Number(requestId), req.user.id);
    }
    rejectRequest(req, requestId) {
        return this.frService.rejectRequest(Number(requestId), req.user.id);
    }
};
exports.FriendRequestsController = FriendRequestsController;
__decorate([
    (0, common_1.Post)(':receiverId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('receiverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FriendRequestsController.prototype, "createRequest", null);
__decorate([
    (0, common_1.Get)('received'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FriendRequestsController.prototype, "getReceived", null);
__decorate([
    (0, common_1.Patch)(':requestId/accept'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('requestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FriendRequestsController.prototype, "acceptRequest", null);
__decorate([
    (0, common_1.Patch)(':requestId/reject'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('requestId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FriendRequestsController.prototype, "rejectRequest", null);
exports.FriendRequestsController = FriendRequestsController = __decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Controller)('friend-requests'),
    __metadata("design:paramtypes", [friend_requests_service_1.FriendRequestsService])
], FriendRequestsController);
//# sourceMappingURL=friend-requests.controller.js.map