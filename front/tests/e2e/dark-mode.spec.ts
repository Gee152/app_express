import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Alternância de Tema (Dark Mode / Light Mode)', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('gabrielvictos152@gmail.com', '123456789');

    // Entra na primeira loja
    const storeCard = page.locator('div[class*="rounded-2xl"]:has-text("/minha-loja")').first();
    if (await storeCard.isVisible()) {
      const openAdminBtn = storeCard.locator('button:has-text("Editar"), button:has-text("Painel"), a').first();
      await openAdminBtn.click();
    }
  });

  test('Deve alternar o tema da aplicação através do botão Sol/Lua no Admin', async ({ page }) => {
    // Localiza o botão de alternância de tema no cabeçalho
    const themeBtn = page.locator('button[title*="Modo" i]').first();
    await expect(themeBtn).toBeVisible({ timeout: 10000 });

    const htmlElement = page.locator('html');

    // Estado inicial
    const initialIsDark = await htmlElement.evaluate((el) => el.classList.contains('dark'));

    // Clica para alternar
    await themeBtn.click();

    // Deve ter invertido o estado da classe dark
    const afterFirstClick = await htmlElement.evaluate((el) => el.classList.contains('dark'));
    expect(afterFirstClick).toBe(!initialIsDark);

    // Clica novamente para retornar
    await themeBtn.click();
    const afterSecondClick = await htmlElement.evaluate((el) => el.classList.contains('dark'));
    expect(afterSecondClick).toBe(initialIsDark);
  });
});
