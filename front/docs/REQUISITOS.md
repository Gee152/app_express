# Documento de Especificação de Requisitos de Software (SRS)
## Catálogo Express

> **Versão:** 1.0.0  
> **Status:** Aprovado / Baseline  
> **Arquitetura:** 100% Front-end (Local-First / Serverless / PWA)  
> **Foco:** Alta Performance, Baixo Custo Operacional e Otimização para Conversão Mobile.

---

## 1. Visão Geral do Produto

O **Catálogo Express** é uma plataforma SPA (*Single Page Application*) local-first e multi-tenant desenvolvida em React 19 + TypeScript + Vite + Tailwind CSS. O sistema permite criar e gerenciar múltiplos catálogos digitais, cardápios interativos e vitrines de produtos sem necessidade de infraestrutura backend ou banco de dados em nuvem, direcionando os pedidos estruturados diretamente ao WhatsApp do comerciante.

### 1.1 Objetivos de Negócio
- **Custo Operacional Zero:** Eliminar mensalidades e custos com servidores através de hospedagem estática (ex.: GitHub Pages, Vercel, Netlify).
- **Independência Tecnológica:** Permitir que o gestor (Super Admin) administre até 50 lojas diretamente no navegador via IndexedDB.
- **Conversão e Fluidez Mobile:** Proporcionar carregamento quase instantâneo (< 1.5s) e UX de aplicativo nativo (PWA instalável).

---

## 2. Personas e Atores do Sistema

| Ator | Descrição | Ambiente Principal |
|---|---|---|
| **Super Administrador (Gestor/Agência)** | Cria novas lojas, define nichos, customiza temas, cadastra produtos e gera os arquivos JSON de publicação. | Desktop / Tablet (Painel Admin) |
| **Lojista / Comerciante** | Visualiza e gerencia seus produtos, recebe pedidos formatados no WhatsApp e gerencia histórico local. | Mobile / Desktop |
| **Cliente Final (Consumidor)** | Acessa o link da vitrine (`?loja=slug`), navega por categorias, seleciona adicionais/opcionais, monta o carrinho e envia o pedido via WhatsApp. | Mobile (Smartphone) |

---

## 3. Requisitos Funcionais (RF)

### 3.1 Onboarding & Criação de Lojas
- **RF-001 (Wizard de Onboarding):** O sistema deve fornecer um fluxo guiado em 4 passos para novas lojas:
  1. Escolha do Nicho (9 nichos pré-configurados: Hamburgueria, Pizzaria, Moda, etc.);
  2. Dados da Empresa (Nome, WhatsApp, Endereço, Horários, Chave PIX, Redes Sociais);
  3. Identidade Visual (Tema, cores primária/secundária, banner e logotipo);
  4. Produtos Iniciais e Revisão.
- **RF-002 (Geração de Slug):** O sistema deve gerar automaticamente um identificador único (*slug* em kebab-case) a partir do nome da loja.

### 3.2 Gestão Multi-Tenant (Super Admin)
- **RF-003 (Gerenciador de Lojas):** O Super Admin deve permitir listar, criar, alternar, editar, exportar (backup) e excluir lojas armazenadas no IndexedDB local.
- **RF-004 (Publicação Estática JSON):** O sistema deve permitir gerar e baixar o arquivo de manifesto de publicação `public/lojas/<slug>.json` para deploy estático unificado.

### 3.3 Gestão de Cardápio & Produtos
- **RF-005 (CRUD de Categorias):** Criar, editar, ordenar e excluir categorias de produtos com suporte a ícones.
- **RF-006 (CRUD de Produtos):** Cadastrar produtos com nome, descrição, categoria, preço base, destaque, status (ativo/inativo) e imagens.
- **RF-007 (Grupos de Opcionais/Variações):** Permitir inclusão de opcionais com escolha única (ex.: Ponto da Carne, Tamanho) ou múltipla (ex.: Adicionais, Molhos) com acréscimo de preço por item.
- **RF-008 (Links Externos):** Suportar redirecionamento direto para marketplaces (Shopee, Mercado Livre, Amazon) quando aplicável ao nicho.

### 3.4 Vitrine Pública & Catálogo Digital
- **RF-009 (Roteamento Dinâmico por URL):** A vitrine pública deve carregar a loja especificada pelo parâmetro `?loja=<slug>` ou pelo arquivo JSON correspondente.
- **RF-010 (Busca e Filtro Rápido):** Busca instantânea por texto e filtro por categorias com rolagem suave (*smooth scroll* / abas fixas).
- **RF-011 (Banners Promocionais & Carrossel):** Exibição de banner de destaque ou slider com rotação configurável, badges de desconto e redirecionamento direto ao produto.
- **RF-012 (Modal de Detalhes do Produto):** Exibir fotos em alta resolução, descrições ricas, seleção interativa de complementos e cálculo de subtotal em tempo real.

### 3.5 Carrinho & Checkout WhatsApp
- **RF-013 (Carrinho Drawer):** Gaveta lateral/inferior de carrinho com controle de quantidade, lista de complementos selecionados e valor total dinâmico.
- **RF-014 (Dados de Entrega):** Coleta de tipo de pedido (Entrega vs. Retirada), endereço completo, bairro, ponto de referência e observações.
- **RF-015 (Forma de Pagamento & Troco):** Opções de pagamento (PIX com chave exibida, Cartão, Dinheiro com campo de troco).
- **RF-016 (Geração do Link WhatsApp):** Formatação automática e codificada (URI Component) da mensagem detalhada do pedido, abrindo o WhatsApp do comerciante em 1 clique.
- **RF-017 (Histórico Local de Pedidos):** Registro dos pedidos realizados no IndexedDB do cliente/admin com status (Novo / Concluído).

### 3.6 PWA & Experiência Offline
- **RF-018 (Instalação PWA):** Exibição de prompt/modal customizado de instalação do aplicativo em dispositivos Android/iOS/Desktop.
- **RF-019 (Operação Offline):** Service Worker para cache estático de assets da aplicação e catálogo visualizado previamente.

---

## 4. Requisitos Não-Funcionais (RNF) & Otimização de Performance

### 4.1 Metas de Core Web Vitals (Performance Budget)

| Métrica | Meta Alvo | Limite Crítico | Mecanismo de Garantia |
|---|---|---|---|
| **LCP (Largest Contentful Paint)** | **< 1.2s** (Mobile 4G) | < 2.5s | Pré-otimização WebP de banners, fontes do sistema ou Google Fonts pré-conectadas, Critical CSS inlined. |
| **INP (Interaction to Next Paint)** | **< 80ms** | < 200ms | Estado desmembrado, ausência de re-renders no input de busca, memoização de listas de produtos (`useMemo`, `React.memo`). |
| **CLS (Cumulative Layout Shift)** | **0.00** | < 0.10 | *Aspect-ratio* explícito em todas as tags `<img>`, placeholders com skeleton loaders e altura fixa em sliders. |
| **FCP (First Contentful Paint)** | **< 0.8s** | < 1.8s | Bundle JS compacto, compressão Brotli/Gzip na CDN, zero dependência de chamada de rede bloqueante. |
| **TTI (Time to Interactive)** | **< 1.5s** | < 3.0s | Code-splitting e carregamento preguiçoso (*lazy loading*) de componentes administrativos pesados. |

### 4.2 Pipeline de Imagens & Otimização de Mídia (RNF-P01)
- **Compressão Client-Side Automática:** Todas as imagens enviadas no painel devem passar por um pipeline de canvas no cliente:
  - Formato de saída: **WebP** com fallback automático.
  - Imagem Principal: Máximo de `800x800px` com qualidade ~80% (tamanho alvo < 70KB).
  - Thumbnail: Máximo de `200x200px` (tamanho alvo < 15KB).
  - Lazy Loading nativo (`loading="lazy"`) e `decoding="async"` em todas as vitrines.

### 4.3 Orçamento de Pacote (Bundle Size Limits - RNF-P02)
- **Tamanho Máximo do Bundle Inicial (Gzip/Brotli):** `<= 180 KB`.
- **Separação de Módulos (Code Splitting):**
  - Chunk Público (Cliente final): Leve e enxuto.
  - Chunk Admin / Rich Text / Gerenciador: Carregado sob demanda via `React.lazy()` / importações dinâmicas.

### 4.4 Eficiência de Banco de Dados & Armazenamento Local (RNF-P03)
- **IndexedDB via Dexie.js:**
  - Índices otimizados nas tabelas `lojas` e `pedidos`.
  - Operações de leitura assíncronas com tratamento de fallback para `public/lojas/<slug>.json` quando aberto via URL pública sem banco local.
  - Capacidade de armazenamento no navegador de até 50 lojas com catálogos médios (50-200 itens cada).

### 4.5 Compatibilidade & Responsividade (RNF-P04)
- **Mobile First:** Interface 100% responsiva (breakpoints: 320px, 375px, 414px, 768px, 1024px, 1280px+).
- **Compatibilidade de Navegadores:** Chrome/Chromium >= 90, Safari iOS >= 14, Firefox >= 90, Edge >= 90.

---

## 5. Regras de Negócio (RN)

- **RN-01 (Isolamento de Tenants):** Uma loja nunca deve sobrepor dados de outra no IndexedDB. A alteração da loja ativa deve isolar completamente o contexto de produtos, categorias e pedidos.
- **RN-02 (Cálculo de Preços):** O preço final do item no carrinho é calculado por:  
  $$\text{Preço Final} = (\text{Preço Base} + \sum \text{Opcionais Selecionados}) \times \text{Quantidade}$$
- **RN-03 (Validação de Pedido Mínimo / WhatsApp):** Não é permitido finalizar checkout caso o número de WhatsApp da empresa esteja vazio ou inválido.
- **RN-04 (Persistência de Publicação):** O arquivo JSON exportado deve conter a estrutura íntegra `ExportData` (`empresa`, `categorias`, `produtos`, `config`), permitindo renderização estática independente do banco local.

---

## 6. Matriz de Rastreabilidade de Requisitos

| ID Requisito | Funcionalidade | Componente Técnico | Teste Automatizado / Validação |
|---|---|---|---|
| **RF-001** | Wizard Onboarding | `src/components/onboarding/*` | E2E Playwright: Onboarding flow |
| **RF-003** | Gerenciador Multi-Loja | `src/components/admin/StoreManager.tsx` | E2E Playwright: Store creation/switch |
| **RF-006** | Gestão de Produtos | `src/components/admin/ProductManager.tsx` | E2E Playwright: Add/Edit Product |
| **RF-009** | Vitrine Pública por Slug | `src/components/public/PublicCatalog.tsx` | E2E Playwright: Public View Navigation |
| **RF-013 / RF-016** | Carrinho & Checkout WhatsApp | `src/components/public/CartDrawer.tsx` | E2E Playwright: Cart calculation & WhatsApp URI format |
| **RNF-P01** | Pipeline Imagens WebP | `src/utils/imagePipeline.ts` | Unit Test: Compression & Dimensions limit |
| **RNF-P02** | Bundle Size < 180KB | `vite.config.ts` | Build check & Vite chunk report |
| **RNF-P04** | PWA & Offline Cache | `public/sw.js`, `usePWA.ts` | Lighthouse Audit PWA |

---

## 7. Critérios de Aceite Gerais (Definition of Done)

1. **Lighthouse Score:** Mínimo de 90+ em Performance, Acessibilidade, Boas Práticas e SEO em ambiente de produção.
2. **Build sem Erros:** `npm run lint` (TypeScript) e `npm run build` executados com zero erros e zero avisos bloqueantes.
3. **Testes E2E Automatizados:** Todos os fluxos críticos de navegação, carrinho e painel admin validados via Playwright (`npm run test:e2e`).
4. **Sem Fugas de Memória:** Event listeners e timers devidamente desacoplados no desmonte dos componentes React.
