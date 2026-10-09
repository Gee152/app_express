import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model para o painel de Gerenciamento de Lojas do Super Admin
 */
export class SuperAdminPage {
  readonly page: Page;
  readonly novaLojaCard: Locator;
  readonly newNomeInput: Locator;
  readonly createStoreButton: Locator;
  readonly storesGrid: Locator;
  readonly shareBanner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.novaLojaCard = page.locator('div:has-text("Nova Loja / Cliente")').first();
    this.newNomeInput = page.locator('input[placeholder*="Burger Recife" i]').first();
    this.createStoreButton = page.locator('button:has-text("Criar Loja")').first();
    this.storesGrid = page.locator('.grid.grid-cols-1');
    this.shareBanner = page.locator('div:has-text("Link do seu Catálogo Digital")');
  }

  async createStore(nome: string) {
    await this.newNomeInput.fill(nome);
    await this.createStoreButton.click();
    await this.page.waitForTimeout(500);
  }

  async selectStoreBySlug(slug: string) {
    const storeCard = this.page.locator(`div[class*="rounded-2xl"]:has-text("/${slug}")`).first();
    await storeCard.click();
  }

  async expectStoreActive(slug: string) {
    const storeCard = this.page.locator(`div[class*="rounded-2xl"]:has-text("/${slug}")`).first();
    await expect(storeCard).toContainText('✓');
    await expect(storeCard).toContainText('Ativa');
  }

  async togglePasswordEye(slug: string) {
    const eyeButton = this.page.locator(`div:has-text("/${slug}") button[title*="senha" i]`).first();
    await eyeButton.click();
  }
}
