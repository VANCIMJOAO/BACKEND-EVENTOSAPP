import { Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { Request } from 'express';
import { UserProfileDto } from '../users/dto/user-profile.dto';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private usersService;
    private configService;
    private authService;
    private readonly logger;
    constructor(usersService: UsersService, configService: ConfigService, authService: AuthService);
    validate(req: Request, payload: any): Promise<UserProfileDto>;
}
export {};
