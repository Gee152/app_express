import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model para a tela de Perfil da Empresa, Headline e Espaço Físico
 */
export class CompanyEditorPage {
  readonly page: Page;
  readonly nomeInput: Locator;
  readonly whatsappInput: Locator;
  readonly headlineTituloInput: Locator;
  readonly headlineSubtituloInput: Locator;
  readonly suggestHeadlineButton: Locator;
  readonly temEspacoFisicoToggle: Locator;
  readonly enderecoInput: Locator;
  readonly generateMapsLinkButton: Locator;
  readonly saveButton: Locator;
  readonly passwordModal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nomeInput = page.locator('input[required]').first();
    this.whatsappInput = page.locator('input[placeholder*="WhatsApp" i], input[value*="WhatsApp" i]').first();
    this.headlineTituloInput = page.locator('input[placeholder*="Sabor Excelente" i], input[placeholder*="Tecnologia" i]').first();
    this.headlineSubtituloInput = page.locator('input[placeholder*="Escolha os melhores" i], input[placeholder*="Soluções completas" i]').first();
    this.suggestHeadlineButton = page.locator('button:has-text("Sugerir para")').first();
    this.temEspacoFisicoToggle = page.locator('input[type="checkbox"]').first();
    this.enderecoInput = page.locator('input[placeholder*="Boa Viagem" i], input[placeholder*="Endereço" i]').first();
    this.generateMapsLinkButton = page.locator('button:has-text("Gerar link a partir do endereço")').first();
    this.saveButton = page.locator('button:has-text("Salvar Alterações"), button:has-text("Salvar")').first();
    this.passwordModal = page.locator('div.fixed:has-text("Alterar Senha de Acesso")');
  }

  async openPasswordModal() {
    const trigger = this.page.locator('button:has-text("Trocar Senha"), input[placeholder="Clique para alterar sua senha"]').first();
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click({ force: true });
    await this.page.getByText('Alterar Senha de Acesso').waitFor({ state: 'visible', timeout: 10000 });
  }

  async changePassword(atual: string, nova: string, confirmar: string) {
    const modal = this.page.locator('div.fixed:has-text("Alterar Senha de Acesso")');
    await modal.locator('input[placeholder="Digite sua senha atual"]').fill(atual);
    await modal.locator('input[placeholder="Mínimo 4 caracteres"]').fill(nova);
    await modal.locator('input[placeholder="Repita a nova senha"]').fill(confirmar);
    await modal.getByRole('button', { name: /Verificar e Alterar/i }).click();
  }
}
