"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DirectChatModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const direct_message_entity_1 = require("./direct-message.entity");
const direct_chat_service_1 = require("./direct-chat.service");
const direct_chat_gateway_1 = require("./direct-chat.gateway");
const direct_chat_controller_1 = require("./direct-chat.controller");
let DirectChatModule = class DirectChatModule {
};
exports.DirectChatModule = DirectChatModule;
exports.DirectChatModule = DirectChatModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([direct_message_entity_1.DirectMessageEntity])],
        providers: [direct_chat_service_1.DirectChatService, direct_chat_gateway_1.DirectChatGateway],
        controllers: [direct_chat_controller_1.DirectChatController],
        exports: [direct_chat_service_1.DirectChatService],
    })
], DirectChatModule);
//# sourceMappingURL=direct-chat.module.js.map