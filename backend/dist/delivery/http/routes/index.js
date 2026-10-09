"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiRouter = createApiRouter;
const express_1 = require("express");
const auth_routes_js_1 = require("./auth.routes.js");
const store_routes_js_1 = require("./store.routes.js");
function createApiRouter(deps) {
    const router = (0, express_1.Router)();
    router.get('/health', (_req, res) => {
        res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    router.use('/auth', (0, auth_routes_js_1.createAuthRoutes)(deps.authController, deps.tokenProvider));
    router.use('/stores', (0, store_routes_js_1.createStoreRoutes)(deps.storeController, deps.tokenProvider));
    return router;
}
