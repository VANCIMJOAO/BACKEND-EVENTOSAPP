"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const events_controller_1 = require("./events.controller");
const events_service_1 = require("./events.service");
const event_entity_1 = require("./event.entity");
const event_visit_entity_1 = require("./event-visit.entity");
const events_gateway_1 = require("./events.gateway");
const chat_module_1 = require("../chat/chat.module");
let EventsModule = class EventsModule {
};
exports.EventsModule = EventsModule;
exports.EventsModule = EventsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([event_entity_1.Event, event_visit_entity_1.EventVisit]),
            chat_module_1.ChatModule,
        ],
        controllers: [events_controller_1.EventsController],
        providers: [events_service_1.EventsService, events_gateway_1.EventsGateway],
        exports: [events_service_1.EventsService, typeorm_1.TypeOrmModule.forFeature([event_entity_1.Event, event_visit_entity_1.EventVisit]), events_gateway_1.EventsGateway],
    })
], EventsModule);
//# sourceMappingURL=events.module.js.map