// src/auth/auth.controller.ts
import { Controller, Post, Body, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OAuth2Client } from 'google-auth-library';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private googleClient: OAuth2Client;

  constructor(private readonly authService: AuthService) {
    // Use o mesmo client ID que você configurou no seu app (ou o client ID apropriado para seu servidor)
    this.googleClient = new OAuth2Client('260966378436-q1cp9hvmd78840jqtbisvk0o5ti0aaub.apps.googleusercontent.com');
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      this.logger.debug(`Registrando usuário com email: ${registerDto.email}`);
      const tokens = await this.authService.register(registerDto);
      return tokens; // Retorna { access_token, refresh_token }
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('E-mail ou CPF já cadastrado');
      }
      throw new UnauthorizedException('Erro ao registrar usuário');
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    this.logger.debug(`Login para usuário: ${loginDto.email}`);
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const tokens = await this.authService.login(user);
    return tokens;
  }

  @Post('refresh')
  async refresh(@Body('refresh_token') refreshToken: string) {
    this.logger.debug('Atualizando token de refresh');
    return this.authService.refreshToken(refreshToken);
  }
  
  @Post('google')
  async googleLogin(@Body('idToken') idToken: string) {
    try {
      this.logger.debug(`Recebido idToken: ${idToken}`);
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: '260966378436-q1cp9hvmd78840jqtbisvk0o5ti0aaub.apps.googleusercontent.com',
      });
      const payload = ticket.getPayload();
      if (!payload) {
        this.logger.error('Payload do token não encontrado');
        throw new UnauthorizedException('Token do Google inválido');
      }

      const { email, name, picture } = payload;
      this.logger.debug(`Payload recebido: email=${email}, name=${name}`);

      const user = await this.authService.validateOrRegisterGoogleUser({ email, name, picture });
      const tokens = await this.authService.login(user);
      return tokens;
    } catch (error) {
      this.logger.error('Erro ao autenticar com o Google', error);
      throw new UnauthorizedException('Erro na autenticação com o Google');
    }
  }
  
}
