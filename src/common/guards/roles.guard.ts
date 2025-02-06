// src/common/guards/roles.guard.ts

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/dto/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      console.log('Nenhuma role necessária para esta rota.');
      return true; // Permitir acesso se nenhuma role for necessária
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('Roles necessárias:', requiredRoles);
    console.log('Objeto do usuário no RolesGuard:', user);

    if (!user) {
      console.warn('Usuário não autenticado.');
      throw new UnauthorizedException('Usuário não autenticado');
    }

    if (!user.role) {
      console.warn('Usuário não possui uma role definida.');
      throw new UnauthorizedException('Usuário não possui uma role definida');
    }

    const hasRole = requiredRoles.includes(user.role as UserRole);
    console.log(`Usuário tem a role necessária? ${hasRole}`);

    if (!hasRole) {
      console.warn(`Usuário com role ${user.role} não possui permissão para acessar esta rota.`);
    }

    return hasRole;
  }
}
