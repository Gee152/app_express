# Guia de Infraestrutura de Produção & Requisitos VPS — Catálogo Express

> Documento técnico de arquitetura, dimensionamento de hardware, requisitos de software, segurança, CDN e estratégias de deploy em VPS para suportar **100+ usuários simultâneos** (lojistas gerenciando lojas e clientes finais realizando pedidos).

---

## 🧭 1. Diagnóstico do Projeto

O **Catálogo Express** foi concebido como uma SPA (*Single Page Application*) moderna em React 19 + TypeScript + Vite + Tailwind CSS v4, com as seguintes características operacionais:

- **Processamento Client-Side**: Todo o processamento de telas, temas, cálculo de carrinho, compressão de imagens WebP, Lexical Rich Text e o Relógio de Status da esteira é executado no navegador do usuário final.
- **Consumo de CPU no Servidor**: **Praticamente nulo**. O servidor atua prioritariamente servindo arquivos estáticos (`HTML`, `JS`, `CSS`, `WebP`, `JSON`) com alto potencial de cache e compressão.
- **Compatibilidade PWA**: Suporte nativo a Service Worker com cache-first offline.

---

## ⚙️ 2. Dimensionamento de Hardware (Requisitos da VPS)

Para atender confortavelmente **100+ usuários simultâneos** (com capacidade para escalar até milhares de acessos com CDN):

| Componente | Requisito Mínimo | Requisito Recomendado (Alta Performance) |
|---|---|---|
| **Provedores Indicados** | Hetzner / DigitalOcean / Linode / Contabo / AWS Lightsail | Hetzner (CPX11 ou CPX21) / DigitalOcean Basic Droplet |
| **vCPU** | 1 vCPU (x86_64 ou ARM64) | **2 vCPUs** |
| **Memória RAM** | 1 GB RAM (+ 2GB Swap) | **2 GB a 4 GB RAM** |
| **Armazenamento** | 20 GB SSD NVMe | **40 GB SSD NVMe** |
| **Tráfego de Rede** | 500 GB / mês | **1 TB a 2 TB / mês** |
| **Sistema Operacional** | Ubuntu 24.04 LTS / Debian 12 (64-bit) | Ubuntu 24.04 LTS (64-bit) |
| **Custo Médio** | ~US$ 4 a 6 / mês | ~US$ 6 a 10 / mês |

---

## 🏗️ 3. Diagrama da Arquitetura de Produção

```
                             [ Usuário / Lojista / Cliente ]
                                            │
                                            ▼ (HTTPS / Porta 443)
                         ┌─────────────────────────────────────┐
                         │       Cloudflare (Edge CDN & WAF)   │
                         │  • Cache de assets estáticos (Edge) │
                         │  • Proteção Anti-DDoS e SSL Edge    │
                         └──────────────────┬──────────────────┘
                                            │
                                            ▼ (HTTP/2 - Porta 443)
                         ┌─────────────────────────────────────┐
                         │             VPS Linux               │
                         │  ┌───────────────────────────────┐  │
                         │  │      NGINX / Caddy Server     │  │
                         │  │  • Compressão Brotli & Gzip   │  │
                         │  │  • Roteamento SPA (try_files) │  │
                         │  │  • Cache Headers imutáveis    │  │
                         │  │  • SSL Let's Encrypt          │  │
                         │  └───────────────┬───────────────┘  │
                         │                  │                  │
                         │                  ▼                  │
                         │  ┌───────────────────────────────┐  │
                         │  │   /var/www/catalogo-express   │  │
                         │  │  • dist/ (Build Vite)         │  │
                         │  │  • public/lojas/ (*.json)     │  │
                         │  └───────────────────────────────┘  │
                         └─────────────────────────────────────┘
```

---

## 📋 4. Requisitos de Software & Configuração do Servidor

### 4.1. Servidor Web NGINX (Configuração de Alta Performance)

Arquivo de configuração modelo (`/etc/nginx/sites-available/catalogo-express`):

```nginx
server {
    listen 80;
    server_name catalogo.seudominio.com.br;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name catalogo.seudominio.com.br;

    root /var/www/catalogo-express/dist;
    index index.html;

    # Certificados SSL (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/catalogo.seudominio.com.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/catalogo.seudominio.com.br/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Compressão Gzip e Brotli
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # Assets versionados pelo Vite (Cache imutável por 1 ano)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        access_log off;
    }

    # Arquivos JSON públicos de lojas
    location /lojas/ {
        expires 5m;
        add_header Cache-Control "public, max-age=300, must-revalidate";
    }

    # Roteamento SPA e PWA (HTML sem cache para garantir atualizações imediatas)
    location / {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        try_files $uri $uri/ /index.html;
    }

    # Segurança e cabeçalhos HTTP
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
}
```

---

### 4.2. Alternativa Ultraleve: Caddy Server

Se preferir o Caddy (que gerencia SSL automaticamente sem certbot):

```caddy
catalogo.seudominio.com.br {
    root * /var/www/catalogo-express/dist
    encode gzip zstd
    try_files {path} /index.html
    file_server

    @assets path /assets/*
    header @assets Cache-Control "public, max-age=31536000, immutable"

    @html path /index.html
    header @html Cache-Control "no-cache, no-store, must-revalidate"
}
```

---

## 🛡️ 5. Segurança & Hardening do Sistema Operacional

1. **Firewall UFW**:
   ```bash
   sudo ufw default deny incoming
   sudo ufw default allow outgoing
   sudo ufw allow 22/tcp     # SSH (ou porta customizada)
   sudo ufw allow 80/tcp     # HTTP
   sudo ufw allow 443/tcp    # HTTPS
   sudo ufw enable
   ```

2. **Proteção contra Força Bruta (Fail2ban)**:
   - Instalação: `sudo apt install fail2ban -y`
   - Bloqueia IPs com mais de 5 tentativas inválidas de login via SSH.

3. **Acesso SSH Seguro**:
   - Desabilitar autenticação por senha no `/etc/ssh/sshd_config` (`PasswordAuthentication no`).
   - Permitir apenas autenticação por Chave Pública SSH (`ed25519` ou `RSA 4096`).

4. **Certificados SSL Automáticos**:
   - `sudo certbot --nginx -d catalogo.seudominio.com.br` com renovação via systemd timer.

---

## 🌐 6. Camada de Borda com Cloudflare (CDN)

A utilização do plano gratuito da **Cloudflare** na frente da VPS garante:

1. **Absorção de Tráfego**: 85% a 95% das requisições estáticas (JS, CSS, SVGs, WebP) são respondidas diretamente pelos servidores Edge da Cloudflare no Brasil, sem sequer bater na VPS.
2. **Proteção Anti-DDoS**: Proteção ilimitada contra ataques de negação de serviço.
3. **HTTP/3 & 0-RTT**: Carregamento ultra-rápido em redes móveis 4G/5G.
4. **Economia de Recursos**: A VPS operará com menos de 5% de uso de CPU e pouquíssimo consumo de banda.

---

## 🚀 7. Pipeline de Deploy Automatizado (CI/CD)

Fluxo recomendado utilizando **GitHub Actions** (`.github/workflows/deploy.yml`):

```yaml
name: Deploy Produção VPS

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout do código
        uses: actions/checkout@v4

      - name: Configurar Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Instalar dependências
        run: npm ci

      - name: Compilar build de produção
        run: npm run build

      - name: Sincronizar com a VPS via SSH / Rsync
        uses: easingthemes/ssh-deploy@main
        with:
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          REMOTE_HOST: ${{ secrets.VPS_IP }}
          REMOTE_USER: ${{ secrets.VPS_USER }}
          TARGET: /var/www/catalogo-express/dist
          SOURCE: dist/
```

---

## 🔄 8. Análise de Evolução Arquitetural

### Cenário 1: 100% Estático (Status Atual)
- **Como opera**: O ecossistema roda localmente no navegador via IndexedDB. Publicações geram arquivos JSON estáticos hospedados em `/public/lojas/<slug>.json`.
- **Custo e Complexidade**: Custo mínimo (~US$ 4/mês), zero manutenção de banco no servidor, zero risco de invasão ao banco de dados.

### Cenário 2: Híbrido com Sincronização em Nuvem (Futuro Opcional)
- **Quando adotar**: Se múltiplos operadores em dispositivos diferentes precisarem editar a mesma loja ou ver os pedidos em tempo real sincronizados por websocket/banco.
- **Stack recomendada**: Micro-serviço em Node.js (Fastify) ou Go + SQLite com replicação Litestream ou PostgreSQL, consumindo ~150MB adicionais de RAM.

---

## 📊 9. Checklist de Implementação de Produção

- [ ] Contratar VPS com Ubuntu 24.04 LTS (Hetzner, DigitalOcean ou AWS Lightsail).
- [ ] Configurar DNS do domínio apontando para a Cloudflare (Proxy Ativo ☁️).
- [ ] Configurar chaves SSH e desativar login por senha.
- [ ] Configurar Firewall `UFW` e `Fail2ban`.
- [ ] Instalar `NGINX` ou `Caddy` e clonar o repositório.
- [ ] Configurar certificado SSL Let's Encrypt.
- [ ] Configurar pipeline de CI/CD para deploys automáticos via `git push`.
- [ ] Ativar monitoramento de disponibilidade gratuito (ex.: UptimeRobot).
