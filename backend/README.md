# Backend — Catálogo Express (SOLID & Clean Architecture)

Backend robusto, escalável e altamente desacoplado construído em **Node.js com TypeScript**, aplicando os princípios **SOLID**, **Clean Architecture** (Ports & Adapters) e **Clean Code**.

---

## 🏛️ Estrutura Arquitetural

A estrutura foi organizada para garantir que regras de negócio **nunca dependam de frameworks ou banco de dados**:

```text
backend/
├── docker-compose.yml              # PostgreSQL 16 com volume persistente
├── .env.example                    # Modelo de variáveis de ambiente
├── .env                            # Variáveis de ambiente locais
├── package.json                    # Dependências e scripts de execução
├── tsconfig.json                   # Configuração TypeScript com decorators
├── src/
│   ├── delivery/                   # 1ª CAMADA: HTTP & APRESENTAÇÃO
│   │   └── http/
│   │       ├── controllers/        # Controladores HTTP (Auth, Store)
│   │       ├── middlewares/        # Auth JWT, Validação DTO, Error Handler
│   │       ├── routes/             # Definição e agrupamento de rotas
│   │       └── server.ts           # Inicializador do servidor
│   │
│   ├── domain/                     # 2ª CAMADA: DOMÍNIO & REGRAS DE NEGÓCIO
│   │   ├── entities/               # Entidades puras (User, Store, Product, Category)
│   │   ├── dtos/                   # DTOs com validação via class-validator
│   │   ├── use-cases/              # Casos de Uso (regras de negócio isoladas)
│   │   ├── repositories/           # Contratos (Interfaces) de repositório (DIP)
│   │   ├── providers/              # Contratos (Interfaces) de serviços (Hash, JWT)
│   │   └── errors/                 # Exceções tipadas do domínio (DomainError)
│   │
│   ├── infrastructure/             # 3ª CAMADA: INFRAESTRUTURA & IMPLEMENTAÇÕES
│   │   ├── database/typeorm/       # DataSource, Schemas de Entidade e Repositórios
│   │   └── providers/              # Implementações concretas (Bcrypt, JWT)
│   │
│   ├── config/                     # 4ª CAMADA: CONFIGURAÇÕES
│   │   ├── env.config.ts           # Variáveis de ambiente centralizadas
│   │   └── auth.config.ts          # Configuração de tokens JWT
│   │
│   └── app.ts                      # Composition Root (Injeção de dependências)
```

---

## 🚀 Como Executar o Projeto

### 1. Pré-requisitos
- Node.js (>= 20)
- Docker & Docker Compose

### 2. Subir o Banco de Dados (PostgreSQL) via Docker
Na pasta `backend/`:
```bash
docker compose up -d
```
O PostgreSQL estará rodando na porta `5432` com persistência de dados em volume Docker.

### 3. Instalar Dependências
```bash
npm install
```

### 4. Iniciar em Modo de Desenvolvimento
```bash
npm run dev
```
O servidor estará ativo em: `http://localhost:3333`

---

## 📡 Endpoints da API

### 1. Healthcheck
- `GET /api/health` -> Verifica o status da API.

### 2. Autenticação & Usuários (`/api/auth`)
- `POST /api/auth/register`
  - Body:
    ```json
    {
      "name": "Gabriel Administrador",
      "email": "admin@konohatech.com",
      "password": "senhaSegura123"
    }
    ```
- `POST /api/auth/login`
  - Body:
    ```json
    {
      "email": "admin@konohatech.com",
      "password": "senhaSegura123"
    }
    ```
  - Response:
    ```json
    {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "uuid-aqui",
        "name": "Gabriel Administrador",
        "email": "admin@konohatech.com",
        "role": "owner",
        "storeId": null
      }
    }
    ```
- `GET /api/auth/me`
  - Headers: `Authorization: Bearer <seu_token_jwt>`
  - Retorna dados da sessão autenticada.

### 3. Lojas Multi-Tenant (`/api/stores`)
- `POST /api/stores` *(Requer Bearer Token)*
  - Body:
    ```json
    {
      "name": "Hamburgueria Konoha",
      "slug": "hamburgueria-konoha",
      "whatsapp": "81999999999",
      "config": {
        "temaId": "tema-escuro",
        "nichoId": "hamburgueria"
      }
    }
    ```
- `GET /api/stores/:slug` *(Público)*
  - Retorna a loja e suas configurações pelo slug público.

---

## 🛡️ Princípios SOLID Aplicados na Prática

1. **SRP (Single Responsibility)**: O `AuthController` apenas traduz HTTP para DTO; o `AuthenticateUserUseCase` executa exclusivamente a verificação de credenciais; o `TypeOrmUserRepository` faz apenas consultas no banco.
2. **OCP (Open/Closed)**: Novos provedores de hash ou autenticação podem ser plugados sem alterar os Casos de Uso.
3. **LSP (Liskov Substitution)**: O repositório em memória (`InMemoryUserRepository`) pode substituir o repositório TypeORM nos testes unitários sem nenhuma quebra de contrato.
4. **ISP (Interface Segregation)**: Interfaces enxutas e focadas (`IUserRepository`, `IHashProvider`, `ITokenProvider`).
5. **DIP (Dependency Inversion)**: Casos de uso dependem de abstrações (interfaces do `src/domain/repositories` e `src/domain/providers`), e **nunca** de bibliotecas concretas como TypeORM ou bcrypt.
