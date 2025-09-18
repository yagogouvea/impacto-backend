#!/usr/bin/env node
/**
 * Script para verificar e corrigir a URL do banco de dados
 * Execute: node fix-database-url.js
 */

const fs = require('fs');
const path = require('path');

function fixDatabaseUrl() {
  console.log('🔧 Verificando e corrigindo URL do banco de dados...');
  
  const envPath = path.join(__dirname, '.env');
  const envLocalPath = path.join(__dirname, '.env.local');
  
  // Verificar se existe arquivo .env
  if (fs.existsSync(envPath)) {
    console.log('📄 Arquivo .env encontrado');
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    console.log('📋 Conteúdo do .env:');
    console.log(envContent);
    
    // Verificar se a URL do banco está correta
    if (envContent.includes('postgres.railway.internal')) {
      console.log('⚠️ URL do banco parece ser interna do Railway');
      console.log('💡 Para desenvolvimento local, você precisa de uma URL externa');
      console.log('💡 Para produção, verifique se o banco está acessível');
    }
  } else {
    console.log('❌ Arquivo .env não encontrado');
  }
  
  // Verificar se existe arquivo .env.local
  if (fs.existsSync(envLocalPath)) {
    console.log('📄 Arquivo .env.local encontrado');
    
    const envLocalContent = fs.readFileSync(envLocalPath, 'utf8');
    console.log('📋 Conteúdo do .env.local:');
    console.log(envLocalContent);
  } else {
    console.log('❌ Arquivo .env.local não encontrado');
  }
  
  // Criar arquivo .env.local para desenvolvimento
  console.log('\n🔧 Criando arquivo .env.local para desenvolvimento...');
  
  const envLocalContent = `# Configuração local para desenvolvimento
NODE_ENV=development

# Banco de dados PostgreSQL local (para desenvolvimento)
# Você pode usar um banco local ou criar um novo no Railway
DATABASE_URL=postgresql://postgres:password@localhost:5432/impacto_dev

# Chave JWT para desenvolvimento
JWT_SECRET=dev_jwt_secret_key_2025_impacto

# URLs do frontend
FRONTEND_URL=http://localhost:3000

# Configurações de CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Porta do servidor
PORT=3001

# Configurações de upload
UPLOAD_MAX_SIZE=10485760
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,application/pdf

# Configurações de segurança
BCRYPT_ROUNDS=10
SESSION_SECRET=dev_session_secret_2025

# Logs
LOG_LEVEL=debug

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Configurações específicas do Impacto
CLIENTE_NOME=Impacto
CLIENTE_DOMINIO=impactopr.seg.br
CLIENTE_EMAIL_CONTATO=contato@impactopr.seg.br
`;
  
  try {
    fs.writeFileSync(envLocalPath, envLocalContent);
    console.log('✅ Arquivo .env.local criado com sucesso!');
  } catch (error) {
    console.log('❌ Erro ao criar arquivo .env.local:', error.message);
  }
  
  console.log('\n📋 Próximos passos:');
  console.log('1. Para desenvolvimento local:');
  console.log('   - Instale o PostgreSQL');
  console.log('   - Crie um banco chamado "impacto_dev"');
  console.log('   - Execute: node setup-local-db.js');
  console.log('');
  console.log('2. Para produção no Railway:');
  console.log('   - Verifique se o banco PostgreSQL está rodando');
  console.log('   - Copie a URL de conexão correta');
  console.log('   - Execute: node setup-railway-db.js');
  console.log('');
  console.log('3. Para testar conexão:');
  console.log('   - Execute: node test-db-connection.js');
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  fixDatabaseUrl();
}

module.exports = { fixDatabaseUrl };
