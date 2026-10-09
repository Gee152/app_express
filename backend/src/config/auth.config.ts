import { envConfig } from './env.config.js';

export const authConfig = {
  jwt: {
    secret: envConfig.jwt.secret,
    expiresIn: envConfig.jwt.expiresIn,
  },
};
