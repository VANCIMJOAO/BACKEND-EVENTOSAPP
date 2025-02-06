import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserProfileDto } from './dto/user-profile.dto';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findOneById: jest.fn(),
            update: jest.fn(),
            toggleFavoriteEvent: jest.fn(),
            getFavorites: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  const mockUserProfile = new UserProfileDto();
  Object.assign(mockUserProfile, {
    id: 1,
    nickname: 'testuser',
    avatar: 'avatar.png',
    description: 'Descrição do usuário',
    isProfileComplete: true,
    role: 'USER',
    isPrivate: false,
    email: '',
    favoriteEvents: []
  });

  it('deve ser definido', () => {
    expect(usersController).toBeDefined();
  });

  it('deve retornar o perfil do usuário autenticado', async () => {
    jest.spyOn(usersService, 'findOneById').mockResolvedValue({
      id: 1,
      nickname: 'testuser',
      avatar: 'avatar.png',
      description: 'Descrição do usuário',
      isProfileComplete: true,
      role: 'USER',
      isPrivate: false,
      email: '',
      favoriteEvents: [],
    });
    

    const req = { user: { id: 1 }, headers: { authorization: 'Bearer token' } };
    const result = await usersController.getProfile(req);

    expect(result).toMatchObject(mockUserProfile);
  });

  it('deve lançar UnauthorizedException se não houver usuário autenticado', async () => {
    const req = { user: null, headers: {} };
    await expect(usersController.getProfile(req)).rejects.toThrow(UnauthorizedException);
  });

  it('deve atualizar o perfil do usuário autenticado', async () => {
    jest.spyOn(usersService, 'update').mockResolvedValue(mockUserProfile);

    const req = { user: { id: 1 }, headers: { authorization: 'Bearer token' } };
    const result = await usersController.updateProfile(req, {});

    expect(result).toMatchObject(mockUserProfile);
  });

  it('deve lançar BadRequestException se o ID for inválido', async () => {
    await expect(usersController.getUserById('abc', { user: { id: 1 } }))
      .rejects.toThrow(BadRequestException);
  });

  it('deve retornar um usuário pelo ID', async () => {
    jest.spyOn(usersService, 'findOneById').mockResolvedValue(mockUserProfile);

    const result = await usersController.getUserById('1', { user: { id: 1 } });

    expect(result).toMatchObject(mockUserProfile);
  });
});
