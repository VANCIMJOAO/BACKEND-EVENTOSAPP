"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidCpfException = void 0;
const common_1 = require("@nestjs/common");
class InvalidCpfException extends common_1.BadRequestException {
    constructor() {
        super('CPF inválido');
    }
}
exports.InvalidCpfException = InvalidCpfException;
//# sourceMappingURL=invalid-cpf.exception.js.map