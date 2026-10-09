# Catálogo Express — Apresentação do Produto & Material de Divulgação

> **Guia Oficial de Vendas, Posicionamento e Divulgação Comercial.**  
> Utilize este material para demonstrar a plataforma para clientes, prospects e parceiros, destacando diferenciais competitivos, modelo financeiro (sem mensalidades) e a experiência de usuário.

---

## 1. O que é o Catálogo Express?

O **Catálogo Express** é uma plataforma inovadora de **catálogos digitais, cardápios interativos e vitrines de produtos** com fechamento e envio de pedidos estruturados diretamente pelo **WhatsApp**. 

Diferente de sistemas tradicionais que exigem servidores caros, bancos em nuvem e mensalidades recorrentes, o Catálogo Express é uma **SPA (Single Page Application) 100% front-end e local-first**, capaz de operar até **50 lojas em um único navegador** e com **um único deploy estático**.

- **Multi-Nicho Completo:** Restaurantes, hamburguerias, pizzarias, lojas de roupas/moda, prestadores de serviços, clínicas, oficinas, imobiliárias, cursos e variedades.
- **Custo Operacional Zero:** Sem backend, sem taxas por transação e sem dependência de banco em nuvem pago.
- **Experiência de App Nativo (PWA):** Instalação direta no celular do cliente final (Android/iOS) com suporte a navegação offline via Service Worker.
- **Deploy Unificado com Publicação JSON:** Cada loja possui sua vitrine pública através de manifestos estáticos leves (`public/lojas/<slug>.json`).

---

## 2. Proposta de Valor

> 🚀 **"Seu catálogo digital profissional no ar em minutos, com pedidos automáticos no WhatsApp, alta velocidade no celular, sem custos de servidor e sem mensalidades."**

---

## 3. Como Funciona (Jornada em 4 Passos)

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  1. Super Admin │  ──►  │   2. Onboarding │  ──►  │   3. Personaliza│  ──►  │   4. Vendas no  │
│  Criação & Nicho│       │   Cadastro/Dono │       │   Produtos/Banners│     │     WhatsApp    │
└─────────────────┘       └─────────────────┘       └─────────────────┘       └─────────────────┘
```

1. **Criação da Loja (Super Admin):** A agência/gestor cadastra a nova loja com nome e nicho, gerando instantaneamente o link de acesso exclusivo.
2. **Onboarding Guiado (4 Etapas):** O lojista define Nicho $\rightarrow$ Tema/Paleta $\rightarrow$ Dados da Empresa $\rightarrow$ Produtos Iniciais.
3. **Personalização Avançada:** O lojista ajusta categorias, complementos com preços adicionais, banners promocionais (slider), fotos otimizadas em WebP e links para marketplaces.
4. **Vendas & Divulgação:** O cliente final acessa o link público (`?loja=slug`), navega com fluidez, adiciona itens ao carrinho e dispara o pedido pronto no WhatsApp do comerciante.

---

## 4. Diferenciais Competitivos

| Recurso | Catálogo Express | Concorrentes Tradicionais (SaaS) |
|---|---|---|
| **Custo de Mensalidade** | **R$ 0,00** (Deploy estático gratuito) | R$ 99 a R$ 390 / mês |
| **Taxas sobre Pedidos** | **0%** de comissão | 2% a 15% por transação |
| **Infraestrutura / Backend** | **Zero Backend** (Local-First / IndexedDB) | Servidor Node/PHP + PostgreSQL/MySQL |
| **Velocidade de Carregamento** | **Instantâneo** (LCP < 1.2s, WebP client-side) | Carregamento pesado com múltiplos scripts |
| **Instalação no Celular** | **PWA Instantâneo** (1 toque, sem app store) | Exige download na PlayStore/AppStore |
| **Gestão Multi-Loja** | **Até 50 lojas** no painel Super Admin | Cobra plano adicional por nova loja |
| **Publicação Estática** | **JSON leve** por loja (`lojas/<slug>.json`) | Dependência constante de banco online |

---

## 5. Recursos & Funcionalidades de Destaque

### 🛍️ Vitrine de Alta Conversão & Mobile First
- **Carrossel / Slider de Banners Promocionais:** Suporte a múltiplos slides com contadores, tags ("OFERTA DO DIA"), badges de desconto ("20% OFF") e clique direto para abrir o produto.
- **Grupos de Opcionais e Variações:** Escolha única (ex.: Ponto da carne, Tamanho) ou múltipla (ex.: Molhos, Adicionais) com valor extra somado dinamicamente ao carrinho.
- **Links Externos para Marketplaces:** Integração direta para venda em canais externos (Shopee, Mercado Livre, Amazon) para nichos de variedades e afiliados.
- **Busca Instantânea & Filtros por Categoria:** Navegação rápida com tags visuais e visualização de destaques.

### ⚡ Performance Extrema & Otimização de Imagens
- **Pipeline WebP Automático:** Toda foto inserida (logo, banner, produtos) é comprimida no navegador em WebP (redução de até 85% do tamanho original).
- **Core Web Vitals Alinhados:** Pontuação máxima no Google Lighthouse, garantindo tempo de resposta imediato e transições suaves.

### 📱 PWA & Funcionamento Offline
- Ícone instalado na tela inicial do cliente final, com abertura em tela cheia (standalone) e cache de assets via Service Worker.

### 📊 Painel de Pedidos & Faturamento
- Acompanhamento de pedidos em tempo real ("Novo / A Sair" vs "Concluído / Já Saiu").
- Exportação de relatórios consolidados de vendas por período diretamente para o WhatsApp do lojista.

---

## 6. Nichos Atendidos

| Nicho | Exemplos de Aplicação | Recursos Específicos |
|---|---|---|
| 🍔 **Restaurante / Gastronomia** | Hamburguerias, Pizzarias, Sushis, Cafeterias | Adicionais com preço, ponto da carne, taxa de entrega |
| 👗 **Moda & Acessórios** | Boutiques, Calçados, Joias, Óticas | Variações de tamanho/cor, fotos detalhadas, links externos |
| 🛠️ **Serviços & Manutenção** | Oficinas, Marcenarias, Pintores, Eletricistas | Catálogo de serviços, solicitação de orçamentos |
| 🏠 **Imobiliária & Locação** | Corretores, Pousadas, Aluguel por temporada | Destaques de imóveis, mapa e localização |
| 🩺 **Saúde & Estética** | Clínicas, Salões de Beleza, Tatuadores | Vitrine de procedimentos, agendamento via WhatsApp |
| 🚗 **Automotivo** | Concessionárias, Autopeças, Lava-jato | Vitrine de veículos, especificações e contato rápido |
| 🎓 **Educação & Cursos** | Escolas de música, Treinamentos, Aulas | Programação de cursos, matrículas pelo WhatsApp |
| 🛍️ **Geral / Variedades** | Afiliados, Bazares, Presentes | Integração direta com botões de marketplace |

---

## 7. Estratégia de Monetização para Agências / Revendedores

1. **Taxa de Implantação / Setup:** Cobrança única pela criação da loja, cadastro de cardápio e identidade visual (R$ 300 a R$ 1.200 por cliente).
2. **Taxa de Manutenção Opcional:** Suporte mensal para atualização de fotos e preços (R$ 50 a R$ 150/mês), com margem de lucro de 100% devido ao custo zero de infraestrutura.
3. **Venda de Pacotes de Lojas:** Revenda para praças de alimentação, associações comerciais ou redes de franquias locais.

---

## 8. Apêndice — Guia Visual para Criação de Conteúdo & Vídeos

Utilize estas descrições e prompts para gerar criativos publicitários, vídeos conceituais (Veo, Sora, Midjourney) e materiais gráficos:

### Padrão Estético Recomendado
- **Interface:** Design clean, bordas suaves (`rounded-2xl`), sombras modernas e microinterações fluidas.
- **Dispositivos:** Smartphone moderno na vertical (mockup iPhone/Android) exibindo a vitrine do cliente e laptop fino exibindo o painel administrativo.
- **Paleta Corporativa:** Fundo cinza suave `#F8FAFC`, cards brancos, detalhes em verde-esmeralda `#10B981` (WhatsApp/Conversão) e acentos em índigo `#4F46E5`.

### Prompts de Exemplo para Imagens Promocionais

```text
Prompt 1 (Vitrine Mobile):
"Modern smartphone mockup displaying a vibrant food delivery catalog app, clean white interface with rounded cards, appetizing gourmet burger photo, price tag in Brazilian Real, green floating WhatsApp order button, high conversion UI/UX, photorealistic 8k studio lighting."
```

```text
Prompt 2 (Painel Administrativo):
"Clean desktop dashboard on a sleek laptop, showing a multi-store management panel with colorful metric cards, store status badges, product manager with burger photos, modern flat UI design, indigo and emerald green accent colors."
```

```text
Prompt 3 (Jornada de Pedido):
"Split screen illustration: on the left, a smartphone user choosing food options in a sleek web catalog; on the right, the WhatsApp screen receiving an organized and formatted order ticket, seamless transaction concept."
```