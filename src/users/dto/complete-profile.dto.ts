import { IsOptional, IsString, IsArray, IsBoolean, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteProfileDto {
  @ApiPropertyOptional({
    description: 'URL do avatar do usuário',
    example: 'https://exemplo.com/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({
    description: 'Descrição sobre o usuário',
    example: 'Sou um desenvolvedor apaixonado por tecnologia.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Lista de interesses do usuário',
    example: ['música', 'esportes', 'cinema'],
  })
  @IsOptional()
  @IsArray()
  interests?: string[];

  @ApiPropertyOptional({
    description: 'Sexo do usuário',
    example: 'Masculino',
  })
  @IsOptional()
  @IsString()
  sex?: string;

  @ApiPropertyOptional({
    description: 'Data de nascimento do usuário',
    example: '1990-01-01',
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiPropertyOptional({
    description: 'Telefone do usuário',
    example: '+5511999999999',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Indica se o perfil está completo',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isProfileComplete?: boolean;
}
