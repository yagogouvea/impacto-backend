# 🚀 Configuração da API em Produção

## 📋 Checklist de Deploy

### 1. **Variáveis de Ambiente (Railway)**
```bash
NODE_ENV=production
PORT=8080
JWT_SECRET=sua-chave-jwt-secreta-aqui
BASE_URL=https://api.costaecamargo.seg.br
FRONTEND_URL=https://painel.costaecamargo.seg.br
CORS_ORIGINS=https://painel.costaecamargo.seg.br,https://cliente.painelsegtrack.com.br,https://app.painelsegtrack.com.br
```

### 2. **Banco de Dados**
- ✅ Serviço PostgreSQL criado no Railway
- ✅ DATABASE_URL configurada automaticamente
- ✅ Migrações executadas: `npm run prisma:migrate:deploy`
- ✅ Prisma Client gerado: `npm run prisma:generate`

### 3. **Verificações Pós-Deploy**
```bash
# Testar health check
curl https://api.costaecamargo.seg.br/api/health

# Testar status da API
curl https://api.costaecamargo.seg.br/api/status

# Testar autenticação
curl -X POST https://api.costaecamargo.seg.br/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@costa.com.br","senha":"123456"}'
```

### 4. **Logs de Produção**
- ✅ Verificar logs do Railway para erros
- ✅ Monitorar requisições CORS
- ✅ Verificar conexões com banco de dados

### 5. **Problemas Comuns e Soluções**

#### ❌ Erro 400 em /api/ocorrencias
- **Causa**: Parâmetros de query inválidos
- **Solução**: Validar parâmetros no frontend

#### ❌ Erro 500 em /api/clientes
- **Causa**: Problema de conexão com banco
- **Solução**: Verificar DATABASE_URL e migrações

#### ❌ Erro CORS
- **Causa**: Origem não permitida
- **Solução**: Verificar CORS_ORIGINS no Railway

### 6. **Monitoramento**
- Health check: `/api/health`
- Status da API: `/api/status`
- Logs detalhados em todas as requisições
- Tratamento de erros com códigos HTTP apropriados

## 🔧 Comandos Úteis

```bash
# Verificar status do banco
npm run test:db

# Executar migrações
npm run prisma:migrate:deploy

# Gerar Prisma Client
npm run prisma:generate

# Verificar variáveis de ambiente
npm run check:env
```
