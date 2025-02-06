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
exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const roles_decorator_1 = require("../decorators/roles.decorator");
let RolesGuard = class RolesGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            console.log('Nenhuma role necessária para esta rota.');
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        console.log('Roles necessárias:', requiredRoles);
        console.log('Objeto do usuário no RolesGuard:', user);
        if (!user) {
            console.warn('Usuário não autenticado.');
            throw new common_1.UnauthorizedException('Usuário não autenticado');
        }
        if (!user.role) {
            console.warn('Usuário não possui uma role definida.');
            throw new common_1.UnauthorizedException('Usuário não possui uma role definida');
        }
        const hasRole = requiredRoles.includes(user.role);
        console.log(`Usuário tem a role necessária? ${hasRole}`);
        if (!hasRole) {
            console.warn(`Usuário com role ${user.role} não possui permissão para acessar esta rota.`);
        }
        return hasRole;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
//# sourceMappingURL=roles.guard.js.map