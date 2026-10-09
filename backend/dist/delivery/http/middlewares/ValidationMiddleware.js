"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDto = validateDto;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const ValidationError_js_1 = require("../../../domain/errors/ValidationError.js");
function validateDto(dtoClass) {
    return async (req, _res, next) => {
        const dtoInstance = (0, class_transformer_1.plainToInstance)(dtoClass, req.body);
        const errors = await (0, class_validator_1.validate)(dtoInstance, {
            whitelist: true,
            forbidNonWhitelisted: false,
        });
        if (errors.length > 0) {
            const formattedErrors = errors.flatMap((err) => err.constraints ? Object.values(err.constraints) : ['Valor inválido']);
            return next(new ValidationError_js_1.ValidationError(formattedErrors));
        }
        req.body = dtoInstance;
        next();
    };
}
