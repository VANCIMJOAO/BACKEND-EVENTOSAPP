"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketingModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const marketing_service_1 = require("./marketing.service");
const marketing_controller_1 = require("./marketing.controller");
const event_entity_1 = require("../events/event.entity");
const user_entity_1 = require("../users/user.entity");
const event_visit_entity_1 = require("../events/event-visit.entity");
const events_module_1 = require("../events/events.module");
const users_module_1 = require("../users/users.module");
let MarketingModule = class MarketingModule {
};
exports.MarketingModule = MarketingModule;
exports.MarketingModule = MarketingModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([event_entity_1.Event, user_entity_1.User, event_visit_entity_1.EventVisit]),
            events_module_1.EventsModule,
            users_module_1.UsersModule,
        ],
        controllers: [marketing_controller_1.MarketingController],
        providers: [
            marketing_service_1.MarketingService,
        ],
    })
], MarketingModule);
//# sourceMappingURL=marketing.module.js.map