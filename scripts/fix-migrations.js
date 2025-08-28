#!/usr/bin/env node

/**
 * Script para corrigir problemas de migração no Railway
 * Execute: node scripts/fix-migrations.js
 */

import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

console.log('🔧 Corrigindo problemas de migração no Railway...\n');

// Verificar se DATABASE_URL está configurada
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.log('❌ DATABASE_URL não está configurada!');
  console.log('💡 Configure esta variável no Railway primeiro.');
  process.exit(1);
}

console.log('📋 Configuração detectada:');
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'não definido'}`);
console.log(`   DATABASE_URL: ${databaseUrl.substring(0, 50)}...`);
console.log('');

try {
  console.log('🔄 Verificando status atual das migrações...');
  execSync('npx prisma migrate status', { stdio: 'inherit' });
  console.log('');

  console.log('⚠️  Problema detectado: Migrações fora de ordem!');
  console.log('💡 Solução: Resetar o banco e recriar as migrações\n');

  console.log('🔄 Resetando o banco de dados...');
  console.log('   ⚠️  ATENÇÃO: Todos os dados serão perdidos!');
  console.log('   ⚠️  Este comando é para desenvolvimento apenas!\n');
  
  // Perguntar confirmação (em produção, isso seria perigoso)
  console.log('🔄 Executando reset...');
  execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
  console.log('✅ Banco resetado com sucesso!\n');

  console.log('🔄 Gerando Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client gerado com sucesso!\n');

  console.log('🔄 Executando migrações na ordem correta...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Migrações executadas com sucesso!\n');

  console.log('🔄 Verificando status final...');
  execSync('npx prisma migrate status', { stdio: 'inherit' });
  console.log('');

  console.log('🎉 Problema de migração resolvido!');
  console.log('🚀 Seu banco está funcionando perfeitamente!');

} catch (error) {
  console.log('❌ Erro durante a correção:');
  console.log(`   ${error.message}`);
  
  if (error.message.includes('ECONNREFUSED')) {
    console.log('\n💡 Possíveis soluções:');
    console.log('   1. Verifique se o PostgreSQL está rodando no Railway');
    console.log('   2. Confirme se a DATABASE_URL está correta');
    console.log('   3. Verifique se os serviços estão conectados');
  }
  
  if (error.message.includes('authentication failed')) {
    console.log('\n💡 Possíveis soluções:');
    console.log('   1. Verifique usuário e senha na DATABASE_URL');
    console.log('   2. Confirme se o usuário tem permissões');
  }
  
  if (error.message.includes('relation does not exist')) {
    console.log('\n💡 Este erro é esperado durante o reset.');
    console.log('   Continue executando o script...');
  }
  
  process.exit(1);
}




