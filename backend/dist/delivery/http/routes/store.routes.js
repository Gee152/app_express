"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStoreRoutes = createStoreRoutes;
const express_1 = require("express");
const ValidationMiddleware_js_1 = require("../middlewares/ValidationMiddleware.js");
const CreateStoreDTO_js_1 = require("../../../domain/dtos/store/CreateStoreDTO.js");
const AuthMiddleware_js_1 = require("../middlewares/AuthMiddleware.js");
function createStoreRoutes(storeController, tokenProvider) {
    const router = (0, express_1.Router)();
    router.post('/', (0, AuthMiddleware_js_1.ensureAuthenticated)(tokenProvider), (0, ValidationMiddleware_js_1.validateDto)(CreateStoreDTO_js_1.CreateStoreDTO), storeController.create);
    router.get('/:slug', storeController.getBySlug);
    return router;
}
