"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const app_js_1 = require("../../app.js");
const data_source_js_1 = require("../../infrastructure/database/typeorm/data-source.js");
const env_config_js_1 = require("../../config/env.config.js");
async function bootstrap() {
    try {
        console.log('🔄 Conectando ao banco de dados PostgreSQL via TypeORM...');
        await data_source_js_1.AppDataSource.initialize();
        console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');
        const app = (0, app_js_1.createApp)();
        app.listen(env_config_js_1.envConfig.port, () => {
            console.log(`🚀 Servidor backend rodando em http://localhost:${env_config_js_1.envConfig.port}`);
            console.log(`📡 Healthcheck disponível em: http://localhost:${env_config_js_1.envConfig.port}/api/health`);
        });
    }
    catch (error) {
        console.error('❌ Erro fatal ao inicializar o servidor backend:', error);
        process.exit(1);
    }
}
bootstrap();
