import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Autenticação e Controle de Acesso', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('Deve realizar login com sucesso como Super Admin', async ({ page }) => {
    await loginPage.login('gabrielvictos152@gmail.com', '123456789');
    
    // Deve renderizar a tela de gerenciamento de lojas do Super Admin
    await expect(page.getByRole('heading', { name: /Super Admin/i })).toBeVisible({ timeout: 15000 });
  });

  test('Deve bloquear acesso com credenciais incorretas', async ({ page }) => {
    await loginPage.login('invalido@teste.com', 'senha_errada');
    
    // Deve exibir feedback de erro
    await loginPage.expectErrorMessage('E-mail ou senha incorretos');
  });
});
