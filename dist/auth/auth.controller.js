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
var AuthController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
const google_auth_library_1 = require("google-auth-library");
let AuthController = AuthController_1 = class AuthController {
    constructor(authService) {
        this.authService = authService;
        this.logger = new common_1.Logger(AuthController_1.name);
        this.googleClient = new google_auth_library_1.OAuth2Client('260966378436-q1cp9hvmd78840jqtbisvk0o5ti0aaub.apps.googleusercontent.com');
    }
    async register(registerDto) {
        try {
            this.logger.debug(`Registrando usuário com email: ${registerDto.email}`);
            const tokens = await this.authService.register(registerDto);
            return tokens;
        }
        catch (error) {
            if (error.code === '23505') {
                throw new common_1.ConflictException('E-mail ou CPF já cadastrado');
            }
            throw new common_1.UnauthorizedException('Erro ao registrar usuário');
        }
    }
    async login(loginDto) {
        this.logger.debug(`Login para usuário: ${loginDto.email}`);
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Credenciais inválidas');
        }
        const tokens = await this.authService.login(user);
        return tokens;
    }
    async refresh(refreshToken) {
        this.logger.debug('Atualizando token de refresh');
        return this.authService.refreshToken(refreshToken);
    }
    async googleLogin(idToken) {
        try {
            this.logger.debug(`Recebido idToken: ${idToken}`);
            const ticket = await this.googleClient.verifyIdToken({
                idToken,
                audience: '260966378436-q1cp9hvmd78840jqtbisvk0o5ti0aaub.apps.googleusercontent.com',
            });
            const payload = ticket.getPayload();
            if (!payload) {
                this.logger.error('Payload do token não encontrado');
                throw new common_1.UnauthorizedException('Token do Google inválido');
            }
            const { email, name, picture } = payload;
            this.logger.debug(`Payload recebido: email=${email}, name=${name}`);
            const user = await this.authService.validateOrRegisterGoogleUser({ email, name, picture });
            const tokens = await this.authService.login(user);
            return tokens;
        }
        catch (error) {
            this.logger.error('Erro ao autenticar com o Google', error);
            throw new common_1.UnauthorizedException('Erro na autenticação com o Google');
        }
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Body)('refresh_token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('google'),
    __param(0, (0, common_1.Body)('idToken')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleLogin", null);
exports.AuthController = AuthController = AuthController_1 = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map