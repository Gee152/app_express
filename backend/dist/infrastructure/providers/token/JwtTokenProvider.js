"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtTokenProvider = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_config_js_1 = require("../../../config/auth.config.js");
const InvalidCredentialsError_js_1 = require("../../../domain/errors/InvalidCredentialsError.js");
class JwtTokenProvider {
    generateToken(payload) {
        return jsonwebtoken_1.default.sign(payload, auth_config_js_1.authConfig.jwt.secret, {
            expiresIn: auth_config_js_1.authConfig.jwt.expiresIn,
        });
    }
    verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, auth_config_js_1.authConfig.jwt.secret);
            return decoded;
        }
        catch {
            throw new InvalidCredentialsError_js_1.InvalidCredentialsError('Token de autenticação inválido ou expirado.');
        }
    }
}
exports.JwtTokenProvider = JwtTokenProvider;
