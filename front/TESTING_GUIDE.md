# 🧪 Guia de Testes Automatizados & CI/CD — Catálogo Express

> Arquitetura de qualidade com **BDD (Gherkin)**, automação ponta a ponta com **Playwright**, padrão **Page Object Model (POM)** e integração contínua via **GitHub Actions**.

---

## 📌 1. Visão Geral da Estrutura de QA

A suíte de testes foi construída para validar os fluxos críticos de ponta a ponta (E2E), garantindo a confiabilidade de toda a aplicação multi-tenant:

```
catálogo-express/
├── .github/
│   └── workflows/
│       └── e2e-tests.yml        # Pipeline de CI/CD para GitHub Actions
├── playwright.config.ts         # Configurações do Playwright (Multi-browser/Mobile)
├── tests/
│   ├── features/                # Especificações BDD / Gherkin (Regras de Negócio)
│   │   ├── 01_autenticacao_e_acesso.feature
│   │   ├── 02_gestao_lojas_superadmin.feature
│   │   ├── 03_perfil_empresa_e_localizacao.feature
│   │   ├── 04_catalogo_produtos_e_marketplaces.feature
│   │   └── 05_vitrine_publica_e_checkout.feature
│   ├── pages/                   # Page Object Model (POM)
│   │   ├── LoginPage.ts
│   │   ├── SuperAdminPage.ts
│   │   ├── CompanyEditorPage.ts
│   │   ├── PublicCatalogPage.ts
│   │   ├── ProductManagerPage.ts
│   │   └── PedidosPage.ts
│   └── e2e/                     # Suítes de Testes Automatizados em TypeScript
│       ├── auth-and-access.spec.ts
│       ├── superadmin-stores.spec.ts
│       ├── company-and-location.spec.ts
│       ├── public-catalog-and-checkout.spec.ts
│       ├── products-and-marketplaces.spec.ts
│       ├── orders-and-status-clock.spec.ts
│       ├── dark-mode.spec.ts
│       └── onboarding-wizard.spec.ts
```

---

## 📋 2. Cenários BDD & Suítes Cobertas

| Arquivo de Teste E2E | Domínio / Funcionalidade | Principais Cenários Cobertos |
|---|---|---|
| `auth-and-access.spec.ts` | Autenticação & Acesso | Login Super Admin, bloqueio com credenciais inválidas, proteção de rotas. |
| `superadmin-stores.spec.ts` | Gestão de Lojas | Criação de lojas, revelação/ocultação de senha (olhinho), status de publicação. |
| `company-and-location.spec.ts` | Perfil & Localização | Customização de Headline, Espaço Físico, Google Maps e modal de troca de senha. |
| `public-catalog-and-checkout.spec.ts` | Vitrine Pública | Carregamento da vitrine, adição ao carrinho e visualização de localização. |
| `products-and-marketplaces.spec.ts` | Produtos & Categorias | Listagem de produtos, modal de cadastro com adicionais, criação e gestão de categorias. |
| `orders-and-status-clock.spec.ts` | Pedidos & Esteira | Relógio de Status circular, esteira de 4 etapas, filtros rápidos e exportação WhatsApp. |
| `dark-mode.spec.ts` | Tema Global | Alternância do botão Sol/Lua e aplicação da classe `.dark`. |
| `onboarding-wizard.spec.ts` | Onboarding | Acesso via link exclusivo `?acesso=` e validação de primeiro cadastro. |

---

## 🚀 3. Como Executar os Testes Localmente

### 3.1 Instalar os Browsers do Playwright (Primeira Execução)
```bash
npx playwright install --with-deps chromium
```

### 3.2 Executar Todos os Testes E2E (Modo Headless)
```bash
npm run test:e2e
```

### 3.3 Executar no Modo Interativo com Interface Gráfica (UI Mode)
Permite visualizar a execução passo a passo no navegador, pausar, inspecionar elementos e debugar:
```bash
npm run test:e2e:ui
```

### 3.4 Executar com o Navegador Visível (Headed Mode)
```bash
npm run test:e2e:headed
```

### 3.5 Visualizar Relatório HTML dos Testes
```bash
npm run test:e2e:report
```

---

## 🔄 4. Integração Contínua (CI/CD) no GitHub Actions

O arquivo `.github/workflows/e2e-tests.yml` executa a validação automática a cada:
1. **Push** para as branches `main` ou `master`.
2. **Pull Request** direcionado para `main` ou `master`.
3. Disparo manual via botão **Run workflow** no painel do GitHub Actions.

### Etapas da Pipeline:
- 🟢 **Setup Node.js 20** com cache automático de dependências.
- 📦 **Instalação Limpa** (`npm ci`).
- 🎭 **Instalação dos Browsers do Playwright**.
- 🛠️ **TypeCheck e Validação Estática** (`npm run lint`).
- 🧪 **Execução dos Testes E2E**.
- 📊 **Upload de Artefatos**: Relatório HTML e Traces/Vídeos salvos por 30 dias em caso de falhas.

---

## 🎯 5. Boas Práticas Adotadas

1. **Page Object Model (POM):** Todo seletor e interação de tela fica encapsulado em classes reutilizáveis na pasta `tests/pages/`.
2. **Isolamento de Estado:** Os testes utilizam o IndexedDB (Dexie) de forma independente sem interferir em dados de produção.
3. **Auto-Wait Determinístico:** Sem uso de `sleep()` fixo; os testes utilizam auto-wait nativo do Playwright para garantir estabilidade e eliminar *flakiness*.
