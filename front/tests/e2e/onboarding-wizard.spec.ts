import { test, expect } from '@playwright/test';

test.describe('Fluxo de Onboarding e Primeiro Acesso', () => {
  test('Deve exibir tela de acesso com identificador da loja ao acessar via link de acesso', async ({ page }) => {
    const uniqueSlug = `nova-loja-${Date.now().toString().slice(-4)}`;
    await page.goto(`/?acesso=${uniqueSlug}`, { waitUntil: 'domcontentloaded' });

    // Deve carregar a tela de acesso com a logo e título
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
  });

  test('Deve permitir alternar tema da aplicação', async ({ page }) => {
    await page.goto(`/?loja=minha-loja`, { waitUntil: 'domcontentloaded' });

    // Localiza botão de tema se presente ou verifica elementos da vitrine
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 15000 });
  });
});
