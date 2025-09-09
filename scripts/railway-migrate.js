#!/usr/bin/env node

/**
 * Script para executar migrações no Railway
 * Execute: node scripts/railway-migrate.js
 */

import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

console.log('🚂 Executando migrações no Railway...\n');

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
  console.log('🔄 Gerando Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma Client gerado com sucesso!\n');

  console.log('🔄 Executando migrações...');
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
  console.log('✅ Migrações executadas com sucesso!\n');

  console.log('🔄 Verificando status do banco...');
  execSync('npx prisma migrate status', { stdio: 'inherit' });
  console.log('✅ Status verificado!\n');

  console.log('🎉 Banco de dados configurado com sucesso no Railway!');
  console.log('🚀 Seu backend está pronto para funcionar!');

} catch (error) {
  console.log('❌ Erro durante a migração:');
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
  
  process.exit(1);
}





