"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsValidCpf = void 0;
const class_validator_1 = require("class-validator");
const validators_1 = require("./validators");
let IsValidCpf = class IsValidCpf {
    validate(cpf) {
        return (0, validators_1.isValidCPF)(cpf);
    }
    defaultMessage() {
        return 'CPF inválido';
    }
};
exports.IsValidCpf = IsValidCpf;
exports.IsValidCpf = IsValidCpf = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isValidCPF', async: false })
], IsValidCpf);
//# sourceMappingURL=cpf.validator.js.map