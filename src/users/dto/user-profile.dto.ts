import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventDto } from '../../events/dto/event.dto';

@Exclude()
export class UserProfileDto {
  @ApiProperty({
    description: 'ID do usuário',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao.silva@example.com',
  })
  @Expose()
  email: string;

  @ApiProperty({
    description: 'Nickname do usuário',
    example: 'joaosilva',
  })
  @Expose()
  nickname: string;

  @ApiPropertyOptional({
    description: 'URL do avatar do usuário',
    example: 'https://exemplo.com/avatar.jpg',
  })
  @Expose()
  avatar?: string;



  @ApiPropertyOptional({
    description: 'Descrição sobre o usuário',
    example: 'Sou um desenvolvedor apaixonado por tecnologia.',
  })
  @Expose()
  description?: string;

  @ApiPropertyOptional({
    description: 'Lista de interesses do usuário',
    example: ['música', 'esportes', 'cinema'],
  })
  @Expose()
  interests?: string[];

  @ApiProperty({
    description: 'Indica se o perfil está completo',
    example: true,
  })
  @Expose()
  isProfileComplete: boolean;

  @ApiProperty({
    description: 'Papel (role) do usuário',
    example: 'USER',
  })
  @Expose()
  role: string;

  @ApiPropertyOptional({
    description: 'Sexo do usuário',
    example: 'Masculino',
  })
  @Expose()
  sex?: string;

  @ApiPropertyOptional({
    description: 'Data de nascimento do usuário',
    example: '1990-01-01',
  })
  @Expose()
  birthDate?: string;

  @ApiPropertyOptional({
    description: 'Telefone do usuário',
    example: '+5511999999999',
  })
  @Expose()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Lista de eventos favoritos do usuário',
    type: [EventDto],
  })
  @Expose()
  @Type(() => EventDto)
  favoriteEvents: EventDto[];

  @ApiProperty({
    description: 'Indica se o perfil é privado',
    example: false,
  })
  @Expose()
  isPrivate: boolean;
}
