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
exports.UserProfileDto = void 0;
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const event_dto_1 = require("../../events/dto/event.dto");
let UserProfileDto = class UserProfileDto {
};
exports.UserProfileDto = UserProfileDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID do usuário',
        example: 1,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Number)
], UserProfileDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email do usuário',
        example: 'joao.silva@example.com',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserProfileDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Nickname do usuário',
        example: 'joaosilva',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserProfileDto.prototype, "nickname", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'URL do avatar do usuário',
        example: 'https://exemplo.com/avatar.jpg',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserProfileDto.prototype, "avatar", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Descrição sobre o usuário',
        example: 'Sou um desenvolvedor apaixonado por tecnologia.',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserProfileDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Lista de interesses do usuário',
        example: ['música', 'esportes', 'cinema'],
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Array)
], UserProfileDto.prototype, "interests", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Indica se o perfil está completo',
        example: true,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], UserProfileDto.prototype, "isProfileComplete", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Papel (role) do usuário',
        example: 'USER',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserProfileDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Sexo do usuário',
        example: 'Masculino',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserProfileDto.prototype, "sex", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Data de nascimento do usuário',
        example: '1990-01-01',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserProfileDto.prototype, "birthDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Telefone do usuário',
        example: '+5511999999999',
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", String)
], UserProfileDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Lista de eventos favoritos do usuário',
        type: [event_dto_1.EventDto],
    }),
    (0, class_transformer_1.Expose)(),
    (0, class_transformer_1.Type)(() => event_dto_1.EventDto),
    __metadata("design:type", Array)
], UserProfileDto.prototype, "favoriteEvents", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Indica se o perfil é privado',
        example: false,
    }),
    (0, class_transformer_1.Expose)(),
    __metadata("design:type", Boolean)
], UserProfileDto.prototype, "isPrivate", void 0);
exports.UserProfileDto = UserProfileDto = __decorate([
    (0, class_transformer_1.Exclude)()
], UserProfileDto);
//# sourceMappingURL=user-profile.dto.js.map