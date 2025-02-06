import { Expose, Exclude } from 'class-transformer';
import { IsEmail, IsString, MinLength, Matches, Validate, IsOptional } from 'class-validator';
import { IsValidCpf } from '../../utils/cpf.validator';

export class RegisterDto {
  @Expose()
  @IsEmail({}, { message: 'Formato de email inválido' })
  email: string;

  @Expose()
  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
    message: 'A senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais',
  })
  password: string;

  @Expose()
  @IsString()
  @MinLength(3, { message: 'O apelido deve ter pelo menos 3 caracteres' })
  nickname: string;

  @Expose()
  @IsString()
  @Matches(/^\d{11}$/, { message: 'CPF deve conter 11 dígitos' })
  @Validate(IsValidCpf)
  cpf: string;

  @Exclude() // Remove campos extras não permitidos
  extraField?: string;

  @Expose()
  @IsOptional()
  @IsString()
  avatar?: string; // Adiciona o campo para a imagem de perfil, se desejar

  // Caso você queira aceitar também "name" diretamente, pode incluir:
  @Expose()
  @IsOptional()
  @IsString()
  name?: string;
}
