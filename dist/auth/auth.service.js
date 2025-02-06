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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const argon2 = require("argon2");
const cache_manager_1 = require("@nestjs/cache-manager");
let AuthService = AuthService_1 = class AuthService {
    constructor(usersService, jwtService, cacheManager) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.cacheManager = cacheManager;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async register(registerDto) {
        const user = await this.usersService.create(registerDto);
        return this.login(user);
    }
    async validateUser(email, pass) {
        this.logger.debug(`Validando usuário com email: ${email}`);
        const user = await this.usersService.findOneByEmail(email);
        if (!user) {
            this.logger.warn(`Usuário não encontrado: ${email}`);
            return null;
        }
        const passwordValid = await argon2.verify(user.password, pass);
        if (!passwordValid) {
            this.logger.warn(`Senha inválida para o usuário: ${email}`);
            return null;
        }
        this.logger.debug(`Usuário autenticado: ${email}`);
        return user;
    }
    async login(user) {
        const payload = { username: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload, { expiresIn: '1h' }),
            refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
        };
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const user = await this.usersService.findOneEntityById(payload.sub);
            if (!user) {
                throw new common_1.UnauthorizedException('Usuário não encontrado');
            }
            if (await this.isTokenRevoked(refreshToken)) {
                throw new common_1.UnauthorizedException('Token revogado.');
            }
            return this.login(user);
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Token de refresh inválido');
        }
    }
    async invalidateToken(token) {
        const decoded = this.jwtService.decode(token);
        const expiry = new Date(decoded.exp * 1000).getTime();
        const ttl = Math.floor((expiry - Date.now()) / 1000);
        if (ttl > 0) {
            await this.cacheManager.set(`revoked_tokens:${token}`, 'revoked', ttl);
        }
    }
    async isTokenRevoked(token) {
        try {
            const result = await this.cacheManager.get(`revoked_tokens:${token}`);
            return !!result;
        }
        catch (error) {
            console.error('Erro ao verificar token revogado:', error);
            return true;
        }
    }
    async validateOrRegisterGoogleUser(googleData) {
        let user = await this.usersService.findOneByEmail(googleData.email);
        if (!user) {
            const tempCpf = Math.random().toString().substring(2, 13).padEnd(11, '0');
            user = await this.usersService.create({
                email: googleData.email,
                password: await argon2.hash(Math.random().toString(36).slice(-8)),
                nickname: googleData.name,
                cpf: tempCpf,
                avatar: googleData.picture,
            });
        }
        return user;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService, Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map