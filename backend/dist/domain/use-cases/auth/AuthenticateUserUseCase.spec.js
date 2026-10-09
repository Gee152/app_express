"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const node_assert_1 = __importDefault(require("node:assert"));
const InMemoryUserRepository_js_1 = require("../../repositories/in-memory/InMemoryUserRepository.js");
const AuthenticateUserUseCase_js_1 = require("./AuthenticateUserUseCase.js");
const RegisterUserUseCase_js_1 = require("./RegisterUserUseCase.js");
const InvalidCredentialsError_js_1 = require("../../errors/InvalidCredentialsError.js");
const EmailAlreadyInUseError_js_1 = require("../../errors/EmailAlreadyInUseError.js");
// Mocks rápidos de providers para teste unitário (Zero dependência externa)
class FakeHashProvider {
    async generateHash(payload) {
        return `hashed_${payload}`;
    }
    async compareHash(payload, hashed) {
        return `hashed_${payload}` === hashed;
    }
}
class FakeTokenProvider {
    generateToken(payload) {
        return `fake_token_${payload.userId}`;
    }
    verifyToken(token) {
        return { userId: token.replace('fake_token_', ''), role: 'owner' };
    }
}
(0, node_test_1.describe)('Auth Use Cases - Clean Architecture & SOLID', () => {
    (0, node_test_1.it)('should register a new user and return secure profile data', async () => {
        const userRepository = new InMemoryUserRepository_js_1.InMemoryUserRepository();
        const hashProvider = new FakeHashProvider();
        const registerUseCase = new RegisterUserUseCase_js_1.RegisterUserUseCase(userRepository, hashProvider);
        const user = await registerUseCase.execute({
            name: 'Gabriel Teste',
            email: 'gabriel@teste.com',
            password: 'minhasenha123',
        });
        node_assert_1.default.strictEqual(user.name, 'Gabriel Teste');
        node_assert_1.default.strictEqual(user.email, 'gabriel@teste.com');
        node_assert_1.default.strictEqual(userRepository.users.length, 1);
    });
    (0, node_test_1.it)('should not allow duplicate email registration', async () => {
        const userRepository = new InMemoryUserRepository_js_1.InMemoryUserRepository();
        const hashProvider = new FakeHashProvider();
        const registerUseCase = new RegisterUserUseCase_js_1.RegisterUserUseCase(userRepository, hashProvider);
        await registerUseCase.execute({
            name: 'Gabriel Teste',
            email: 'duplicado@teste.com',
            password: 'minhasenha123',
        });
        await node_assert_1.default.rejects(async () => {
            await registerUseCase.execute({
                name: 'Outro Usuario',
                email: 'duplicado@teste.com',
                password: 'outrasenha123',
            });
        }, (err) => err instanceof EmailAlreadyInUseError_js_1.EmailAlreadyInUseError);
    });
    (0, node_test_1.it)('should authenticate user with valid credentials and return JWT token', async () => {
        const userRepository = new InMemoryUserRepository_js_1.InMemoryUserRepository();
        const hashProvider = new FakeHashProvider();
        const tokenProvider = new FakeTokenProvider();
        const registerUseCase = new RegisterUserUseCase_js_1.RegisterUserUseCase(userRepository, hashProvider);
        await registerUseCase.execute({
            name: 'Gabriel Auth',
            email: 'auth@teste.com',
            password: 'password123',
        });
        const authUseCase = new AuthenticateUserUseCase_js_1.AuthenticateUserUseCase(userRepository, hashProvider, tokenProvider);
        const response = await authUseCase.execute({
            email: 'auth@teste.com',
            password: 'password123',
        });
        node_assert_1.default.ok(response.token.startsWith('fake_token_'));
        node_assert_1.default.strictEqual(response.user.email, 'auth@teste.com');
    });
    (0, node_test_1.it)('should reject authentication with wrong password', async () => {
        const userRepository = new InMemoryUserRepository_js_1.InMemoryUserRepository();
        const hashProvider = new FakeHashProvider();
        const tokenProvider = new FakeTokenProvider();
        const registerUseCase = new RegisterUserUseCase_js_1.RegisterUserUseCase(userRepository, hashProvider);
        await registerUseCase.execute({
            name: 'Gabriel Auth',
            email: 'wrongpass@teste.com',
            password: 'password123',
        });
        const authUseCase = new AuthenticateUserUseCase_js_1.AuthenticateUserUseCase(userRepository, hashProvider, tokenProvider);
        await node_assert_1.default.rejects(async () => {
            await authUseCase.execute({
                email: 'wrongpass@teste.com',
                password: 'incorrectPassword',
            });
        }, (err) => err instanceof InvalidCredentialsError_js_1.InvalidCredentialsError);
    });
});
