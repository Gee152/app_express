# Catálogo Express

> Plataforma completa de catálogo digital interativo, vitrine virtual e gestão de pedidos com envio direto para o WhatsApp, construída com Clean Architecture, SOLID, React 19, TypeScript e PostgreSQL.

---

## 📚 Documentação Oficial

Para entender todas as funcionalidades de negócio e as práticas de infraestrutura e publicação, consulte os manuais dedicados:

- 📖 **[Documentação Funcional Completa](file:///c:/Users/gabri/OneDrive/Pictures/konohaTech/cat%C3%A1logo-express/docs/DOCUMENTACAO_FUNCIONAL.md)**: Visão detalhada de perfis de acesso (Superadmin, Lojista, Atendente, Cliente), onboarding, vitrine pública, esteira de pedidos Kanban, multi-tenant e regras de negócio.
- 🚀 **[Guia e Checklist Pré-Deploy](file:///c:/Users/gabri/OneDrive/Pictures/konohaTech/cat%C3%A1logo-express/docs/GUIA_PRE_DEPLOY.md)**: Procedimento operacional padrão (POP) de 5 fases (Prepare, Backup, Deploy, Verify, Rollback), variáveis de ambiente, migrações TypeORM e configurações para Nginx e PM2.

---

## ⚡ Início Rápido (Ambiente de Desenvolvimento)

### Pré-requisitos
- **Node.js**: v20+
- **PostgreSQL**: v15+ em execução local ou via Docker
- **Gerenciador de pacotes**: `npm`

### 1. Configurar e Iniciar o Backend
```bash
cd backend
npm install
cp .env.example .env # ou configure as variáveis de ambiente necessárias
npm run dev
```
> O backend estará disponível em `http://localhost:3333`.  
> Endpoint de healthcheck: `http://localhost:3333/api/health`.

### 2. Configurar e Iniciar o Frontend
```bash
cd front
npm install
npm run dev
```
> O frontend iniciará em `http://localhost:3000` com proxy automático para `/api`.

---

## 🧪 Testes Automatizados

```bash
# Testes unitários do Backend (Jest)
cd backend
npm test

# Testes End-to-End do Frontend (Playwright)
cd ../front
npm run test:e2e
```

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 19, TypeScript, Vite 6, Tailwind CSS v4, Lucide React, Lexical, Dexie (IndexedDB), PWA.
- **Backend:** Node.js, Express, TypeScript (NodeNext / ESM), TypeORM, PostgreSQL, Bcrypt, JWT, Helmet, CORS.
- **DevOps / Qualidade:** Jest, Playwright, PM2, Nginx, GitHub Actions CI/CD.

---

## 📄 Licença

Proprietário - KonohaTech. Todos os direitos reservados.
