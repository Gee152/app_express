import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Gestão de Produtos, Categorias e Marketplaces', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('gabrielvictos152@gmail.com', '123456789');

    // Abre o editor da loja no Super Admin
    const editBtn = page.getByRole('button', { name: 'Abrir no Editor' }).first();
    await editBtn.waitFor({ state: 'visible', timeout: 15000 });
    await editBtn.click();

    // Garante que o AdminDashboard carregou
    await expect(page.locator('text=Painel Admin — Catálogo Express').first()).toBeVisible({ timeout: 15000 });
  });

  test('Deve visualizar a listagem de produtos cadastrados', async ({ page }) => {
    await expect(page.locator('button:has-text("+ Novo Produto")').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Gerenciar Produtos').first()).toBeVisible({ timeout: 10000 });
  });

  test('Deve abrir o modal de cadastro de produto e suportar opções de adicionais', async ({ page }) => {
    const novoProdutoBtn = page.locator('button:has-text("+ Novo Produto")').first();
    await novoProdutoBtn.waitFor({ state: 'visible', timeout: 10000 });
    await novoProdutoBtn.click();

    // Modal de cadastro aberto
    await expect(page.locator('h3:has-text("Novo Produto")').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[placeholder*="Ex:"]').first()).toBeVisible({ timeout: 10000 });

    // Fecha o modal
    const fecharBtn = page.locator('button:has-text("✕")').first();
    await fecharBtn.click();
  });

  test('Deve permitir gerenciar categorias de produtos', async ({ page }) => {
    const novaCatInput = page.locator('input[placeholder*="Nova categoria"]').first();
    await novaCatInput.waitFor({ state: 'visible', timeout: 10000 });

    const catName = `Categoria E2E ${Date.now().toString().slice(-4)}`;
    await novaCatInput.fill(catName);

    const addBtn = page.locator('button:has-text("Adicionar")').first();
    await addBtn.click();

    // Verifica que a nova categoria foi adicionada na listagem
    await expect(page.locator(`text=${catName}`).first()).toBeVisible({ timeout: 10000 });
  });
});
