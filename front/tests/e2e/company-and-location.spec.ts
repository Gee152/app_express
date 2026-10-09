import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CompanyEditorPage } from '../pages/CompanyEditorPage';

test.describe('Perfil da Empresa, Headline e Espaço Físico', () => {
  let loginPage: LoginPage;
  let companyEditorPage: CompanyEditorPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    companyEditorPage = new CompanyEditorPage(page);
    await loginPage.goto();
    await loginPage.login('gabrielvictos152@gmail.com', '123456789');

    // Abre o editor da loja no Super Admin
    const editBtn = page.getByRole('button', { name: 'Abrir no Editor' }).first();
    await editBtn.waitFor({ state: 'visible', timeout: 15000 });
    await editBtn.click();

    // Navega para a aba Perfil da Empresa no AdminDashboard
    const perfilTab = page.getByRole('button', { name: /Perfil da Empresa/i }).first();
    await perfilTab.waitFor({ state: 'visible', timeout: 15000 });
    await perfilTab.click();

    // Garante que o CompanyEditor está completamente carregado
    await page.locator('text=Mensagem de Boas-Vindas da Vitrine').waitFor({ state: 'visible', timeout: 15000 });
  });

  test('Deve permitir personalizar a Headline da vitrine', async ({ page }) => {
    // Verifica campos de Headline
    const headlineHeading = page.locator('text=Mensagem de Boas-Vindas da Vitrine');
    await expect(headlineHeading).toBeVisible({ timeout: 10000 });

    // Testa sugestão por nicho
    if (await companyEditorPage.suggestHeadlineButton.isVisible()) {
      await companyEditorPage.suggestHeadlineButton.click();
      await expect(companyEditorPage.headlineTituloInput).not.toBeEmpty();
    }
  });

  test('Deve abrir o modal de troca de senha e validar a senha atual', async ({ page }) => {
    // Clica no botão para abrir modal
    await companyEditorPage.openPasswordModal();

    // Modal deve estar visível
    const modal = page.locator('div.fixed:has-text("Alterar Senha de Acesso")');
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Tenta trocar com senha errada
    await companyEditorPage.changePassword('senha_incorreta_123', 'nova4321', 'nova4321');
    
    // Alerta de erro deve ser exibido dentro do modal
    const errorAlert = modal.locator('.text-red-700, .bg-red-50').first();
    await expect(errorAlert).toBeVisible({ timeout: 10000 });
    await expect(errorAlert).toContainText(/incorreta/i);
  });
});
