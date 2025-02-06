// src/common/exceptions/invalid-cpf.exception.ts
import { BadRequestException } from '@nestjs/common';

export class InvalidCpfException extends BadRequestException {
  constructor() {
    super('CPF inválido');
  }
}
