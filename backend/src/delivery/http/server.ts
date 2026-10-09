import 'reflect-metadata';
import { createApp } from '../../app.js';
import { AppDataSource } from '../../infrastructure/database/typeorm/data-source.js';
import { envConfig } from '../../config/env.config.js';
import { seedSuperAdmin } from '../../infrastructure/database/typeorm/seeds/seedSuperAdmin.js';

async function bootstrap() {
  try {
    console.log('🔄 Conectando ao banco de dados PostgreSQL via TypeORM...');
    await AppDataSource.initialize();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso!');

    await seedSuperAdmin();

    const app = createApp();

    app.listen(envConfig.port, () => {
      console.log(`🚀 Servidor backend rodando em http://localhost:${envConfig.port}`);
      console.log(`📡 Healthcheck disponível em: http://localhost:${envConfig.port}/api/health`);
    });
  } catch (error) {
    console.error('❌ Erro fatal ao inicializar o servidor backend:', error);
    process.exit(1);
  }
}

bootstrap();
