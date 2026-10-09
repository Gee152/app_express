"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureAuthenticated = ensureAuthenticated;
const InvalidCredentialsError_js_1 = require("../../../domain/errors/InvalidCredentialsError.js");
function ensureAuthenticated(tokenProvider) {
    return (req, _res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return next(new InvalidCredentialsError_js_1.InvalidCredentialsError('Token de autenticação não fornecido.'));
        }
        const [scheme, token] = authHeader.split(' ');
        if (!/^Bearer$/i.test(scheme) || !token) {
            return next(new InvalidCredentialsError_js_1.InvalidCredentialsError('Formato de token inválido. Utilize: Bearer <token>'));
        }
        try {
            const payload = tokenProvider.verifyToken(token);
            req.user = payload;
            return next();
        }
        catch (err) {
            return next(err);
        }
    };
}
