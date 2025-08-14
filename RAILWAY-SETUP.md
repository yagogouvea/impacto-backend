# 🚂 Configuração do Railway - Backend Costa

## 🚨 **Problema Atual**
```
Can't reach database server at `postgres.railway.internal:5432`
```

## 🔧 **Solução: Configurar PostgreSQL no Railway**

### **1. Criar Serviço PostgreSQL**

1. **Acesse o Railway Dashboard**
   - Vá para [railway.app](https://railway.app)
   - Faça login na sua conta

2. **Criar Novo Projeto**
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Conecte seu repositório `cliente-costa/backend-costa`

3. **Adicionar Serviço PostgreSQL**
   - No seu projeto, clique em "New Service"
   - Selecione "Database" → "PostgreSQL"
   - Aguarde a criação do banco

### **2. Configurar Variáveis de Ambiente**

#### **Via Interface do Railway:**

1. **Selecione o serviço PostgreSQL**
   - Clique no serviço PostgreSQL criado
   - Vá para a aba "Variables"

2. **Copiar DATABASE_URL**
   - A variável `DATABASE_URL` será criada automaticamente
   - Copie o valor completo

3. **Configurar Backend**
   - Vá para o serviço do seu backend
   - Na aba "Variables", adicione:
   ```bash
   DATABASE_URL=[valor_copiado_do_postgresql]
   NODE_ENV=production
   PORT=8080
   JWT_SECRET=sua-chave-jwt-secreta-de-32-caracteres
   ```

#### **Via arquivo railway.json (NÃO RECOMENDADO para DATABASE_URL):**

```json
{
  "variables": {
    "NODE_ENV": "production",
    "PORT": "8080",
    "JWT_SECRET": "sua-chave-jwt-secreta"
  }
}
```

**⚠️ IMPORTANTE:** Não inclua `DATABASE_URL` no `railway.json` - use a interface do Railway!

### **3. Estrutura do Projeto no Railway**

```
📁 Projeto Costa Backend
├── 🗄️  PostgreSQL Service
│   ├── Variables: DATABASE_URL (automática)
│   └── Connect: postgres.railway.internal:5432
└── 🚀 Backend Service
    ├── Variables: NODE_ENV, PORT, JWT_SECRET
    └── Deploy: npm run start:check
```

### **4. Verificar Conexão**

#### **Script de Teste Local:**

```bash
# Testar conexão com o banco
npm run check:env

# Verificar se DATABASE_URL está correta
echo $DATABASE_URL
```

#### **Logs do Railway:**

1. **Acesse os logs do backend**
   - Vá para o serviço do backend
   - Clique em "Deployments"
   - Verifique os logs mais recentes

2. **Verificar Health Check**
   - O endpoint `/api/health` deve funcionar
   - Verifique se não há erros de conexão

### **5. Problemas Comuns e Soluções**

#### **❌ Erro: "Can't reach database server"**

**Causas:**
- PostgreSQL não foi criado
- Serviços não estão conectados
- Variáveis de ambiente incorretas

**Soluções:**
1. **Criar PostgreSQL primeiro**
2. **Verificar se os serviços estão no mesmo projeto**
3. **Confirmar DATABASE_URL na interface**

#### **❌ Erro: "Invalid DATABASE_URL"**

**Causas:**
- Formato incorreto da URL
- Credenciais inválidas
- Host/porta incorretos

**Soluções:**
1. **Usar DATABASE_URL automática do Railway**
2. **Verificar formato: `postgresql://user:pass@host:port/db`**
3. **Não modificar a URL manualmente**

#### **❌ Erro: "Connection timeout"**

**Causas:**
- Firewall bloqueando
- Configuração de rede incorreta
- Banco não está rodando

**Soluções:**
1. **Verificar se PostgreSQL está ativo**
2. **Confirmar configurações de rede**
3. **Reiniciar serviços se necessário**

### **6. Comandos Úteis**

#### **Verificar Status:**
```bash
# Railway CLI
railway status

# Ver variáveis
railway variables

# Ver logs
railway logs
```

#### **Deploy Manual:**
```bash
# Fazer deploy
railway up

# Ver logs em tempo real
railway logs --follow
```

### **7. Configuração Recomendada**

#### **Variáveis de Ambiente:**
```bash
# Automáticas (Railway)
DATABASE_URL=postgresql://postgres:password@postgres.railway.internal:5432/railway

# Configuradas manualmente
NODE_ENV=production
PORT=8080
JWT_SECRET=sua-chave-jwt-secreta-de-32-caracteres
BASE_URL=https://seu-app.up.railway.app
FRONTEND_URL=https://seu-frontend.com
```

#### **Ordem de Configuração:**
1. ✅ Criar projeto no Railway
2. ✅ Adicionar serviço PostgreSQL
3. ✅ Conectar repositório GitHub
4. ✅ Configurar variáveis de ambiente
5. ✅ Fazer deploy
6. ✅ Verificar logs e health check

### **8. Monitoramento**

#### **Métricas Importantes:**
- **CPU Usage**: Deve estar abaixo de 80%
- **Memory**: Verificar se não está esgotando
- **Database Connections**: Monitorar conexões ativas
- **Response Time**: Health check deve responder em <1s

#### **Alertas Recomendados:**
- CPU > 80%
- Memory > 90%
- Health check falhando
- Database connection errors

---

## 🎯 **Resumo da Solução**

1. **Criar PostgreSQL no Railway** (não usar localhost)
2. **Usar DATABASE_URL automática** (não configurar manualmente)
3. **Conectar serviços no mesmo projeto**
4. **Verificar variáveis de ambiente**
5. **Fazer deploy e monitorar logs**

---

**🚀 Após seguir estes passos, o backend deve conectar ao PostgreSQL do Railway!**
