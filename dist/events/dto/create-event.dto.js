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
exports.CreateEventDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class CreateEventDto {
}
exports.CreateEventDto = CreateEventDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'O título do evento é obrigatório.' }),
    __metadata("design:type", String)
], CreateEventDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'A descrição do evento é obrigatória.' }),
    __metadata("design:type", String)
], CreateEventDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "coverImage", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)({ message: 'Selecione pelo menos uma categoria.' }),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateEventDto.prototype, "categories", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateEventDto.prototype, "latitude", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateEventDto.prototype, "longitude", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'O nome do local é obrigatório.' }),
    __metadata("design:type", String)
], CreateEventDto.prototype, "placeName", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'A data do evento deve ser uma data válida.' }),
    __metadata("design:type", String)
], CreateEventDto.prototype, "eventDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'A hora inicial deve ser uma hora válida.' }),
    __metadata("design:type", String)
], CreateEventDto.prototype, "startTime", void 0);
__decorate([
    (0, class_validator_1.IsDateString)({}, { message: 'A hora final deve ser uma hora válida.' }),
    __metadata("design:type", String)
], CreateEventDto.prototype, "endTime", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'O endereço do evento é obrigatório.' }),
    __metadata("design:type", String)
], CreateEventDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], CreateEventDto.prototype, "isFree", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => !o.isFree),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Defina um preço válido para o ingresso.' }),
    __metadata("design:type", String)
], CreateEventDto.prototype, "ticketPrice", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "registrationStatus", void 0);
//# sourceMappingURL=create-event.dto.js.map