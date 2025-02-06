import { Injectable, UnauthorizedException, Inject, Logger } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { RegisterDto } from './dto/register.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { UserProfileDto } from '../users/dto/user-profile.dto';
import { plainToInstance } from 'class-transformer';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async register(registerDto: RegisterDto) {
    // Delegar o hash da senha ao UsersService
    const user = await this.usersService.create(registerDto);
    return this.login(user);
  }

  async validateUser(email: string, pass: string): Promise<User | null> {
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

  
  async login(user: User) { // Agora aceita User
    const payload = { username: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload, { expiresIn: '1h' }),
      refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findOneEntityById(payload.sub); // Obtém User completo

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      if (await this.isTokenRevoked(refreshToken)) {
        throw new UnauthorizedException('Token revogado.');
      }

      return this.login(user);
    } catch (error) {
      throw new UnauthorizedException('Token de refresh inválido');
    }
  }

  async invalidateToken(token: string): Promise<void> {
    const decoded = this.jwtService.decode(token) as any;
    const expiry = new Date(decoded.exp * 1000).getTime();
    const ttl = Math.floor((expiry - Date.now()) / 1000); // TTL em segundos
  
    if (ttl > 0) {
      await this.cacheManager.set(`revoked_tokens:${token}`, 'revoked', ttl); // Passa o TTL como número
    }
  }

  async isTokenRevoked(token: string): Promise<boolean> {
    try {
      const result = await this.cacheManager.get(`revoked_tokens:${token}`);
      return !!result; // Retorna verdadeiro se o token estiver revogado
    } catch (error) {
      console.error('Erro ao verificar token revogado:', error);
      return true; // Por segurança, considere o token revogado em caso de erro
    }
  }
// src/auth/auth.service.ts (validateOrRegisterGoogleUser atualizado)
async validateOrRegisterGoogleUser(googleData: { email: string; name: string; picture?: string }): Promise<User> {
  let user = await this.usersService.findOneByEmail(googleData.email);
  
  if (!user) {
    const tempCpf = Math.random().toString().substring(2, 13).padEnd(11, '0');
    
    user = await this.usersService.create({
      email: googleData.email,
      password: await argon2.hash(Math.random().toString(36).slice(-8)),
      nickname: googleData.name,
      cpf: tempCpf,
      avatar: googleData.picture,
      // Remova a linha abaixo
      // isProfileComplete: false
    });
  }
  return user;
}
  
  
}
