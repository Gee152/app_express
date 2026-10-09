import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { SuperAdminPage } from '../pages/SuperAdminPage';

test.describe('Gestão de Lojas pelo Super Administrador', () => {
  let loginPage: LoginPage;
  let superAdminPage: SuperAdminPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    superAdminPage = new SuperAdminPage(page);
    await loginPage.goto();
    await loginPage.login('gabrielvictos152@gmail.com', '123456789');
  });

  test('Deve exibir o card de criação de nova loja no grid', async ({ page }) => {
    await expect(superAdminPage.novaLojaCard).toBeVisible();
    await expect(superAdminPage.newNomeInput).toBeVisible();
    await expect(superAdminPage.createStoreButton).toBeVisible();
  });

  test('Deve criar uma nova loja com credenciais e status de publicação ativos', async ({ page }) => {
    const uniqueStoreName = `Loja E2E ${Date.now().toString().slice(-4)}`;
    await superAdminPage.createStore(uniqueStoreName);

    // Deve encontrar a loja recém-criada
    const storeCard = page.locator(`div:has-text("${uniqueStoreName}")`).first();
    await expect(storeCard).toBeVisible({ timeout: 10000 });
    await expect(storeCard).toContainText('Publicada');
  });

  test('Deve alternar a visualização da senha pelo botão olhinho', async ({ page }) => {
    // Localiza o primeiro card de loja
    const firstStoreCard = page.locator('div[class*="rounded-2xl"]:has-text("/minha-loja")').first();
    if (await firstStoreCard.isVisible()) {
      // Inicialmente com bullets
      await expect(firstStoreCard).toContainText('••••••••');
      
      // Clica no olhinho
      const eyeButton = firstStoreCard.locator('button[title*="senha" i]').first();
      await eyeButton.click();
      
      // Deve revelar a senha 123456
      await expect(firstStoreCard).toContainText('123456');
    }
  });
});
