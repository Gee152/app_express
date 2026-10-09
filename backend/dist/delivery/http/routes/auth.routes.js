"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthRoutes = createAuthRoutes;
const express_1 = require("express");
const ValidationMiddleware_js_1 = require("../middlewares/ValidationMiddleware.js");
const LoginRequestDTO_js_1 = require("../../../domain/dtos/auth/LoginRequestDTO.js");
const RegisterUserDTO_js_1 = require("../../../domain/dtos/auth/RegisterUserDTO.js");
const AuthMiddleware_js_1 = require("../middlewares/AuthMiddleware.js");
function createAuthRoutes(authController, tokenProvider) {
    const router = (0, express_1.Router)();
    router.post('/login', (0, ValidationMiddleware_js_1.validateDto)(LoginRequestDTO_js_1.LoginRequestDTO), authController.login);
    router.post('/register', (0, ValidationMiddleware_js_1.validateDto)(RegisterUserDTO_js_1.RegisterUserDTO), authController.register);
    router.get('/me', (0, AuthMiddleware_js_1.ensureAuthenticated)(tokenProvider), authController.me);
    return router;
}
