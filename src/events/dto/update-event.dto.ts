// src/events/dto/update-event.dto.ts

import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  ArrayNotEmpty,
  IsDateString,
  ValidateIf,
  IsNumber,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateEventDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  categories?: string[];

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsString()
  @IsOptional()
  placeName?: string;

  @IsDateString({}, { message: 'A data do evento deve ser uma data válida.' })
  @IsOptional()
  eventDate?: string;

  @IsDateString({}, { message: 'A hora inicial deve ser uma hora válida.' })
  @IsOptional()
  startTime?: string;

  @IsDateString({}, { message: 'A hora final deve ser uma hora válida.' })
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isFree?: boolean;

  @ValidateIf((o) => o.isFree === false)
  @IsString()
  @IsOptional()
  ticketPrice?: string;

  @IsString()
  @IsOptional()
  registrationStatus?: string;
}
