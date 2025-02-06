import { ValidatorConstraintInterface } from 'class-validator';
export declare class IsValidCpf implements ValidatorConstraintInterface {
    validate(cpf: string): boolean;
    defaultMessage(): string;
}
