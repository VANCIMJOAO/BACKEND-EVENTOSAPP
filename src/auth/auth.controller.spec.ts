import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/dto/user-role.enum';
import { UnauthorizedException, ConflictException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            validateUser: jest.fn(),
            login: jest.fn(),
            refreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('deve ser definido', () => {
    expect(authController).toBeDefined();
  });

  it('deve registrar um usuário com sucesso', async () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'Test@123',
      nickname: 'testuser',
      cpf: '12345678901',
    };

    jest.spyOn(authService, 'register').mockResolvedValue({
      access_token: 'mockedAccessToken',
      refresh_token: 'mockedRefreshToken',
    });

    const result = await authController.register(registerDto);

    expect(result).toEqual({
      access_token: 'mockedAccessToken',
      refresh_token: 'mockedRefreshToken',
    });
  });

  it('deve rejeitar registro com e-mail já cadastrado', async () => {
    const registerDto: RegisterDto = {
      email: 'test@example.com',
      password: 'Test@123',
      nickname: 'testuser',
      cpf: '12345678901',
    };

    jest.spyOn(authService, 'register').mockRejectedValue({ code: '23505' });

    await expect(authController.register(registerDto)).rejects.toThrow(
      ConflictException,
    );
  });

  it('deve autenticar um usuário com credenciais válidas', async () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: '123456',
    };

    jest.spyOn(authService, 'validateUser').mockResolvedValue({
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
    });
    
    

    jest.spyOn(authService, 'login').mockResolvedValue({
      access_token: 'mockedAccessToken',
      refresh_token: 'mockedRefreshToken',
    });

    const result = await authController.login(loginDto);

    expect(result).toEqual({
      access_token: 'mockedAccessToken',
      refresh_token: 'mockedRefreshToken',
    });
  });

  it('deve rejeitar autenticação com credenciais inválidas', async () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'wrongPassword',
    };

    jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

    await expect(authController.login(loginDto)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('deve renovar um token de refresh', async () => {
    jest.spyOn(authService, 'refreshToken').mockResolvedValue({
      access_token: 'newMockedAccessToken',
      refresh_token: 'newMockedRefreshToken',
    });

    const result = await authController.refresh('mockedRefreshToken');

    expect(result).toEqual({
      access_token: 'newMockedAccessToken',
      refresh_token: 'newMockedRefreshToken',
    });
  });
});
