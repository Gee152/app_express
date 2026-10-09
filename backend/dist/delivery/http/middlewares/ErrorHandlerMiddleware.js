"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const DomainError_js_1 = require("../../../domain/errors/DomainError.js");
const ValidationError_js_1 = require("../../../domain/errors/ValidationError.js");
function errorHandler(error, _req, res, _next) {
    if (error instanceof ValidationError_js_1.ValidationError) {
        return res.status(error.statusCode).json({
            status: 'error',
            message: error.message,
            errors: error.errors,
        });
    }
    if (error instanceof DomainError_js_1.DomainError) {
        return res.status(error.statusCode).json({
            status: 'error',
            message: error.message,
        });
    }
    console.error('Unhandled Server Error:', error);
    return res.status(500).json({
        status: 'error',
        message: 'Ocorreu um erro interno inesperado no servidor.',
    });
}
