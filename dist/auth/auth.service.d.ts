import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { Cache } from 'cache-manager';
import { User } from '../users/user.entity';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    private readonly cacheManager;
    private readonly logger;
    constructor(usersService: UsersService, jwtService: JwtService, cacheManager: Cache);
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    validateUser(email: string, pass: string): Promise<User | null>;
    login(user: User): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    refreshToken(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
    }>;
    invalidateToken(token: string): Promise<void>;
    isTokenRevoked(token: string): Promise<boolean>;
    validateOrRegisterGoogleUser(googleData: {
        email: string;
        name: string;
        picture?: string;
    }): Promise<User>;
}
