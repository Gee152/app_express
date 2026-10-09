# Catálogo Express - Guia e Checklist Pré-Deploy

> **Responsável:** DevOps & Engenharia de Operações  
> **Versão:** 1.0.0  
> **Classificação:** Procedimento Operacional Padrão (POP) - Produção  
> **Filosofia:** *"Automatize o repetível. Documente o excepcional. Nunca apresse mudanças em produção."*

---

## 1. Visão Geral e Arquitetura de Produção

Este documento detalha os procedimentos obrigatórios para o deploy seguro e confiável do **Catálogo Express** em ambientes de Staging e Produção.

### 1.1 Topologia de Infraestrutura

```mermaid
graph TD
    User([🌐 Usuário / Cliente Final]) -->|HTTPS / Porta 443| Nginx[Proxy Reverso Nginx / Cloudflare]
    
    subgraph Frontend [Camada Frontend - SPA Estático]
        Nginx -->|/ (HTML, JS, CSS, PWA)| DistStatic[Vite Build: dist/]
    end

    subgraph Backend [Camada Backend - Node.js ESM]
        Nginx -->|/api/* (Reverse Proxy)| PM2[Gerenciador de Processos PM2]
        PM2 --> AppInstance1[Node.js Express App - Porta 3333]
    end

    subgraph Database [Camada de Persistência]
        AppInstance1 -->|TypeORM Connection Pool| Postgres[(PostgreSQL 15+)]
    end
```

---

## 2. Matriz de Variáveis de Ambiente

Antes de iniciar qualquer deploy, certifique-se de que os arquivos de ambiente estejam devidamente configurados e criptografados nos servidores de destino. **Nunca versione arquivos `.env` no Git.**

### 2.1 Backend (`backend/.env`)

| Variável | Exemplo de Produção | Obrigatório | Descrição / Diretriz de Segurança |
| :--- | :--- | :---: | :--- |
| `PORT` | `3333` | Sim | Porta TCP na qual o Express receberá requisições locais do proxy reverso. |
| `NODE_ENV` | `production` | Sim | Ativa otimizações do Express e desativa `synchronize` perigoso do TypeORM. |
| `DB_HOST` | `127.0.0.1` ou `db.internal` | Sim | Hostname ou IP privado da instância do PostgreSQL. |
| `DB_PORT` | `5432` | Sim | Porta de conexão do PostgreSQL. |
| `DB_USER` | `catalogo_app_user` | Sim | Usuário dedicado com privilégios limitados (evitar usar o superuser `postgres`). |
| `DB_PASSWORD` | `[SENHA_FORTE_GERADA_64_CHARS]` | Sim | Senha de alta entropia para a conexão com o banco de dados. |
| `DB_NAME` | `catalogo_express_prod` | Sim | Nome da base de dados relacional. |
| `JWT_SECRET` | `[CHAVE_CRIPTOGRAFICA_SHA256]` | Sim | Segredo para assinatura de tokens Bearer. **Não usar chave padrão!** |
| `JWT_EXPIRES_IN` | `1d` | Sim | Tempo de validade do token de autenticação (ex.: `1d`, `7d`). |

### 2.2 Frontend (`front/.env.production`)

| Variável | Exemplo de Produção | Obrigatório | Descrição |
| :--- | :--- | :---: | :--- |
| `VITE_API_URL` | `/api` | Sim | URL base consumida pelo `ApiService`. Em Nginx unificado, manter `/api`. |

---

## 3. As 5 Fases do Ciclo de Deploy

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌──────────────────────┐
│ 1. PREPARE  │ ──> │  2. BACKUP  │ ──> │  3. DEPLOY  │ ──> │  4. VERIFY  │ ──> │ 5. CONFIRM / ROLLBACK│
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘     └──────────────────────┘
```

---

### FASE 1: PREPARE (Preparação & Validação)

> ⚠️ **Princípio:** Jamais realize deploy de código não testado ou com pendências de compilação.

Execute localmente ou no servidor de CI/CD:

```bash
# 1.1 Verificar integridade de tipagem no Frontend
cd front
npm run lint

# 1.2 Executar testes E2E do Frontend
npx playwright test --project=chromium

# 1.3 Executar bateria de testes automatizados do Backend
cd ../backend
npm test

# 1.4 Testar build de produção do Backend
npm run build

# 1.5 Testar build de produção do Frontend
cd ../front
npm run build
```

#### Checklist da Fase 1:
- [ ] Todos os testes unitários do backend (`jest`) passaram com 100% de sucesso.
- [ ] Testes E2E (`playwright`) executados e aprovados.
- [ ] Build do TypeScript (`tsc`) compilou sem erros ou alertas críticos de tipagem.
- [ ] Build do Vite gerou os chunks otimizados na pasta `front/dist/`.
- [ ] Nenhuma credencial ou segredo hardcoded inserido no repositório.

---

### FASE 2: BACKUP (Segurança e Contingência)

> ⚠️ **Princípio:** Não existe plano de rollback sem backup consistente do banco de dados e dos estados anteriores.

Execute no servidor de produção antes de aplicar qualquer alteração:

```bash
# 2.1 Criar diretório de backups datado
mkdir -p /opt/backups/catalogo-express/$(date +%Y%m%d)
BACKUP_FILE="/opt/backups/catalogo-express/$(date +%Y%m%d)/dump_pre_deploy_$(date +%H%M%S).dump"

# 2.2 Realizar snapshot atômico do PostgreSQL
pg_dump -U postgres -h 127.0.0.1 -d catalogo_express_prod -Fc -f "$BACKUP_FILE"

# 2.3 Confirmar que o arquivo foi gerado e não está vazio
ls -lh "$BACKUP_FILE"
```

#### Checklist da Fase 2:
- [ ] Snapshot do banco de dados criado e validado com tamanho compatível.
- [ ] Commit hash atual em produção anotado: `git rev-parse HEAD`.
- [ ] Versão atual do build arquivada caso seja necessário reverter de imediato.

---

### FASE 3: DEPLOY (Execução Controlada)

> ⚠️ **Princípio:** Acompanhe o processo em tempo real. Não abandone o terminal durante a execução.

#### Passo 3.1: Atualização do Código-Fonte
```bash
cd /opt/catalogo-express
git fetch origin
git checkout main
git pull origin main
```

#### Passo 3.2: Instalação Limpa de Dependências e Build do Backend
```bash
cd /opt/catalogo-express/backend
npm ci --omit=dev
npm run build
```

#### Passo 3.3: Execução de Migrações do Banco de Dados
```bash
# Aplicar migrations pendentes do TypeORM
npm run migration:run
```

#### Passo 3.4: Build e Publicação dos Arquivos Estáticos do Frontend
```bash
cd /opt/catalogo-express/front
npm ci
npm run build

# Copiar arquivos estáticos para o diretório servido pelo Nginx
sudo rsync -av --delete dist/ /var/www/catalogo-express/
```

#### Passo 3.5: Reload Sem Downtime do Backend no PM2
```bash
# Recarregar processos mantendo conexões ativas
pm2 reload catalogo-backend --update-env
```

---

### FASE 4: VERIFY (Validação Pós-Deploy)

> ⚠️ **Princípio:** Confie, mas verifique cada endpoint e fluxo crítico imediatamente.

Execute as seguintes checagens operacionais:

#### 4.1 Checagem de Saúde do Backend (Healthcheck)
```bash
curl -i http://localhost:3333/api/health
```
**Resposta esperada:** `HTTP/1.1 200 OK` com payload `{"status":"ok", "timestamp":"..."}`.

#### 4.2 Checagem de Conexão com o Banco de Dados
Inspecione os logs do PM2 para garantir que o TypeORM conectou e o seed executou sem erros:
```bash
pm2 logs catalogo-backend --lines 50
```
Verifique as mensagens de sucesso:
- `✅ Conexão com o banco de dados estabelecida com sucesso!`
- `ℹ️ Superroot já cadastrado e ativo no PostgreSQL.` ou `✅ Superroot criado com sucesso!`

#### 4.3 Verificação das Rotas Públicas e do Frontend
- Abra a URL principal no navegador: `https://catalogo.seudominio.com`.
- Teste a vitrine de uma loja ativa com parâmetro: `https://catalogo.seudominio.com/?loja=loja-demo`.
- Verifique se os produtos, banners promocionais e imagens carregam sem erros 404 no console do navegador.
- Simule a adição de 1 item ao carrinho e clique para gerar mensagem do WhatsApp.
- Acesse o painel administrativo (`/login`) e teste a autenticação.

---

### FASE 5: CONFIRM OU ROLLBACK (Decisão Final)

#### Janela de Monitoramento de 15 Minutos:
Monitore a taxa de erros nos logs e uso de memória:
```bash
pm2 monit
```

| Sintoma Observado | Ação Requerida |
| :--- | :--- |
| **Serviço indisponível (HTTP 502/500 generalizado)** | **ROLLBACK IMEDIATO** |
| **Erros críticos de banco ou falha de migrations** | **ROLLBACK IMEDIATO** |
| **Aumento anormal de CPU/Memória (> 85%)** | Investigar processo / Considerar Rollback |
| **Bug cosmético isolado em tela não crítica** | Corrigir via *Fix-Forward* rápido |

---

## 4. Procedimento Formal de Rollback de Emergência

Caso ocorra qualquer instabilidade crítica inaceitável durante ou logo após o deploy, execute o rollback rigorosamente nesta ordem:

```bash
# 1. Identificar o commit estável anterior
PREV_COMMIT="[HASH_DO_COMMIT_ANTERIOR]"

# 2. Reverter o código-fonte
cd /opt/catalogo-express
git checkout $PREV_COMMIT

# 3. Reverter migração do banco de dados (se houver sido aplicada)
cd /opt/catalogo-express/backend
npm run migration:revert

# (Se a estrutura de dados foi corrompida, restaurar o snapshot da Fase 2)
# dropdb -U postgres catalogo_express_prod
# createdb -U postgres catalogo_express_prod
# pg_restore -U postgres -d catalogo_express_prod "$BACKUP_FILE"

# 4. Recompilar e reiniciar backend
npm run build
pm2 reload catalogo-backend

# 5. Recompilar e restaurar frontend
cd /opt/catalogo-express/front
npm run build
sudo rsync -av --delete dist/ /var/www/catalogo-express/

# 6. Confirmar restabelecimento
curl -I http://localhost:3333/api/health
```

---

## 5. Modelos de Configuração Prontos para Produção

### 5.1 Configuração PM2 (`backend/ecosystem.config.cjs`)

```javascript
module.exports = {
  apps: [
    {
      name: 'catalogo-backend',
      script: './dist/delivery/http/server.js',
      instances: 'max', // Modo cluster: escala conforme núcleos de CPU disponíveis
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3333,
      },
    },
  ],
};
```

### 5.2 Configuração Nginx (`/etc/nginx/sites-available/catalogo-express`)

```nginx
server {
    listen 80;
    server_name catalogo.seudominio.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name catalogo.seudominio.com;

    ssl_certificate /etc/letsencrypt/live/catalogo.seudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/catalogo.seudominio.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Compressão Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    # Frontend (SPA)
    root /var/www/catalogo-express;
    index index.html;

    # Cache agressivo para assets com hash
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Roteamento SPA: Qualquer rota recai sobre o index.html
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Proxy Reverso para a API Backend Node.js
    location /api/ {
        proxy_pass http://127.0.0.1:3333;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Limite de upload de 50MB (para imagens de produtos e logos)
        client_max_body_size 50M;
    }
}
```

---

## 6. Anti-Padrões de Produção (O que NUNCA fazer)

| ❌ O que NÃO fazer | ✅ Procedimento Correto |
| :--- | :--- |
| **Realizar deploy em sextas-feiras à tarde** | Fazer deploys de terça a quinta pela manhã, com equipe disponível para monitoramento. |
| **Usar `synchronize: true` do TypeORM em produção** | Manter `synchronize: false` e gerenciar qualquer alteração via Migrations versionadas. |
| **Editar código diretamente no servidor (`hot-patch`)** | Realizar o ciclo completo no Git com testes e build automatizado. |
| **Fazer deploy sem backup prévio do banco de dados** | Sempre gerar dump atômico do PostgreSQL antes de tocar em produção. |
| **Ignorar os primeiros 15 minutos pós-deploy** | Monitorar logs (`pm2 logs`) e telemetria ativamente logo após a virada. |
