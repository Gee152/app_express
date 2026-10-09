"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticateUserUseCase = void 0;
const InvalidCredentialsError_js_1 = require("../../errors/InvalidCredentialsError.js");
class AuthenticateUserUseCase {
    userRepository;
    hashProvider;
    tokenProvider;
    constructor(userRepository, hashProvider, tokenProvider) {
        this.userRepository = userRepository;
        this.hashProvider = hashProvider;
        this.tokenProvider = tokenProvider;
    }
    async execute(dto) {
        const user = await this.userRepository.findByEmail(dto.email);
        if (!user) {
            throw new InvalidCredentialsError_js_1.InvalidCredentialsError();
        }
        const passwordMatches = await this.hashProvider.compareHash(dto.password, user.passwordHash);
        if (!passwordMatches) {
            throw new InvalidCredentialsError_js_1.InvalidCredentialsError();
        }
        const token = this.tokenProvider.generateToken({
            userId: user.id,
            storeId: user.storeId,
            role: user.role,
        });
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                storeId: user.storeId,
            },
        };
    }
}
exports.AuthenticateUserUseCase = AuthenticateUserUseCase;
