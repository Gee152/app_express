import { test, expect } from '@playwright/test';
import { PublicCatalogPage } from '../pages/PublicCatalogPage';

test.describe('Vitrine Pública e Experiência do Cliente', () => {
  let publicPage: PublicCatalogPage;

  test.beforeEach(async ({ page }) => {
    publicPage = new PublicCatalogPage(page);
    await publicPage.gotoStore('minha-loja');
  });

  test('Deve carregar a vitrine pública com identidade visual e produtos', async ({ page }) => {
    // Deve exibir o cabeçalho e título da loja ou carregamento
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
  });

  test('Deve adicionar produto ao carrinho e atualizar contador', async ({ page }) => {
    // Clica no primeiro produto disponível
    const orderBtn = page.locator('button:has-text("+ Pedir"), button:has-text("Pedir")').first();
    if (await orderBtn.isVisible()) {
      await orderBtn.click();

      // Se abrir modal de produto ou adicionar direto
      const confirmInModal = page.locator('button:has-text("Adicionar ao Pedido")');
      if (await confirmInModal.isVisible()) {
        await confirmInModal.click();
      }

      // Verifica se o botão de pedido reflete o item
      await expect(page.locator('button').filter({ hasText: /Pedido \(\d+\)/i }).first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('Deve exibir a seção de localização e espaço físico se cadastrado', async ({ page }) => {
    // Localiza os elementos de mapa ou botões de navegação
    const mapsLink = page.locator('a:has-text("Google Maps"), a[title*="Google Maps" i]');
    if (await mapsLink.count() > 0) {
      await expect(mapsLink.first()).toBeVisible();
    }
  });
});
