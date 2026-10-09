"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
// Infrastructure Providers
const BcryptHashProvider_js_1 = require("./infrastructure/providers/hash/BcryptHashProvider.js");
const JwtTokenProvider_js_1 = require("./infrastructure/providers/token/JwtTokenProvider.js");
// Infrastructure Repositories (TypeORM)
const TypeOrmUserRepository_js_1 = require("./infrastructure/database/typeorm/repositories/TypeOrmUserRepository.js");
const TypeOrmStoreRepository_js_1 = require("./infrastructure/database/typeorm/repositories/TypeOrmStoreRepository.js");
// Domain Use Cases
const AuthenticateUserUseCase_js_1 = require("./domain/use-cases/auth/AuthenticateUserUseCase.js");
const RegisterUserUseCase_js_1 = require("./domain/use-cases/auth/RegisterUserUseCase.js");
const CreateStoreUseCase_js_1 = require("./domain/use-cases/store/CreateStoreUseCase.js");
const GetStoreBySlugUseCase_js_1 = require("./domain/use-cases/store/GetStoreBySlugUseCase.js");
// Delivery HTTP Controllers & Routes
const AuthController_js_1 = require("./delivery/http/controllers/AuthController.js");
const StoreController_js_1 = require("./delivery/http/controllers/StoreController.js");
const index_js_1 = require("./delivery/http/routes/index.js");
const ErrorHandlerMiddleware_js_1 = require("./delivery/http/middlewares/ErrorHandlerMiddleware.js");
function createApp() {
    const app = (0, express_1.default)();
    // Global Middlewares
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    // Injeção de Dependências (Composition Root)
    const hashProvider = new BcryptHashProvider_js_1.BcryptHashProvider();
    const tokenProvider = new JwtTokenProvider_js_1.JwtTokenProvider();
    const userRepository = new TypeOrmUserRepository_js_1.TypeOrmUserRepository();
    const storeRepository = new TypeOrmStoreRepository_js_1.TypeOrmStoreRepository();
    const authenticateUserUseCase = new AuthenticateUserUseCase_js_1.AuthenticateUserUseCase(userRepository, hashProvider, tokenProvider);
    const registerUserUseCase = new RegisterUserUseCase_js_1.RegisterUserUseCase(userRepository, hashProvider);
    const createStoreUseCase = new CreateStoreUseCase_js_1.CreateStoreUseCase(storeRepository);
    const getStoreBySlugUseCase = new GetStoreBySlugUseCase_js_1.GetStoreBySlugUseCase(storeRepository);
    const authController = new AuthController_js_1.AuthController(authenticateUserUseCase, registerUserUseCase);
    const storeController = new StoreController_js_1.StoreController(createStoreUseCase, getStoreBySlugUseCase);
    // Rotas da API
    app.use('/api', (0, index_js_1.createApiRouter)({
        authController,
        storeController,
        tokenProvider,
    }));
    // Interceptor global de erros (deve ser o último middleware)
    app.use(ErrorHandlerMiddleware_js_1.errorHandler);
    return app;
}
