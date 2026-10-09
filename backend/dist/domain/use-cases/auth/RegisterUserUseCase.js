"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUserUseCase = void 0;
const User_js_1 = require("../../entities/User.js");
const EmailAlreadyInUseError_js_1 = require("../../errors/EmailAlreadyInUseError.js");
class RegisterUserUseCase {
    userRepository;
    hashProvider;
    constructor(userRepository, hashProvider) {
        this.userRepository = userRepository;
        this.hashProvider = hashProvider;
    }
    async execute(dto) {
        const existingUser = await this.userRepository.findByEmail(dto.email);
        if (existingUser) {
            throw new EmailAlreadyInUseError_js_1.EmailAlreadyInUseError(dto.email);
        }
        const passwordHash = await this.hashProvider.generateHash(dto.password);
        const user = new User_js_1.User({
            name: dto.name,
            email: dto.email,
            passwordHash,
            storeId: dto.storeId || null,
            role: 'owner',
        });
        const created = await this.userRepository.create(user);
        return {
            id: created.id,
            name: created.name,
            email: created.email,
            role: created.role,
            storeId: created.storeId,
            createdAt: created.createdAt,
        };
    }
}
exports.RegisterUserUseCase = RegisterUserUseCase;
