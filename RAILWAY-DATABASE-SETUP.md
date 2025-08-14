# 🗄️ Configuração do Banco de Dados no Railway

## 🎯 **Objetivo**
Configurar o PostgreSQL no Railway e criar todas as tabelas necessárias para o backend Costa.

## 📋 **Pré-requisitos**
- ✅ Projeto criado no Railway
- ✅ Serviço PostgreSQL adicionado
- ✅ Backend conectado ao repositório GitHub
- ✅ DATABASE_URL configurada

## 🔧 **Passo a Passo**

### **1. Configurar Variáveis de Ambiente**

No seu projeto do Railway, configure estas variáveis no serviço do backend:

```bash
DATABASE_URL=postgresql://postgres:HhmaJkninjTpjbpXJOHjkmFdnliWTIgE@postgres.railway.internal:5432/railway
NODE_ENV=production
PORT=8080
JWT_SECRET=sua-chave-jwt-secreta-de-32-caracteres
```

### **2. Executar Migrações**

#### **Opção A: Via Railway CLI (Recomendado)**

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Fazer login
railway login

# Conectar ao projeto
railway link

# Executar migração
railway run npm run railway:migrate
```

#### **Opção B: Via Script Local**

```bash
# Configurar DATABASE_URL localmente
export DATABASE_URL="postgresql://postgres:HhmaJkninjTpjbpXJOHjkmFdnliWTIgE@postgres.railway.internal:5432/railway"

# Executar migração
npm run railway:migrate
```

#### **Opção C: Via Deploy Automático**

1. **Faça commit das mudanças**
2. **Push para o GitHub**
3. **O Railway fará deploy automático**
4. **Execute via logs do Railway**

### **3. Comandos Disponíveis**

```bash
# Migração completa no Railway
npm run railway:migrate

# Corrigir problemas de migração (reset completo)
npm run fix:migrations

# Reorganizar migrações (mais seguro)
npm run reorder:migrations

# Apenas gerar Prisma Client
npm run prisma:generate

# Apenas executar migrações
npm run prisma:migrate:deploy

# Resetar banco (cuidado!)
npm run prisma:migrate:reset

# Abrir Prisma Studio (para visualizar dados)
npm run prisma:studio

# Testar conexão com banco
npm run test:db

# Verificar variáveis de ambiente
npm run check:env
```

## 🗂️ **Tabelas que Serão Criadas**

### **Tabelas Principais:**
- `Cliente` - Informações dos clientes
- `ClienteAuth` - Autenticação de clientes
- `Contrato` - Contratos dos clientes
- `Prestador` - Prestadores de serviço
- `Ocorrencia` - Ocorrências/incidentes
- `User` - Usuários do sistema
- `UsuarioPrestador` - Usuários prestadores

### **Tabelas de Relacionamento:**
- `CampoAdicionalCliente` - Campos customizados
- `FotoOcorrencia` - Fotos das ocorrências
- `Relatorio` - Relatórios em PDF
- `RastreamentoPrestador` - Rastreamento GPS
- `PagamentosPrestadores` - Pagamentos customizados

## 🔍 **Verificação da Configuração**

### **1. Verificar Status das Migrações**

```bash
# Via Railway CLI
railway run npx prisma migrate status

# Via script local
npm run railway:migrate
```

### **2. Verificar Conexão**

```bash
# Testar conexão
npm run test:db

# Verificar health check
curl https://seu-app.up.railway.app/api/health
```

### **3. Verificar Logs**

No Railway Dashboard:
1. Vá para o serviço do backend
2. Clique em "Deployments"
3. Verifique os logs mais recentes
4. Procure por mensagens de sucesso das migrações

## 🚨 **Solução de Problemas**

### **Erro: "Can't reach database server"**

**Causas:**
- PostgreSQL não foi criado
- Serviços não estão conectados
- DATABASE_URL incorreta

**Soluções:**
1. **Criar PostgreSQL primeiro**
2. **Verificar se os serviços estão no mesmo projeto**
3. **Confirmar DATABASE_URL na interface**

### **Erro: "authentication failed"**

**Causas:**
- Usuário/senha incorretos
- Usuário sem permissões
- Banco não existe

**Soluções:**
1. **Verificar credenciais na DATABASE_URL**
2. **Confirmar se o usuário tem permissões**
3. **Criar banco se necessário**

### **Erro: "relation does not exist"**

**Causas:**
- Migrações não foram executadas
- Schema desatualizado
- Banco vazio
- **Migrações fora de ordem (problema comum!)**

**Soluções:**
1. **Executar migrações: `npm run railway:migrate`**
2. **Verificar se o schema está correto**
3. **Confirmar se as migrações foram aplicadas**
4. **Corrigir ordem das migrações: `npm run reorder:migrations`**

### **Erro: "Migration failed to apply - relation does not exist"**

**Causa específica:**
- A migração `20250101000000_add_logo_to_cliente` está tentando adicionar uma coluna na tabela `Cliente` antes da tabela ser criada

**Solução recomendada:**
```bash
# Opção 1: Reorganizar migrações (mais seguro)
npm run reorder:migrations

# Opção 2: Reset completo (perde todos os dados)
npm run fix:migrations

# Opção 3: Manual (para desenvolvedores avançados)
npm run prisma:migrate:reset
npm run prisma:generate
npm run prisma:migrate:deploy
```

## 📊 **Monitoramento**

### **Métricas Importantes:**
- **Conexões ativas** com o banco
- **Tempo de resposta** das queries
- **Uso de memória** do PostgreSQL
- **Espaço em disco** utilizado

### **Alertas Recomendados:**
- Conexões > 80% da capacidade
- Tempo de resposta > 1s
- Uso de disco > 90%
- Erros de conexão frequentes

## 🎉 **Após a Configuração**

### **O que deve funcionar:**
1. ✅ Backend conecta ao PostgreSQL
2. ✅ Todas as tabelas estão criadas
3. ✅ Health check responde corretamente
4. ✅ API endpoints funcionam
5. ✅ Autenticação JWT funciona

### **Próximos passos:**
1. **Testar endpoints da API**
2. **Configurar dados iniciais**
3. **Implementar autenticação**
4. **Configurar frontend**

---

## 🚀 **Resumo Rápido**

```bash
# 1. Configure as variáveis no Railway
DATABASE_URL=postgresql://postgres:HhmaJkninjTpjbpXJOHjkmFdnliWTIgE@postgres.railway.internal:5432/railway

# 2. Execute a migração
npm run railway:migrate

# 3. Verifique se funcionou
npm run test:db

# 4. Teste o health check
curl https://seu-app.up.railway.app/api/health
```

---

**🎯 Após seguir estes passos, seu banco estará configurado e funcionando no Railway!**
