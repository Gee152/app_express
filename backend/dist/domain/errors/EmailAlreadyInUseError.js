"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailAlreadyInUseError = void 0;
const DomainError_js_1 = require("./DomainError.js");
class EmailAlreadyInUseError extends DomainError_js_1.DomainError {
    statusCode = 409;
    constructor(email) {
        super(`O e-mail "${email}" já está cadastrado.`);
    }
}
exports.EmailAlreadyInUseError = EmailAlreadyInUseError;
