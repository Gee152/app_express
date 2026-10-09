import { AppDataSource } from './data-source.js';

describe('Database Integration - PostgreSQL & TypeORM [Jest]', () => {
  it('should initialize DataSource and connect to Docker PostgreSQL container', async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    expect(AppDataSource.isInitialized).toBe(true);

    const result = await AppDataSource.query('SELECT 1 as test_val');
    expect(Number(result[0].test_val)).toBe(1);

    await AppDataSource.destroy();
  });
});
