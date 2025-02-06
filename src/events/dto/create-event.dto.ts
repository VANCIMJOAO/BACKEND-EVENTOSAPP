// src/events/dto/create-event.dto.ts

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  ArrayNotEmpty,
  IsDateString,
  ValidateIf,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateEventDto {
  @IsString()
  @IsNotEmpty({ message: 'O título do evento é obrigatório.' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'A descrição do evento é obrigatória.' })
  description: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Selecione pelo menos uma categoria.' })
  @IsString({ each: true })
  categories: string[];

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsString()
  @IsNotEmpty({ message: 'O nome do local é obrigatório.' })
  placeName: string;

  @IsDateString({}, { message: 'A data do evento deve ser uma data válida.' })
  eventDate: string;

  @IsDateString({}, { message: 'A hora inicial deve ser uma hora válida.' })
  startTime: string;

  @IsDateString({}, { message: 'A hora final deve ser uma hora válida.' })
  endTime: string;

  @IsString()
  @IsNotEmpty({ message: 'O endereço do evento é obrigatório.' })
  address: string;

  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isFree: boolean;

  @ValidateIf((o) => !o.isFree)
  @IsString()
  @IsNotEmpty({ message: 'Defina um preço válido para o ingresso.' })
  ticketPrice?: string;

  @IsString()
  @IsOptional()
  registrationStatus?: string;
}
