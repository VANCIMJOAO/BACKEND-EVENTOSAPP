import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'O nome completo do usuário',
    example: 'João da Silva',
  })
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @ApiProperty({
    description: 'O e-mail do usuário',
    example: 'joao.silva@example.com',
  })
  @IsEmail()
  readonly email: string;

  // Adicione outros campos conforme necessário...
}
