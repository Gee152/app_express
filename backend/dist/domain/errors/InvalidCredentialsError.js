"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidCredentialsError = void 0;
const DomainError_js_1 = require("./DomainError.js");
class InvalidCredentialsError extends DomainError_js_1.DomainError {
    statusCode = 401;
    constructor(message = 'E-mail ou senha inválidos.') {
        super(message);
    }
}
exports.InvalidCredentialsError = InvalidCredentialsError;
