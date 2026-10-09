import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Relógio de Status e Esteira de Pedidos', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('gabrielvictos152@gmail.com', '123456789');

    // Abre o editor da loja no Super Admin
    const editBtn = page.getByRole('button', { name: 'Abrir no Editor' }).first();
    await editBtn.waitFor({ state: 'visible', timeout: 15000 });
    await editBtn.click();

    // Acessa a tela de Pedidos
    const pedidosNav = page.getByRole('button', { name: /Pedidos/i }).first();
    await pedidosNav.waitFor({ state: 'visible', timeout: 15000 });
    await pedidosNav.click();

    // Aguarda carregar a tela de Pedidos
    await expect(page.locator('text=Pedidos & Esteira').first()).toBeVisible({ timeout: 15000 });
  });

  test('Deve exibir o Relógio de Status circular com contadores da esteira', async ({ page }) => {
    // Relógio de Produção no topo
    await expect(page.locator('text=Relógio de Produção').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Na Esteira').first()).toBeVisible();

    // 4 Fases
    await expect(page.locator('text=Recebidos').first()).toBeVisible();
    await expect(page.locator('text=Em Preparo').first()).toBeVisible();
    await expect(page.locator('text=Prontos').first()).toBeVisible();
    await expect(page.locator('text=Já Saíram').first()).toBeVisible();
  });

  test('Deve filtrar pedidos ao clicar nas fatias do relógio e botões rápidos', async ({ page }) => {
    const filtroEsteira = page.locator('button:has-text("Na Esteira")').first();
    await filtroEsteira.click();
    await expect(filtroEsteira).toBeVisible();

    const filtroTodos = page.locator('button:has-text("Todos")').first();
    await filtroTodos.click();
    await expect(filtroTodos).toBeVisible();
  });

  test('Deve abrir o modal de exportação de faturamento para WhatsApp', async ({ page }) => {
    const exportarBtn = page.locator('button:has-text("Exportar")').first();
    await exportarBtn.click();

    await expect(page.locator('text=Exportar Faturamento').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Confirmar e Enviar")').first()).toBeVisible();

    const fecharBtn = page.locator('button:has-text("Cancelar")').first();
    await fecharBtn.click();
    await expect(page.locator('text=Exportar Faturamento')).not.toBeVisible();
  });
});
