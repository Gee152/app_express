import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model para a tela de Pedidos, Relógio de Status e Esteira
 */
export class PedidosPage {
  readonly page: Page;
  readonly relogioGauge: Locator;
  readonly contadorEsteira: Locator;
  readonly filtroEsteiraBtn: Locator;
  readonly filtroTodosBtn: Locator;
  readonly filtroHojeBtn: Locator;
  readonly filtroMesBtn: Locator;
  readonly searchInput: Locator;
  readonly exportarBtn: Locator;
  readonly voltarPainelBtn: Locator;
  readonly toggleThemeBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.relogioGauge = page.locator('svg circle').first();
    this.contadorEsteira = page.locator('span:has-text("Na Esteira")');
    this.filtroEsteiraBtn = page.locator('button:has-text("Na Esteira")');
    this.filtroTodosBtn = page.locator('button:has-text("Todos")');
    this.filtroHojeBtn = page.locator('button:has-text("Hoje")');
    this.filtroMesBtn = page.locator('button:has-text("Este Mês")');
    this.searchInput = page.locator('input[placeholder*="Buscar cliente" i]');
    this.exportarBtn = page.locator('button:has-text("Exportar")');
    this.voltarPainelBtn = page.locator('button:has-text("Painel")');
    this.toggleThemeBtn = page.locator('button[title*="Modo" i]').first();
  }

  async gotoPedidos() {
    // Acessa a rota ou clica em Pedidos no AdminDashboard
    const pedidosNav = this.page.locator('button:has-text("Pedidos"), a:has-text("Pedidos")').first();
    if (await pedidosNav.isVisible()) {
      await pedidosNav.click();
    }
  }

  async alternarEtapaPedido(pedidoIdx: number, etapaNome: string) {
    const card = this.page.locator('div[class*="rounded-2xl"]:has-text("Pedido #")').nth(pedidoIdx);
    const etapaBtn = card.locator(`button:has-text("${etapaNome}")`);
    await etapaBtn.click();
  }
}
