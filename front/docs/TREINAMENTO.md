# Catálogo Express — Manual Operacional & Guia de Treinamento

> **Manual Prático e Oficial de Operação do Sistema.**  
> Este guia contempla todas as instruções para o **Super Administrador (Gestor/Agência)**, o **Lojista/Comerciante** e a experiência do **Cliente Final**.

---

## 1. Visão Geral dos Papéis de Acesso

| Papel | Responsável | URL / Modo de Entrada | Principais Ações |
|---|---|---|---|
| **Super Admin (Root)** | Gestor do Sistema / Agência | SPA acessada sem parâmetros (`/`) | Criar, duplicar, excluir lojas, gerenciar até 50 clientes, exportar backups gerais do ecossistema e publicar JSONs. |
| **Lojista / Dono da Loja** | Comerciante / Dono do Negócio | Link de Acesso Exclusivo (`?acesso=<slug>`) | Realizar onboarding, cadastrar produtos, categorias, fotos WebP, complementos com preços, banners e acompanhar pedidos. |
| **Cliente Final (Consumidor)** | Comprador / Visitante | Link Público da Loja (`?loja=<slug>`) | Navegar pelo cardápio, buscar produtos, selecionar complementos, preencher endereço e enviar pedido formatado pelo WhatsApp. |

---

## 2. Comandos de Desenvolvimento & Operação Local

Para executar e validar a aplicação localmente:

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento (Porta 3000)
npm run dev

# 3. Executar verificação estática de tipos TypeScript
npm run lint

# 4. Executar bateria de testes automatizados End-to-End (E2E)
npm run test:e2e

# 5. Gerar build de produção otimizado
npm run build

# 6. Pré-visualizar o build de produção localmente
npm run preview
```

---

## 3. Guia do Super Administrador (Painel "Lojas")

O Super Admin é carregado automaticamente quando o sistema é acessado na raiz sem parâmetros.

```
┌────────────────────────────────────────────────────────────────────────┐
│                   SUPER ADMIN — CATÁLOGO EXPRESS                       │
│  [📊 12 Lojas Ativas]   [🚀 8 Publicadas]   [📝 4 Rascunhos]           │
├────────────────────────────────────────────────────────────────────────┤
│  ➕ Nova Loja: [ Nome da Loja ] [ Nicho ▼ ] [ + Criar Loja ]           │
│  📦 Backup Geral: [ Baixar Ecossistema JSON ] [ Restaurar Backup ]     │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Criando uma Nova Loja
1. No campo **"Nova Loja / Cliente"**, digite o nome do estabelecimento (ex.: `Hamburgueria Gourmet`).
2. Selecione o **Nicho de Negócio** desejado.
3. Clique em **"Criar Loja"**. A loja será criada como **Rascunho** e adicionada à listagem local.

### 3.2 Liberando o Acesso ao Lojista
1. Localize o card da loja criada.
2. Clique no botão **"Copiar link de acesso"**.
3. O sistema gerará o link no formato `https://seusite/?acesso=hamburgueria-gourmet` e marcará a loja como **Liberada**.
4. Envie este link diretamente ao comerciante para que ele realize o cadastro e configuração.

### 3.3 Publicação Estática para Deploy Unificado
1. Após a loja ser configurada, acesse o painel da loja e use a opção de **Publicar**.
2. O sistema gera e descarrega o arquivo `lojas/<slug>.json`.
3. Adicione o arquivo na pasta `public/lojas/` do repositório e execute o deploy estático.
4. O cliente poderá acessar a vitrine pública pelo link `https://seusite/?loja=<slug>`.

### 3.4 Gestão de Backup & Segurança de Dados
- **Backup Individual:** Cada loja pode ter seus dados exportados em JSON na aba *Backup e Configurações*.
- **Backup do Ecossistema:** No topo do Super Admin, utilize o botão **"Baixar Backup de Todas as Lojas"** para salvar todas as lojas do navegador em um único arquivo de segurança.

---

## 4. Guia do Lojista — Onboarding & Gestão da Loja

### 4.1 Primeiro Acesso e Cadastro
Ao abrir o link de acesso (`?acesso=<slug>`):
1. Preencha seu **Nome**, **E-mail**, **WhatsApp** e crie uma **Senha**.
2. Clique em **"Cadastrar e Começar"**. O telefone informado será automaticamente vinculado como o WhatsApp oficial para recebimento dos pedidos.

### 4.2 Assistente de Configuração Inicial (4 Passos)
1. **Passo 1 — Confirmação do Nicho:** Confirme ou selecione o modelo de negócio (carrega categorias e produtos de exemplo).
2. **Passo 2 — Identidade Visual & Tema:** Escolha uma paleta de cores recomendada ou pré-definida.
3. **Passo 3 — Informações do Estabelecimento:** Defina endereço, horários de funcionamento e dados de contato.
4. **Passo 4 — Catálogo Inicial:** Revise a lista de produtos de demonstração.
5. Conclua clicando em **"Publicar Catálogo & Ir ao Painel"**.

---

## 5. Gerenciamento do Cardápio & Recursos Avançados

### 5.1 Categorias de Produtos
- Acesse a aba **"Produtos e Categorias"**.
- Adicione categorias com **Emoji representativo** + **Nome** (ex.: `🍔 Burgers`, `🍟 Acompanhamentos`, `🥤 Bebidas`).
- Ordene ou remova categorias conforme a necessidade.

### 5.2 Cadastro e Edição de Produtos
Ao clicar em **"+ Novo Produto"**, configure:
- **Dados Principais:** Nome, Categoria, Preço Base (R$) e Descrição detalhada.
- **Upload com Otimização WebP Automática:** Selecione qualquer imagem do seu dispositivo. O sistema comprime e converte a foto em WebP automaticamente, mostrando a redução do tamanho do arquivo.
- **Grupos de Opcionais / Variações (com Acréscimo de Preço):**
  - *Escolha Única:* Ex.: "Ponto da Carne" (Mal Passado, Ao Ponto, Bem Passado).
  - *Escolha Múltipla:* Ex.: "Adicionais" (Bacon extra +R$ 4,00, Queijo duplo +R$ 5,00).
- **Links Externos de Compra:** Para lojas de afiliados ou variedades, informe o link do produto na Shopee, Mercado Livre ou Amazon.
- **Destaque:** Marque o produto como destaque para exibi-lo no topo da vitrine.

### 5.3 Banners Promocionais & Slider de Ofertas
Na aba **"Perfil da Empresa & Nicho"** $\rightarrow$ Seção **"Banner Promocional"**:
- Ative o banner de destaque ou carrossel de ofertas.
- Configure títulos atraentes, subtítulos, badges de desconto (ex.: `20% OFF`) e botão de ação direta.
- Vincule o banner a um produto específico: ao clicar no banner, a vitrine abre automaticamente o modal de compra daquele item.
- Defina o tempo de transição automática do slider (padrão: 5 segundos).

---

## 6. Operação do Fluxo de Pedidos & Checkout

### 6.1 Como o Cliente Final Realiza o Pedido
1. O cliente entra na vitrine pública (`?loja=slug`).
2. Clica no produto para abrir o **Modal de Detalhes** e seleciona os opcionais desejados.
3. Abre o **Carrinho Lateral (Drawer)**, confere o valor total com os adicionais calculados.
4. Preenche os dados de entrega:
   - Tipo de Pedido: **Entrega em Domicílio** ou **Retirada no Local**;
   - Endereço completo, Bairro e Ponto de Referência;
   - Forma de Pagamento (PIX com exibição da chave, Cartão de Crédito/Débito ou Dinheiro com troco).
5. Clica em **"Enviar Pedido pelo WhatsApp"**.

### 6.2 Formatação Automática da Mensagem WhatsApp
O pedido é codificado e disparado diretamente para o WhatsApp do estabelecimento no seguinte padrão:

```text
🍔 *NOVO PEDIDO - CATÁLOGO EXPRESS* 🍔
------------------------------------
*Cliente:* João Silva
*Tipo:* Entrega em Domicílio
*Endereço:* Rua das Flores, 123 - Centro

*ITENS DO PEDIDO:*
• 1x Combo Smash Bacon (R$ 32,90)
  └ Opções: Ao Ponto, + Bacon Extra (+R$ 4,00)
• 1x Refrigerante Lata (R$ 6,00)

*Subtotal:* R$ 42,90
*Pagamento:* PIX
------------------------------------
*TOTAL DO PEDIDO:* R$ 42,90
```

### 6.3 Painel de Gestão de Pedidos (Lojista)
- Os pedidos enviados ficam salvos no painel **"Pedidos"** do lojista.
- O comerciante pode alternar o status entre **"Novo / A Sair"** e **"Concluído / Já Saiu"**.
- Relatórios de vendas por data ou período podem ser exportados e enviados diretamente para o WhatsApp.

---

## 7. Instalação PWA & Experiência Mobile

O Catálogo Express funciona como um aplicativo progressivo (PWA), eliminando a necessidade de publicação em lojas de aplicativos:

### No Android / Chrome / Desktop
1. O navegador exibirá automaticamente o banner **"Adicionar à tela inicial"** ou o botão **"Instalar App"** no topo da vitrine.
2. O ícone do catálogo será adicionado à grade de aplicativos do celular.

### No iOS (iPhone / Safari)
1. Toque no botão de **Compartilhar** (ícone do quadrado com seta para cima no Safari).
2. Role para baixo e selecione **"Adicionar à Tela de Início"**.
3. Confirme em **"Adicionar"**. O catálogo passará a abrir em tela cheia com alta velocidade.

---

## 8. Perguntas Frequentes & Diagnóstico de Problemas (Troubleshooting)

### P: O link público não exibe os produtos ao ser compartilhado.
**Solução:** Certifique-se de que a loja foi publicada no Super Admin e que o respectivo arquivo `public/lojas/<slug>.json` foi incluído no deploy da sua hospedagem estática.

### P: A mensagem do WhatsApp não abre no celular do cliente.
**Solução:** Verifique se o número de WhatsApp cadastrado na aba *Perfil da Empresa* possui o DDD completo (ex.: `5581999999999`) sem caracteres especiais.

### P: As imagens dos produtos estão pesadas para carregar?
**Solução:** Utilize o upload nativo do painel administrativo. O sistema converte automaticamente qualquer imagem para o padrão WebP de alta eficiência com dimensões controladas.

### P: Como transferir as lojas para outro computador?
**Solução:** No Super Admin do computador de origem, clique em **"Baixar Backup de Todas as Lojas"**. No computador de destino, acesse o sistema e clique em **"Restaurar Backup Geral"** para importar todo o ecossistema.