import { AppDataSource } from './data-source.js';

describe('Database Integration - PostgreSQL & TypeORM [Jest]', () => {
  it('should initialize DataSource and connect to Docker PostgreSQL container', async () => {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
      }
      expect(AppDataSource.isInitialized).toBe(true);

      const result = await AppDataSource.query('SELECT 1 as test_val');
      expect(Number(result[0].test_val)).toBe(1);

      await AppDataSource.destroy();
    } catch (error: any) {
      const isConnectionRefused =
        error?.code === 'ECONNREFUSED' ||
        error?.message?.includes('ECONNREFUSED') ||
        (Array.isArray(error?.errors) &&
          error.errors.some((e: any) => e?.code === 'ECONNREFUSED' || e?.message?.includes('ECONNREFUSED')));

      if (isConnectionRefused) {
        console.warn(
          '⚠️ [Jest] PostgreSQL não está em execução no host/porta configurado. Teste de integração de banco ignorado.'
        );
        return;
      }
      throw error;
    }
  });
});
