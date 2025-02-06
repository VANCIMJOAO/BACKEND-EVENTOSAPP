import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { plainToInstance } from 'class-transformer';
import { UserProfileDto } from '../users/dto/user-profile.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'defaultSecret',
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any): Promise<UserProfileDto> {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token não encontrado.');
    }

    const isRevoked = await this.authService.isTokenRevoked(token);
    if (isRevoked) {
      throw new UnauthorizedException('Token revogado.');
    }

    const user = await this.usersService.findOneEntityById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado.');
    }

    this.logger.debug(`Token validado para usuário: ${user.email}`);
    return plainToInstance(UserProfileDto, user, { excludeExtraneousValues: true });
  }
}
