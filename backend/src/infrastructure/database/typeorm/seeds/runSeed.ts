import 'reflect-metadata';
import { AppDataSource } from '../data-source.js';
import { seedSuperAdmin } from './seedSuperAdmin.js';

async function run() {
  try {
    console.log('🔄 Inicializando DataSource para executar seeder...');
    await AppDataSource.initialize();
    await seedSuperAdmin();
    await AppDataSource.destroy();
    console.log('🏁 Processo de seed concluído com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Falha ao executar o seeder:', error);
    process.exit(1);
  }
}

run();
