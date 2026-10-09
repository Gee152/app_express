import dotenv from 'dotenv';

dotenv.config();

export const envConfig = {
  port: Number(process.env.PORT) || 3333,
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'catalogo_express',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_key_antigravity',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
};
