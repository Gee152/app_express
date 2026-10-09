"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
class AuthController {
    authenticateUserUseCase;
    registerUserUseCase;
    constructor(authenticateUserUseCase, registerUserUseCase) {
        this.authenticateUserUseCase = authenticateUserUseCase;
        this.registerUserUseCase = registerUserUseCase;
    }
    login = async (req, res, next) => {
        try {
            const result = await this.authenticateUserUseCase.execute(req.body);
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    };
    register = async (req, res, next) => {
        try {
            const result = await this.registerUserUseCase.execute(req.body);
            res.status(201).json(result);
        }
        catch (err) {
            next(err);
        }
    };
    me = async (req, res, next) => {
        try {
            res.status(200).json({ user: req.user });
        }
        catch (err) {
            next(err);
        }
    };
}
exports.AuthController = AuthController;
