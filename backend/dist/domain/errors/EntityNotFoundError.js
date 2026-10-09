"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityNotFoundError = void 0;
const DomainError_js_1 = require("./DomainError.js");
class EntityNotFoundError extends DomainError_js_1.DomainError {
    statusCode = 404;
    constructor(entityName, identifier) {
        super(`${entityName} ${identifier ? `"${identifier}" ` : ''}não foi encontrado(a).`);
    }
}
exports.EntityNotFoundError = EntityNotFoundError;
