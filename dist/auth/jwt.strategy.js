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
var JwtStrategy_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const users_service_1 = require("../users/users.service");
const config_1 = require("@nestjs/config");
const auth_service_1 = require("./auth.service");
const class_transformer_1 = require("class-transformer");
const user_profile_dto_1 = require("../users/dto/user-profile.dto");
let JwtStrategy = JwtStrategy_1 = class JwtStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy) {
    constructor(usersService, configService, authService) {
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_SECRET') || 'defaultSecret',
            passReqToCallback: true,
        });
        this.usersService = usersService;
        this.configService = configService;
        this.authService = authService;
        this.logger = new common_1.Logger(JwtStrategy_1.name);
    }
    async validate(req, payload) {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            throw new common_1.UnauthorizedException('Token não encontrado.');
        }
        const isRevoked = await this.authService.isTokenRevoked(token);
        if (isRevoked) {
            throw new common_1.UnauthorizedException('Token revogado.');
        }
        const user = await this.usersService.findOneEntityById(payload.sub);
        if (!user) {
            throw new common_1.UnauthorizedException('Usuário não encontrado.');
        }
        this.logger.debug(`Token validado para usuário: ${user.email}`);
        return (0, class_transformer_1.plainToInstance)(user_profile_dto_1.UserProfileDto, user, { excludeExtraneousValues: true });
    }
};
exports.JwtStrategy = JwtStrategy;
exports.JwtStrategy = JwtStrategy = JwtStrategy_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        config_1.ConfigService,
        auth_service_1.AuthService])
], JwtStrategy);
//# sourceMappingURL=jwt.strategy.js.map