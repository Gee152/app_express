# 📘 Manual de Estudo & Onboarding: Frontend & QA — Catálogo Express

> **Papel:** Instrutor Sênior de Programação & Lead QA Architect  
> **Público-Alvo:** Desenvolvedores Frontend, Engenheiros de Software, Analistas de QA e Novos Integrantes do Time.  
> **Objetivo:** Fornecer um guia didático e aprofundado para compreender 100% da arquitetura frontend, do gerenciamento de estado e da suíte de qualidade/testes do projeto **Catálogo Express**.

---

## 🗺️ 1. Trilha de Aprendizagem & Mapa Mental

```
┌─────────────────────────────────────────────────────────────┐
│               MÓDULO 1: FUNDAMENTOS & STACK                 │
│  React 19 • TypeScript 5.8 • Vite 6 • Tailwind CSS v4       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│          MÓDULO 2: ARQUITETURA DE ESTADO & DADOS            │
│  CatalogContext (Single Source of Truth) • State-Driven SPA │
│  Dexie.js (Persistência Reativa Offline-First com IndexedDB)│
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│          MÓDULO 3: MÓDULOS DE UI & FLUXOS DE NEGÓCIO        │
│  Vitrine Pública • CartDrawer • Admin • Esteira de Pedidos   │
│  Editor Lexical (Rich Text) • Sistema Dinâmico de Temas     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│            MÓDULO 4: QA & ENGENHARIA DE TESTES              │
│  BDD (Gherkin) • Page Object Model (POM) • Playwright E2E   │
│  Execução / Debug Interativo • CI/CD via GitHub Actions     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│            MÓDULO 5: ROTEIRO PRÁTICO DE FIXAÇÃO             │
│  Desafios Práticos com Critérios de Aceite para 5 Dias      │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ 2. Módulo 1: Fundamentos, Ferramentas & Configuração

### 2.1 Stack Tecnológica
* **React 19 (`react`, `react-dom`):** Utilização das mais recentes convenções do React, priorizando componentes funcionais e hooks nativos.
* **TypeScript 5.8 (`typescript`):** Tipagem estrita com contratos de domínio centralizados em [`src/types.ts`](file:///src/types.ts).
* **Vite 6 (`vite`):** Bundler ultrarrápido com Hot Module Replacement (HMR) e servidor local configurado para porta `3000`.
* **Tailwind CSS v4 (`@tailwindcss/vite`):** Motor de estilização atômica baseado em tokens CSS nativos e suporte à classe `.dark`.
* **Lucide React (`lucide-react`):** Biblioteca padrão de ícones semânticos.
* **Lexical (`lexical`, `@lexical/react`):** Framework moderno e extensível de Rich Text / WYSIWYG da Meta.

### 2.2 Estrutura de Diretórios
```
catálogo-express/
├── docs/                 # Documentações de arquitetura, requisitos e manuais
├── public/               # Ativos estáticos, manifest PWA e snapshots de lojas
├── src/
│   ├── components/       # Componentes divididos por domínio funcional
│   │   ├── admin/        # Telas administrativas (Lojas, Produtos, Pedidos, Temas)
│   │   ├── auth/         # Autenticação (LoginScreen, CadastroScreen)
│   │   ├── onboarding/   # Wizard de primeiro acesso (?acesso=slug)
│   │   ├── public/       # Vitrine pública do cliente (Catálogo, Carrinho, Modais)
│   │   ├── pwa/          # Componentes de suporte a Progressive Web App
│   │   └── ui/           # Componentes atômicos reutilizáveis
│   ├── context/          # Provedores de estado global (CatalogContext)
│   ├── data/             # Dados e presets padrão
│   ├── db/               # Camada de banco de dados do cliente (Dexie/IndexedDB)
│   ├── hooks/            # Hooks customizados reutilizáveis
│   ├── utils/            # Utilitários puros (formatadores, helpers de imagem)
│   ├── types.ts          # Contratos TypeScript globais
│   ├── App.tsx           # Roteamento condicional e Suspense/Code-splitting
│   └── main.tsx          # Ponto de entrada e montagem do DOM
├── tests/                # Suíte de automação QA (Playwright, BDD, POM)
├── playwright.config.ts  # Configuração de navegadores e viewport de testes
└── package.json          # Dependências e scripts de execução
```

### 2.3 Code-Splitting com `React.lazy` e `Suspense`
No arquivo [`src/App.tsx`](file:///src/App.tsx), as telas são importadas dinamicamente para garantir que o cliente baixe apenas os bytes necessários para a visualização atual:

```tsx
const AdminDashboard = lazy(() =>
  import('./components/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const PublicCatalog = lazy(() =>
  import('./components/public/PublicCatalog').then((m) => ({ default: m.PublicCatalog }))
);
```

---

## 🧠 3. Módulo 2: Arquitetura, Gerenciamento de Estado & Dados

### 3.1 O Provedor Central: `CatalogContext`
Toda a lógica reativa do sistema reside em [`src/context/CatalogContext.tsx`](file:///src/context/CatalogContext.tsx).

#### Principais Estados Gerenciados:
1. **Roteamento Interno (`activeView`):**
   * `'public'`: Vitrine pública de produtos.
   * `'admin'`: Painel do lojista (produtos, empresa, pedidos).
   * `'storemanager'`: Super Admin (gestão global de todas as lojas).
   * `'pedidos'`: Painel de esteira de pedidos (Kanban & Relógio de Status).
   * `'login'` / `'cadastro'` / `'onboarding'`: Fluxos de acesso e primeiro cadastro.
2. **Autenticação Multi-Tenant:**
   * `isSuperAdmin`: Flag booleana para administradores da plataforma.
   * `isClienteLogado`: Flag para lojistas gerenciando seu próprio catálogo.
   * `activeTenant`: Identificador da loja em contexto ativo.
3. **Carrinho de Compras:**
   * Lista de itens selecionados, adicionais vinculados, quantidades e cálculo reativo de subtotal e total.

### 3.2 Camada de Dados Offline-First: `Dexie.js` (IndexedDB)
Em vez de depender obrigatoriamente de um backend tradicional para testes e operação local, o sistema implementa uma camada reativa no navegador via [`src/db/db.ts`](file:///src/db/db.ts):

* **Tabelas do Banco Local:**
  * `empresas`: Dados institucionais, endereço, WhatsApp, logo e configurações.
  * `produtos`: Catálogo, preços, fotos (Base64/WebP), adicionais e status.
  * `categorias`: Categorização dinâmica com ordenação.
  * `pedidos`: Histórico de vendas com estágios da esteira e timestamps.
  * `temas`: Esquemas de cores e estilos visuais salvos.

---

## 💻 4. Módulo 3: Anatomia das Interfaces e Componentes

### 4.1 Vitrine Pública (`src/components/public/`)
* [`PublicCatalog.tsx`](file:///src/components/public/PublicCatalog.tsx): Renderiza os produtos com busca instantânea, carrossel de categorias, banners promocionais e botão flutuante do carrinho.
* [`CartDrawer.tsx`](file:///src/components/public/CartDrawer.tsx): Gaveta deslizante onde o cliente seleciona método de entrega (Delivery/Retirada), forma de pagamento e gera o link formatado para envio direto ao WhatsApp da loja.
* [`ProductDetailModal.tsx`](file:///src/components/public/ProductDetailModal.tsx): Modal com seleção de adicionais (ex.: borda recheada, molho extra), observações e controle de quantidade.

### 4.2 Painel Administrativo (`src/components/admin/`)
* [`AdminDashboard.tsx`](file:///src/components/admin/AdminDashboard.tsx): Hub central de navegação rápida com cards de métricas e status da loja.
* [`ProductManager.tsx`](file:///src/components/admin/ProductManager.tsx): Cadastro e edição completa de produtos, precificação e links para Marketplaces (iFood, Mercado Livre, Shopee).
* [`PedidosView.tsx`](file:///src/components/admin/PedidosView.tsx): Esteira operacional com 4 etapas:
  1. **Recebido**
  2. **Em Preparo**
  3. **Pronto / Saiu para Entrega**
  4. **Entregue / Concluído**
  * **Destaque Visual:** *Relógio de Status Circular* com temporizador visual do tempo decorrido desde a abertura do pedido.
* [`CompanyEditor.tsx`](file:///src/components/admin/CompanyEditor.tsx): Customização dos dados da loja, integração com Google Maps e editor de texto rico com **Lexical Editor**.

---

## 🧪 5. Módulo 4: Especialização em QA & Engenharia de Testes

> Como QA, seu foco no Catálogo Express é garantir que os fluxos críticos de negócio jamais sofram regressão.

### 5.1 Estrutura do Framework de Testes
A suíte segue a tríade de ouro da automação moderna:

```
tests/
├── features/        # Regras de Negócio em formato BDD / Gherkin
│   ├── 01_autenticacao_e_acesso.feature
│   ├── 02_gestao_lojas_superadmin.feature
│   ├── 03_perfil_empresa_e_localizacao.feature
│   ├── 04_catalogo_produtos_e_marketplaces.feature
│   └── 05_vitrine_publica_e_checkout.feature
├── pages/           # Page Object Model (POM) — Encapsulamento de UI
│   ├── LoginPage.ts
│   ├── SuperAdminPage.ts
│   ├── CompanyEditorPage.ts
│   ├── PublicCatalogPage.ts
│   ├── ProductManagerPage.ts
│   └── PedidosPage.ts
└── e2e/             # Suítes de Automação Playwright (TypeScript)
    ├── auth-and-access.spec.ts
    ├── superadmin-stores.spec.ts
    ├── company-and-location.spec.ts
    ├── public-catalog-and-checkout.spec.ts
    ├── products-and-marketplaces.spec.ts
    ├── orders-and-status-clock.spec.ts
    ├── dark-mode.spec.ts
    └── onboarding-wizard.spec.ts
```

### 5.2 Boas Práticas Obrigatórias de QA

#### 1. Sempre Utilize o Padrão Page Object Model (POM)
Nunca insira seletores (`locator('button.btn-primary')`) diretamente nos arquivos `.spec.ts`. Crie métodos de alto nível nos Page Objects correspondentes em `tests/pages/`:

```typescript
// ✅ CORRETO (Dentro do Page Object):
export class ProductManagerPage {
  readonly page: Page;
  constructor(page: Page) { this.page = page; }
  
  async cadastrarProduto(nome: string, preco: string) {
    await this.page.getByRole('button', { name: /novo produto/i }).click();
    await this.page.getByLabel(/nome do produto/i).fill(nome);
    await this.page.getByLabel(/preço/i).fill(preco);
    await this.page.getByRole('button', { name: /salvar/i }).click();
  }
}
```

#### 2. Priorize Seletores Acessíveis (User-Facing Locators)
* Use `getByRole()`, `getByLabel()`, `getByPlaceholder()` e `getByText()`.
* Evite seletores frágeis baseados em estrutura interna de tags (ex.: `div > div:nth-child(2) > span`).

### 5.3 Comandos de Execução dos Testes

| Comando | Descrição |
|---|---|
| `npm run test:e2e` | Executa todos os testes E2E em modo headless (rápido para terminal). |
| `npm run test:e2e:ui` | Abre o **Playwright UI Mode** interativo (Time Travel, DOM Snapshot e Inspector). |
| `npm run test:e2e:headed` | Executa os testes abrindo as janelas reais do navegador. |
| `npm run test:e2e:report` | Abre o relatório visual HTML com logs e capturas de tela. |

---

## 🎯 6. Módulo 5: Trilha Prática de Exercícios (5 Dias)

Siga este cronograma prático para solidificar o conhecimento:

### 🟢 Dia 1: Setup & Exploração do Ecossistema
* **Objetivo:** Clonar, rodar e inspecionar a interface e os testes.
* **Passos:**
  1. Execute `npm install` e `npm run dev`.
  2. Acesse `http://localhost:3000` e navegue pelas telas pública, login e super admin.
  3. Execute `npm run test:e2e:ui` e veja a suíte rodando passo a passo.

### 🟡 Dia 2: Rastreando o Fluxo de Dados do Carrinho
* **Objetivo:** Compreender a reatividade de ponta a ponta.
* **Passos:**
  1. Abra [`src/components/public/PublicCatalog.tsx`](file:///src/components/public/PublicCatalog.tsx) e siga a função de clique para adicionar um item.
  2. Inspecione como o [`src/context/CatalogContext.tsx`](file:///src/context/CatalogContext.tsx) calcula adicionais e total.
  3. Verifique como a mensagem de WhatsApp é construída no [`src/components/public/CartDrawer.tsx`](file:///src/components/public/CartDrawer.tsx).

### 🟠 Dia 3: Persistência Local & Esteira de Pedidos
* **Objetivo:** Dominar a camada Dexie/IndexedDB e o Relógio de Status.
* **Passos:**
  1. Crie um novo pedido pela vitrine pública.
  2. Acesse a tela de Pedidos (`PedidosView.tsx`).
  3. Mude as etapas do pedido e observe a atualização visual do temporizador e do status.

### 🔴 Dia 4: Escrevendo um Novo Cenário de Teste Automatizado
* **Objetivo:** Praticar como Engenheiro de QA no projeto.
* **Passos:**
  1. Crie um novo cenário BDD em `tests/features/04_catalogo_produtos_e_marketplaces.feature` para testar a inativação de um produto.
  2. Adicione os métodos necessários em [`tests/pages/ProductManagerPage.ts`](file:///tests/pages/ProductManagerPage.ts).
  3. Implemente o teste no arquivo `tests/e2e/products-and-marketplaces.spec.ts` e valide com `npm run test:e2e`.

### 🟣 Dia 5: Manutenção de Tema & Dark Mode
* **Objetivo:** Compreender o sistema de estilização e classes do Tailwind.
* **Passos:**
  1. Analise o componente [`src/components/admin/ThemeManager.tsx`](file:///src/components/admin/ThemeManager.tsx) e [`src/components/admin/CustomPaletteManager.tsx`](file:///src/components/admin/CustomPaletteManager.tsx).
  2. Teste a alternância da classe `.dark` e verifique como a suíte `tests/e2e/dark-mode.spec.ts` assegura essa funcionalidade.

---

## ❓ 7. Perguntas Frequentes & Troubleshooting (FAQ)

### P1: O que fazer se os testes do Playwright falharem por timeout no carregamento?
**Solução:** Verifique se o servidor de desenvolvimento está rodando ou permita que o Playwright inicie o servidor automaticamente através da propriedade `webServer` no [`playwright.config.ts`](file:///playwright.config.ts).

### P2: Como os dados persistem se eu recarregar a página?
**Solução:** O `CatalogContext` sincroniza todas as mutações no banco IndexedDB do navegador via `db.ts`. Para resetar o estado para testes limpos, utilize a limpeza do banco local via DevTools (`Application > Storage > IndexedDB`).

### P3: Onde encontro as regras de negócio detalhadas de cada funcionalidade?
**Solução:** Consulte os arquivos de especificação em `tests/features/` e os documentos em `docs/REQUISITOS.md` e `docs/TREINAMENTO.md`.
