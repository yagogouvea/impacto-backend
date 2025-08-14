# 🚀 Guia de Deploy - Backend Costa

## 📋 Pré-requisitos

- Node.js 18+
- PostgreSQL
- Variáveis de ambiente configuradas

## 🔧 Configuração das Variáveis de Ambiente

### 📝 Variáveis Obrigatórias

```bash
# Ambiente
NODE_ENV=production
PORT=8080

# Banco de Dados (IMPORTANTE: deve começar com postgresql:// ou postgres://)
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT
JWT_SECRET="sua-chave-secreta-jwt-aqui-minimo-32-caracteres"
```

### 📝 Variáveis Opcionais

```bash
# URLs
BASE_URL="https://seu-dominio.com"
FRONTEND_URL="https://seu-frontend.com"

# AWS (se usar)
AWS_ACCESS_KEY_ID=sua_access_key
AWS_SECRET_ACCESS_KEY=sua_secret_key
AWS_REGION=us-east-1
S3_BUCKET=seu_bucket
```

## 🚀 Deploy no Railway

### 1. Configuração do Projeto

1. Conecte seu repositório ao Railway
2. Configure as variáveis de ambiente na interface do Railway
3. Use o arquivo `railway.json` para configurações específicas

### 2. Variáveis de Ambiente no Railway

```bash
NODE_ENV=production
PORT=8080
JWT_SECRET=sua-chave-jwt-secreta
DATABASE_URL=postgresql://username:password@host:port/database
BASE_URL=https://seu-app.up.railway.app
FRONTEND_URL=https://seu-frontend.com
```

### 3. Comando de Inicialização

O Railway usará automaticamente:
```bash
npm run start:check
```

## ☁️ Deploy no Google Cloud

### 1. Configuração do app.yaml

O arquivo `app.yaml` já está configurado com:
- Runtime: Node.js 18
- Porta: 8080
- Variáveis de ambiente básicas

### 2. Deploy via gcloud

```bash
# Fazer login
gcloud auth login

# Configurar projeto
gcloud config set project SEU_PROJECT_ID

# Deploy
gcloud app deploy
```

### 3. Configurar Variáveis de Ambiente

```bash
# Via console do Google Cloud
# Ou editar o app.yaml antes do deploy
```

## 🐳 Deploy com Docker

### 1. Build da Imagem

```bash
docker build -t segtrack-backend .
```

### 2. Executar Container

```bash
docker run -d \
  -p 8080:8080 \
  -e NODE_ENV=production \
  -e PORT=8080 \
  -e JWT_SECRET=sua-chave-jwt \
  -e DATABASE_URL=postgresql://user:pass@host:port/db \
  --name segtrack-backend \
  segtrack-backend
```

### 3. Usando Docker Compose

```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - PORT=8080
      - JWT_SECRET=sua-chave-jwt
      - DATABASE_URL=postgresql://user:pass@host:port/db
    depends_on:
      - postgres
```

## 🔍 Verificação de Ambiente

### Script de Verificação

```bash
# Verificar variáveis de ambiente
npm run check:env

# Iniciar com verificação
npm run start:check
```

### O que o script verifica:

- ✅ NODE_ENV (development/production/test)
- ✅ PORT (número válido)
- ✅ DATABASE_URL (formato postgresql://)
- ✅ JWT_SECRET (definida)
- ⚠️ BASE_URL (opcional)
- ⚠️ FRONTEND_URL (opcional)

## 🚨 Solução de Problemas

### Erro: "Invalid environment variables"

1. Verifique se todas as variáveis obrigatórias estão definidas
2. Execute `npm run check:env` para diagnóstico
3. Verifique o formato da DATABASE_URL

### Erro: "DATABASE_URL must start with postgresql://"

1. A URL deve começar com `postgresql://` ou `postgres://`
2. Exemplo correto: `postgresql://user:pass@host:port/db`
3. Verifique se não há espaços ou caracteres especiais

### Erro: "PrismaClientInitializationError"

1. Verifique se a DATABASE_URL está correta
2. Confirme se o banco está acessível
3. Verifique se o Prisma Client foi gerado: `npm run prisma:generate`

## 📁 Arquivos de Configuração

- `env.example` - Exemplo de variáveis de ambiente
- `railway.env` - Configuração para Railway
- `gcp.env` - Configuração para Google Cloud
- `railway.json` - Configuração específica do Railway
- `app.yaml` - Configuração do Google Cloud
- `Dockerfile` - Configuração do Docker

## 🔐 Segurança

### JWT_SECRET

- **NUNCA** use a chave padrão em produção
- Use uma chave de pelo menos 32 caracteres
- Gere uma chave segura: `openssl rand -base64 32`

### DATABASE_URL

- Use credenciais específicas para produção
- Não compartilhe credenciais no código
- Use variáveis de ambiente ou secrets managers

## 📞 Suporte

Se encontrar problemas:

1. Execute `npm run check:env`
2. Verifique os logs do deploy
3. Confirme as variáveis de ambiente
4. Teste localmente primeiro

---

**🎉 Deploy configurado e pronto para uso!**
