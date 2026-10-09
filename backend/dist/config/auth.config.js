"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authConfig = void 0;
const env_config_js_1 = require("./env.config.js");
exports.authConfig = {
    jwt: {
        secret: env_config_js_1.envConfig.jwt.secret,
        expiresIn: env_config_js_1.envConfig.jwt.expiresIn,
    },
};
