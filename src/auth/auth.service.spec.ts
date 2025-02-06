import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RegisterDto } from './dto/register.dto';
import { UserRole } from '../users/dto/user-role.enum';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let cacheManager: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findOneByEmail: jest.fn(),
            findOneEntityById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mockedAccessToken'),
            verify: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
  });

  it('deve ser definido', () => {
    expect(authService).toBeDefined();
  });

  it('deve registrar um usuário', async () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'Test@123',
      nickname: 'testuser',
      cpf: '12345678901',
    };

    const mockUser = {
      id: 1,
  email: 'test@example.com',
  password: 'hashedPassword',
  nickname: 'testuser',
  cpf: '12345678901',
  role: UserRole.USER,
  isProfileComplete: true,
  isPrivate: false,
  favoriteEvents: [],
  events: [],
  friends: [],
  sentFriendRequests: [],
  receivedFriendRequests: [],
  receivedNotifications: [],
  sentEventInvitations: [],
  receivedEventInvitations: [],
  attendingEvents: [],
  sentMessages: [], // ✅ Adicionado
  receivedMessages: [], // ✅ Adicionado
  eventVisits: [], // ✅ Adicionado
  createdAt: new Date(),
  updatedAt: new Date(),
    };

    jest.spyOn(usersService, 'create').mockResolvedValue(mockUser);

    const result = await authService.register(registerDto);

    expect(result).toHaveProperty('access_token');
    expect(result).toHaveProperty('refresh_token');
  });

  it('deve validar um usuário com credenciais corretas', async () => {
    const mockUser = {
      id: 1,
  email: 'test@example.com',
  password: 'hashedPassword',
  nickname: 'testuser',
  cpf: '12345678901',
  role: UserRole.USER,
  isProfileComplete: true,
  isPrivate: false,
  favoriteEvents: [],
  events: [],
  friends: [],
  sentFriendRequests: [],
  receivedFriendRequests: [],
  receivedNotifications: [],
  sentEventInvitations: [],
  receivedEventInvitations: [],
  attendingEvents: [],
  sentMessages: [], // ✅ Adicionado
  receivedMessages: [], // ✅ Adicionado
  eventVisits: [], // ✅ Adicionado
  createdAt: new Date(),
  updatedAt: new Date(),
    };

    jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(mockUser);
    jest.spyOn(argon2, 'verify').mockResolvedValue(true);

    const result = await authService.validateUser('test@example.com', 'Test@123');

    expect(result).toEqual(mockUser);
  });

  it('deve rejeitar usuário com credenciais erradas', async () => {
    jest.spyOn(usersService, 'findOneByEmail').mockResolvedValue(null);

    const result = await authService.validateUser('test@example.com', 'Test@123');

    expect(result).toBeNull();
  });

  it('deve revogar um token', async () => {
    const token = 'mockedToken';
    jwtService.decode = jest
      .fn()
      .mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });

    await authService.invalidateToken(token);

    expect(cacheManager.set).toHaveBeenCalledWith(
      `revoked_tokens:${token}`,
      'revoked',
      expect.any(Number),
    );
  });

  it('deve verificar se um token foi revogado', async () => {
    const token = 'mockedToken';
    jest.spyOn(cacheManager, 'get').mockResolvedValue('revoked');

    const isRevoked = await authService.isTokenRevoked(token);

    expect(isRevoked).toBe(true);
  });

  it('deve permitir um token válido', async () => {
    const token = 'validToken';
    jest.spyOn(cacheManager, 'get').mockResolvedValue(null);

    const isRevoked = await authService.isTokenRevoked(token);

    expect(isRevoked).toBe(false);
  });

  it('deve renovar um token de refresh', async () => {
    const refreshToken = 'mockedRefreshToken';
    const mockUser = {
      id: 1,
  email: 'test@example.com',
  password: 'hashedPassword',
  nickname: 'testuser',
  cpf: '12345678901',
  role: UserRole.USER,
  isProfileComplete: true,
  isPrivate: false,
  favoriteEvents: [],
  events: [],
  friends: [],
  sentFriendRequests: [],
  receivedFriendRequests: [],
  receivedNotifications: [],
  sentEventInvitations: [],
  receivedEventInvitations: [],
  attendingEvents: [],
  sentMessages: [], // ✅ Adicionado
  receivedMessages: [], // ✅ Adicionado
  eventVisits: [], // ✅ Adicionado
  createdAt: new Date(),
  updatedAt: new Date(),
    };
    

    jest.spyOn(jwtService, 'verify').mockReturnValue({ sub: 1 });
    jest.spyOn(usersService, 'findOneEntityById').mockResolvedValue(mockUser);
    jest.spyOn(authService, 'isTokenRevoked').mockResolvedValue(false);
    jest.spyOn(authService, 'login').mockResolvedValue({
      access_token: 'newMockedAccessToken',
      refresh_token: 'newMockedRefreshToken',
    });

    const result = await authService.refreshToken(refreshToken);

    expect(result).toEqual({
      access_token: 'newMockedAccessToken',
      refresh_token: 'newMockedRefreshToken',
    });
  });
});
