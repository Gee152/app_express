"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const env_config_js_1 = require("../../../config/env.config.js");
const UserSchema_js_1 = require("./entities/UserSchema.js");
const StoreSchema_js_1 = require("./entities/StoreSchema.js");
const CategorySchema_js_1 = require("./entities/CategorySchema.js");
const ProductSchema_js_1 = require("./entities/ProductSchema.js");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: env_config_js_1.envConfig.database.host,
    port: env_config_js_1.envConfig.database.port,
    username: env_config_js_1.envConfig.database.user,
    password: env_config_js_1.envConfig.database.password,
    database: env_config_js_1.envConfig.database.name,
    synchronize: env_config_js_1.envConfig.nodeEnv === 'development', // Sincroniza tabelas no dev; usar migrations em produção
    logging: env_config_js_1.envConfig.nodeEnv === 'development',
    entities: [UserSchema_js_1.UserSchema, StoreSchema_js_1.StoreSchema, CategorySchema_js_1.CategorySchema, ProductSchema_js_1.ProductSchema],
    migrations: ['src/infrastructure/database/typeorm/migrations/*.ts'],
    subscribers: [],
});
