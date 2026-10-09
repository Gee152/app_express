import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model para o Gerenciador de Produtos e Categorias (Admin)
 */
export class ProductManagerPage {
  readonly page: Page;
  readonly novoProdutoBtn: Locator;
  readonly produtosTab: Locator;
  readonly categoriasTab: Locator;
  readonly nomeInput: Locator;
  readonly precoInput: Locator;
  readonly linkExternoInput: Locator;
  readonly plataformaSelect: Locator;
  readonly salvarBtn: Locator;
  readonly novaCategoriaInput: Locator;
  readonly adicionarCategoriaBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.produtosTab = page.locator('button:has-text("Produtos"), button:has-text("Itens")').first();
    this.categoriasTab = page.locator('button:has-text("Categorias")').first();
    this.novoProdutoBtn = page.locator('button:has-text("Novo Produto"), button:has-text("+ Produto")').first();
    this.nomeInput = page.locator('input[placeholder*="Ex: Burger" i], input[placeholder*="Nome do produto" i]').first();
    this.precoInput = page.locator('input[placeholder*="0,00" i], input[type="number"]').first();
    this.linkExternoInput = page.locator('input[placeholder*="https://" i], input[placeholder*="shopee" i]').first();
    this.plataformaSelect = page.locator('select').first();
    this.salvarBtn = page.locator('button:has-text("Salvar"), button:has-text("Cadastrar Produto")').first();
    this.novaCategoriaInput = page.locator('input[placeholder*="Nova categoria" i], input[placeholder*="Nome da categoria" i]').first();
    this.adicionarCategoriaBtn = page.locator('button:has-text("Adicionar Categoria"), button:has-text("+ Adicionar")').first();
  }

  async cadastrarProduto(nome: string, preco: string, linkMarketplace?: string) {
    await this.novoProdutoBtn.click();
    await this.nomeInput.fill(nome);
    await this.precoInput.fill(preco);
    
    if (linkMarketplace && await this.linkExternoInput.isVisible()) {
      await this.linkExternoInput.fill(linkMarketplace);
    }
    
    await this.salvarBtn.click();
  }

  async criarCategoria(nome: string) {
    if (await this.categoriasTab.isVisible()) {
      await this.categoriasTab.click();
      if (await this.novaCategoriaInput.isVisible()) {
        await this.novaCategoriaInput.fill(nome);
        await this.adicionarCategoriaBtn.click();
      }
    }
  }
}
