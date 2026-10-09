import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model para a Vitrine Pública do Cliente Final
 */
export class PublicCatalogPage {
  readonly page: Page;
  readonly storeTitle: Locator;
  readonly bannerAddressBadge: Locator;
  readonly headlineTitle: Locator;
  readonly headlineSubtitle: Locator;
  readonly physicalStoreCard: Locator;
  readonly openMapsButton: Locator;
  readonly openWazeButton: Locator;
  readonly mapsIframe: Locator;
  readonly cartButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.storeTitle = page.locator('h1').first();
    this.bannerAddressBadge = page.locator('a[title*="Google Maps" i]').first();
    this.headlineTitle = page.locator('h2').first();
    this.headlineSubtitle = page.locator('h2 + p').first();
    this.physicalStoreCard = page.locator('div:has-text("Nosso Espaço Físico & Localização")');
    this.openMapsButton = page.locator('a:has-text("Abrir no Google Maps")');
    this.openWazeButton = page.locator('a:has-text("Waze")');
    this.mapsIframe = page.locator('iframe[title*="Localização no Google Maps" i]');
    this.cartButton = page.locator('button:has-text("Pedido"), button:has-text("Ver Pedido")').first();
  }

  async gotoStore(slug: string) {
    await this.page.goto(`/?loja=${slug}`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForSelector('text=Carregando vitrine...', { state: 'detached', timeout: 15000 }).catch(() => {});
  }

  async addFirstProductToCart() {
    const orderButton = this.page.locator('button:has-text("+ Pedir"), button:has-text("Pedir")').first();
    if (await orderButton.isVisible()) {
      await orderButton.click();
    }
  }
}
