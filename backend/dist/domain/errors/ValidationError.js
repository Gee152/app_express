"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
const DomainError_js_1 = require("./DomainError.js");
class ValidationError extends DomainError_js_1.DomainError {
    statusCode = 400;
    errors;
    constructor(errors) {
        super('Falha de validação nos dados enviados.');
        this.errors = errors;
    }
}
exports.ValidationError = ValidationError;
