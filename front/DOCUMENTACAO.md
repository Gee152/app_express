# Documentação — Catálogo Express

> Plataforma **100% front-end** para criar catálogos digitais, cardápios e vitrines de produtos, com pedidos direcionados ao WhatsApp. **Multi-tenant (até 50 lojas em um único navegador), sem fluxo ZIP, sem backend e sem mensalidade**, com **um único deploy PWA + GitHub Pages**.

---

## 1. Visão Geral

O **Catálogo Express** é uma SPA (Single Page Application) que permite:

- manter **N lojas (tenants)** num único banco local no navegador do Super Admin;
- editar cada loja pelo caminho de Onboarding + Painel Admin;
- publicar cada loja por um link público único;
- permitir que o cliente final faça pedido pelo WhatsApp e instale o app como PWA.

### Arquitetura de distribuição (sem ZIP)

1. Faça **um único** deploy da SPA em uma hospedagem estática (GitHub Pages, Netlify, Vercel...).
2. Cada loja possui uma URL com *slug*: `https://seusite/catalogo-express/?loja=burguer-recife`.
3. No Super Admin, use **Publicar** para gerar um **JSON leve** por loja (`lojas/<slug>.json`).
4. Esses arquivos JSON ficam em `public/lojas/` e sobem junto no deploy.
5. O cliente acessa a URL e a SPA lê o JSON para montar a vitrine com as cores/produtos corretos.

> Quem quiser domínio próprio aponta um **CNAME** para o site; a SPA segue lendo o slug via URL.

---

## 2. Stack Tecnológica

| Tecnologia | Versão | Finalidade |
|---|---|---|
| React | ^19.0.1 | Interface de usuário |
| React DOM | ^19.0.1 | Renderização |
| TypeScript | ~5.8.2 | Tipagem estática |
| Vite | ^6.2.3 | Build e dev server |
| Tailwind CSS | ^4.1.14 | Estilização |
| Motion | ^12.23.24 | Animações |
| Lucide React | ^0.546.0 | Ícones |
| Dexie.js | ^4.4.4 | Banco multi-tenant (IndexedDB) |
| JSZip | ^3.10.1 | Legado (gerador ZIP não ligado à UI) |

---

## 3. Estrutura de Diretórios

```
catalogo-express/
├── .env.example
├── .gitignore
├── README.md
├── DOCUMENTACAO.md            # Este documento
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   ├── icon.svg               # Ícone do app
│   ├── manifest.json          # Manifest PWA
│   ├── sw.js                  # Service Worker (cache offline)
│   └── lojas/                 # JSON pública de cada loja (gerado em "Publicar")
└── src/
    ├── main.tsx
    ├── index.css
    ├── App.tsx                # Roteador de visões + tela de loading
    ├── types.ts
    ├── vite-env.d.ts
    ├── db/
    │   └── db.ts              # Dexie multi-tenant (tabela lojas)
    ├── context/
    │   └── CatalogContext.tsx # Estado global + loja ativa + ações
    ├── data/
    │   ├── nichos.ts          # 9 nichos
    │   ├── temas.ts           # 6 temas
    │   └── sampleData.ts      # Dados de exemplo + config padrão
    ├── hooks/
    │   └── usePWA.ts
    ├── utils/
    │   ├── publish.ts         # Gera/lê JSON de publicação (substitui ZIP)
    │   ├── imagePipeline.ts   # Otimização de imagens (WebP)
    │   └── staticSiteGenerator.ts  # Legado — não usado na UI
    └── components/
        ├── onboarding/        # WelcomeScreen + 4 passos
        ├── admin/
        │   ├── StoreManager.tsx            # Super Admin (gerenciador de lojas)
        │   ├── AdminDashboard.tsx          # Painel da loja ativa
        │   ├── ProductManager.tsx
        │   ├── CompanyEditor.tsx
        │   ├── ThemeManager.tsx
        │   └── CustomPaletteManager.tsx
        ├── public/
        │   ├── PublicCatalog.tsx
        │   ├── ProductDetailModal.tsx
        │   └── CartDrawer.tsx
        └── pwa/
            └── PWAInstallModal.tsx
```

---

## 4. Camada de Dados Multi-Tenant — `src/db/db.ts`

Banco `CatalogoExpressCentral` (IndexedDB) com uma tabela `lojas`.

### Registro (`LojaRecord`)

| Coluna | Tipo | Descrição |
|---|---|---|
| `slug` | `string` | Chave primária (URL pública `?loja=<slug>`) |
| `nome` | `string` | Nome de exibição da loja |
| `nichoId` | `string` | Nicho do negócio |
| `isOnboarded` | `boolean` | Onboarding concluído |
| `publicada` | `boolean` | Se o JSON foi publicado |
| `updatedAt` | `number` | Timestamp de atualização |
| `data` | `LojaSnapshot` | `{ empresa, categorias, produtos, config, nichoId, isOnboarded }` |

Funções exportadas: `getLojas`, `getLojasMeta`, `getLoja`, `saveLoja`, `deleteLoja`, `countLojas`.

---

## 5. Estado Global — `CatalogContext.tsx`

Gerencia duas camadas: a **loja ativa** (dados em edição) e o **ecossistema de lojas**.

### Estado da loja ativa (compatível com o módulo anterior)
`nichoId`, `config`, `empresa`, `categorias`, `produtos`, `cart`, `activeStep`, `activeView`, `isOnboarded`, `isCustomerView`, `isLoading`, `dono`.

### Estado / ações multi-tenant
`activeSlug`, `lojas[]`, `refreshLojas`, `selectLoja`, `createLoja`, `renameLoja`, `duplicateLoja`, `deleteLoja`, `liberarLoja`, `exportEcosystemJson`, `importEcosystemJson`.

### Cadastro / login do comprador
- A loja guarda o **`dono`** (nome, e-mail, telefone e senha) no registro (`LojaRecord.dono`).
- Ao abrir `?acesso=<slug>`: se a loja **não tem dono** → tela de **cadastro** (`CadastroScreen`); se **já tem** → tela de **login** (`LoginScreen`).
- `registrarDono`: valida e grava `dono`, **sincroniza o WhatsApp/contato da empresa com o telefone do dono** e segue o fluxo normal.
- `loginDono`: valida e-mail + senha contra o `dono` da loja ativa e segue o fluxo normal.
- `updateDono`: edita os dados do cliente (aba Perfil da Empresa) e mantém o WhatsApp da loja sincronizado.
- O cadastro/login é **pré-requisito** do onboarding: só quem abre o `?acesso=` passa por eles; o root não.
- **Login obrigatório a cada acesso**: não há sessão persistida (`localStorage`). Toda abertura do link `?acesso=<slug>` exige e-mail + senha novamente (ou cadastro, se a loja ainda não tem dono). O `isClienteLogado` vale apenas para a sessão atual da página (logout/refresh → volta ao login).

### Acesso liberado vs. link público (`liberada`)
- Cada loja tem a flag **`liberada`** (persistida no Dexie), controlada pelo root.
- O botão **"Copiar Link de Acesso"** (`?acesso=<slug>`) **marca a loja como `liberada`** e copia a URL.
- O **"Copiar Link da Loja"** (público `?loja=<slug>`) **só fica disponível** quando a loja está liberada — tanto no painel do comprador quanto no Super Admin. Antes disso, é exibida uma dica em vez do botão.

### Fluxos de inicialização
- Se não houver nenhuma loja, **semeia a primeira** — usando o `localStorage` legado (`catalogo_express_data_v2`) ou os dados de exemplo do Restaurante.
- **Super Admin (root) → rota própria `#/admin`** (ex.: `https://seusite/catalogo-express/#/admin`). Sem login; a URL sem parâmetro (nem `?loja=` nem `?acesso=`) **redireciona** para `#/admin`, mantendo as URLs do root e do cliente sempre distintas.
- **Acesso do comprador** (`?acesso=<slug>`): carrega (ou cria) a loja; exige **cadastro ou login** a cada acesso antes de liberar o fluxo — depois disso, segue o **onboarding (passo 1, Nicho)** se ainda não configurada, ou o **painel** se já configurada.
- **Modo público** (`?loja=<slug>`): carrega a loja do IndexedDB ou do JSON hospedado (`fetchPublicStore`) e exibe a vitrine do cliente final.

O wizard de onboarding é usado **apenas** como fluxo de entrada do comprador (via `?acesso=`). Dono/comprador do sistema sempre passam pelo painel.

### Persistência
Toda alteração na loja ativa é gravada automaticamente no Dexie. Em modo público/cliente não há gravação. As flags `liberada` e o `dono` são persistidos no registro da loja (IndexedDB local). O **login do cliente não é persistido** — cada acesso ao `?acesso=<slug>` exige autenticação de novo.

> **Limitações:** como `liberada` e o cadastro/login vivem no IndexedDB **local**, o fluxo funciona plenamente quando root e comprador usam o mesmo navegador. Em dispositivos diferentes não há sincronização (arquitetura sem servidor). A **senha é armazenada em texto puro** no IndexedDB (sem backend). O logout devolve o cliente à tela de login da própria loja (não o expõe ao painel root).

---

## 6. Login Unificado e Super Admin — `LoginScreen.tsx` & `StoreManager.tsx`

Ao abrir o projeto, o sistema apresenta uma **Tela de Login Padrão Única** (`LoginScreen.tsx`), sem diferenciar visualmente os tipos de usuário:

- **Se for Superroot** (Primeiro usuário cadastrado na plataforma):
  - Assume o perfil `superadmin` e é redirecionado diretamente para o **Super Admin** (`StoreManager.tsx`) para gerenciar todas as lojas do ecossistema.
- **Se for Usuário da Plataforma / Dono de Loja** (Cadastros seguintes):
  - Assume o perfil `owner` e é redirecionado **direto para a dashboard ou onboarding da sua respectiva loja** (`AdminDashboard.tsx` ou Onboarding).
- **Recursos do Super Admin**:
  - Botão **Sair** no cabeçalho para encerrar a sessão.
  - Criação, edição, duplicação e exclusão de lojas.
  - **Visualização e Edição de Credenciais**: Exibe login e senha de cada loja (com botão de revelar/ocultar senha) e modal para alterar login/senha.
  - Cópia do link de acesso (`?acesso=<slug>`) e link público (`?loja=<slug>`).
  - Backup Geral do Ecossistema (.json).
  - Botão flutuante para download/instalação do **App PWA** na versão Web e Mobile.

> O botão **Publicar** (geração do JSON de publicação) foi removido — fica **fora do escopo**.

---

## 7. Painel Admin (loja ativa)

- **AdminDashboard**: cabeçalho (Baixar PWA, ir para Lojas, Ver Vitrine), estatísticas, banner de compartilhamento (copiar link de acesso + link da loja, este **somente se a loja estiver liberada**), e 4 abas — Produtos/Categorias, Empresa, Tema e Cores, Backup/Config.
- **Perfil do cliente logado**: após cadastro/login o comprador entra no mesmo `AdminDashboard`, mas com `isClienteLogado = true`, o que oculta os recursos de **root**: o botão **"Lojas (N)"** (Super Admin) e o **"Copiar Link de Acesso"**. O link público e o gerenciamento da própria loja permanecem. O App também redireciona `storemanager` → `admin` para cliente logado.
- **ProductManager / CompanyEditor / ThemeManager / CustomPaletteManager**: CRUD e personalização da loja ativa.
  - **Links Externos de Marketplace**: Os produtos agora contam com o campo opcional `linkExterno`, permitindo cadastrar links diretos da **Shopee**, **Mercado Livre**, **Amazon**, **Magalu** ou lojas parceiras.
  - **Exibição na Vitrine**: No `ProductDetailModal` e nos cards de produtos, é exibido o botão estilizado com identificação automática do marketplace (com cores oficiais e abertura em nova aba), facilitando a compra online.
  - Na aba **Perfil da Empresa** (`CompanyEditor`) há também a seção **"Dados do Cliente/Dono"**, onde o comprador edita nome, e-mail, telefone e senha (mantendo o WhatsApp da loja sincronizado).

---

## 8. Onboarding

Fluxo de 4 passos (WelcomeScreen → Nicho → Tema → Empresa → Produtos), usado como **tela de entrada do comprador do sistema** ao abrir o link de acesso `?acesso=<slug>` — entrando já no **passo 1 (Nicho)**, sem a Welcome. Após concluir, o usuário vai para o painel da loja. Os dados são salvos no Dexie sob o slug da loja.

---

## 9. Vitrine Pública — `PublicCatalog.tsx`

Monta a vitrine da loja (por slug): busca, categorias, destaques, abas (Início / Ofertas / Sobre / Favoritos), carrinho e envio do pedido via `wa.me`. Usa `ProductDetailModal` e `CartDrawer`.

---

## 10. Publicação — `src/utils/publish.ts`

- `buildPublicStoreJson(input)` → JSON leve com empresa, categorias, produtos, config e nicho.
- `publicStorePath(slug)` → caminho `lojas/<slug>.json`.
- `fetchPublicStore(slug)` → lê o JSON hospedado para montar a vitrine.
- `formatPublicagem(iso)` → formata data de publicação.

> O gerador de ZIP (`staticSiteGenerator.ts` + `jszip`) foi **descontinuado** e não ligado a nenhum botão.

---

## 11. PWA

- `usePWA.ts`: detecção de instalação, iOS, `beforeinstallprompt` e `appinstalled`.
- `PWAInstallModal.tsx`: instruções de instalação (direta ou passo a passo).
- `manifest.json`: `display: standalone`, ícones e tema.
- `sw.js`: cache offline (cache-first com atualização em background).

---

## 12. Nichos e Temas

- **9 nichos** em `src/data/nichos.ts`: restaurante, loja, servicos, tecnica, imobiliaria, saude, automotivo, educacao e outros.
- **6 temas** em `src/data/temas.ts`, com paletas recomendadas por nicho.
- Dados de exemplo para `restaurante`, `loja` e `servicos`.

---

## 13. Comandos e Configuração

| Script | Descrição |
|---|---|
| `npm run dev` | Dev server na porta 3000 |
| `npm run build` | Build de produção |
| `npm run lint` | TypeCheck (`tsc --noEmit`) |
| `npm install` | Instala dependências (inclui Dexie) |

---

## 14. Relógio de Status & Esteira de Pedidos — `PedidosView.tsx`

Sistema visual em tempo real para gerenciamento e produção de pedidos, com foco em ergonomia móvel e visão panorâmica:

- **🕒 1. O "Relógio de Status" (Gauge Circular Segmentado)**:
  - Posicionado no topo da tela, funciona como um indicador de volume e urgência de pedidos.
  - Anel em SVG com arcos segmentados e coloridos proporcionalmente aos pedidos na esteira:
    - 🟡 **Recebidos (`#F59E0B`)**: Etapa 1 — Pedidos novos recém-chegados.
    - 🔵 **Em Preparo (`#3B82F6`)**: Etapa 2 — Itens em produção/cozinha.
    - 🟠 **Prontos / A Sair (`#F97316`)**: Etapa 3 — Embalados e prontos para retirada ou entrega.
    - 🟢 **Concluídos (`#10B981`)**: Etapa 4 — Entregues ou finalizados.
  - Centro do relógio exibe o contador em tempo real dos pedidos na esteira (`Na Esteira`) e faturamento rápido do dia e do mês.
  - Fatias e chips interativos abaixo do relógio que filtram a esteira com um único toque.

- **🚥 2. Cartões de Steps com Etiquetas Coloridas**:
  - **Identificação Visual por Cores**: Cada pedido recebe uma etiqueta colorida vibrante e exclusiva (`[ 🟢 Pedido #101 ]`, `[ 🔵 Pedido #102 ]`, etc.) facilitando a rápida identificação visual pelo operador.
  - **Linha de Steps Interativa (4 Fases)**:
    `1. 📥 Recebido ➔ 2. 👨‍🍳 Em Preparo ➔ 3. 📦 Pronto / A Sair ➔ 4. ✅ Concluído`
  - O operador pode avançar ou retroceder a fase com **um clique diretamente no nó da etapa**, ou utilizar os botões de ação rápida no rodapé do card.
  - **Detalhamento do Pedido**: Itens, adicionais/opções, endereço, forma de pagamento, troco, observações e botão direto para abrir a mensagem formatada no WhatsApp.
  - **Filtros e Busca**: Filtros rápidos (Na Esteira, Todos, Hoje, Este Mês) e campo de busca por cliente, mesa ou identificador.
  - **Exportação de Faturamento**: Modal com seleção de período (Hoje, Mês, Todos ou Intervalo Customizado) e envio instantâneo do relatório consolidado pelo WhatsApp.

---

## 15. Espaço Físico & Integração com Google Maps

- **Configuração no Admin (`CompanyEditor.tsx`)**:
  - Habilitação opcional de ponto físico/atendimento presencial (`temEspacoFisico`).
  - Campos estruturados: Rua/Avenida, Número/Sala, Bairro, Cidade/UF, Ponto de Referência e Horário de Atendimento Presencial.
  - Integração com Google Maps: campo de link customizado e gerador automático a partir do endereço formatado.
  - Prévia em tempo real com mapa interativo incorporado (iframe do Google Maps).
- **Vitrine Pública (`PublicCatalog.tsx`)**:
  - Na aba **Sobre / Contato**, exibição do card de **Espaço Físico & Localização**.
  - Botões diretos para **Abrir no Google Maps 🗺️**, **Traçar Rota 🚗** e **Abrir no Waze 📍**.
  - Embed interativo do Google Maps para navegação do cliente sem sair do catálogo.

---

## 16. Sistema de Dark Mode Global & Design Tokens

Suporte completo a tema claro e escuro em 100% das visões da plataforma (Cadastro, Onboarding, Pedidos, Editor de Loja, Catálogo Público e Super Admin):

- **Paleta de Superfícies e Elevações**:
  - Fundo principal: `#121212` (`dark:bg-[#121212]`)
  - Cartões e Superfícies base: `#1E1E1E` (`dark:bg-[#1E1E1E]`)
  - Contêineres de destaque / Seções agrupadas (15% mais claros): `#262626` (`dark:bg-[#262626]`, borda `dark:border-[#383838]`)
  - Inputs e botões secundários: `#1E1E1E` ou `#2C2C2C` com bordas `#444444` (`dark:border-[#444444]`)
  - Textos principais / Rótulos: `#FFFFFF` (`dark:text-[#FFFFFF]`)
  - Textos secundários: `#B0BEC5` / `#757575` (`dark:text-[#B0BEC5]`)
- **Alternância Rápida de Tema**: Botões acessíveis de Sol/Lua sincronizados com a classe `.dark` no `document.documentElement` e salvos nas preferências da loja.

---

## 17. Editor de Texto Rico (Lexical) & Banner de Ofertas

- **Editor Lexical Rich Text (`LexicalRichTextEditor.tsx`)**:
  - Barra de ferramentas com funções (Negrito, Itálico, Sublinhado, Listas, Desfazer/Refazer) com ícones em preto puro de alto contraste (`#000000`, `stroke-[2.5]`) e botões ativos com destaque escuro.
  - Área de digitação adaptada com suporte nativo ao Dark Mode.
- **Banner de Ofertas e Promoções do Dia (`CompanyEditor.tsx`)**:
  - Configuração de banner dinâmico no topo do catálogo com título, chamada para ação (CTA), cor personalizada e contagem regressiva.

---

_Documentação atualizada do projeto **Catálogo Express** (arquitetura multi-tenant front-end)._