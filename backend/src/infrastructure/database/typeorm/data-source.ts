import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { envConfig } from '../../../config/env.config.js';
import { User, Store, Category, Product } from './entities/index.js';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: envConfig.database.host,
  port: envConfig.database.port,
  username: envConfig.database.user,
  password: envConfig.database.password,
  database: envConfig.database.name,
  synchronize: envConfig.nodeEnv === 'development', // Sincroniza tabelas no dev; usar migrations em produção
  logging: envConfig.nodeEnv === 'development',
  entities: [User, Store, Category, Product],
  migrations: ['src/infrastructure/database/typeorm/migrations/*.ts'],
  subscribers: [],
});
