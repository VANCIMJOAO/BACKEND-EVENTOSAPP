// src/utils/validators/cpf.validator.ts
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { isValidCPF } from './validators';

@ValidatorConstraint({ name: 'isValidCPF', async: false })
export class IsValidCpf implements ValidatorConstraintInterface {
  validate(cpf: string): boolean {
    return isValidCPF(cpf);
  }

  defaultMessage(): string {
    return 'CPF inválido';
  }
}
