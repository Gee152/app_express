import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model para a tela unificada de Login
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly senhaInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly passwordToggleEye: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"]').first();
    this.senhaInput = page.locator('input[type="password"], input[placeholder*="••••"]').first();
    this.submitButton = page.locator('button[type="submit"]').first();
    this.errorMessage = page.locator('.text-red-300, .bg-red-950, div:has-text("E-mail ou senha incorretos")').first();
    this.passwordToggleEye = page.locator('button[title*="senha" i]');
  }

  async goto() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    await this.page.waitForSelector('text=Carregando vitrine...', { state: 'detached', timeout: 15000 }).catch(() => {});

    // Se já estiver logado, faz logout pelo botão Sair
    const logoutBtn = this.page.locator('button:has-text("Sair")').first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await this.page.waitForSelector('input[type="email"]', { state: 'visible', timeout: 10000 }).catch(() => {});
    }
  }

  async login(email: string, pass: string) {
    await this.emailInput.waitFor({ state: 'visible', timeout: 15000 });
    await this.emailInput.fill(email);
    await this.senhaInput.fill(pass);
    await this.submitButton.click();
  }

  async expectErrorMessage(text?: string) {
    await expect(this.errorMessage).toBeVisible({ timeout: 10000 });
    if (text) {
      await expect(this.errorMessage).toContainText(text);
    }
  }
}
