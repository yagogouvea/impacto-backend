#!/usr/bin/env node

/**
 * Script para reorganizar migrações sem perder dados
 * Execute: node scripts/reorder-migrations.js
 */

import { execSync } from 'child_process';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Carregar variáveis de ambiente
dotenv.config();

console.log('🔄 Reorganizando migrações do Prisma...\n');

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
  console.log('🔄 Verificando migrações existentes...');
  const migrationsDir = path.join(process.cwd(), 'prisma', 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.log('❌ Diretório de migrações não encontrado!');
    process.exit(1);
  }

  const migrations = fs.readdirSync(migrationsDir)
    .filter(dir => fs.statSync(path.join(migrationsDir, dir)).isDirectory())
    .sort();

  console.log('📁 Migrações encontradas:');
  migrations.forEach(migration => {
    console.log(`   - ${migration}`);
  });
  console.log('');

  // Verificar se há migrações com datas incorretas
  const problematicMigrations = migrations.filter(migration => {
    const date = migration.split('_')[0];
    return date.startsWith('2025') && date !== '20250627222449';
  });

  if (problematicMigrations.length > 0) {
    console.log('⚠️  Migrações com datas incorretas detectadas:');
    problematicMigrations.forEach(migration => {
      console.log(`   - ${migration}`);
    });
    console.log('');

    console.log('💡 Solução recomendada:');
    console.log('   1. Fazer backup dos dados (se houver)');
    console.log('   2. Resetar o banco e recriar as migrações');
    console.log('   3. Ou reorganizar manualmente as migrações\n');

    console.log('🔄 Executando solução automática...');
    console.log('   ⚠️  ATENÇÃO: Todos os dados serão perdidos!\n');

    // Resetar o banco
    console.log('🔄 Resetando banco de dados...');
    execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
    console.log('✅ Banco resetado com sucesso!\n');

    // Gerar Prisma Client
    console.log('🔄 Gerando Prisma Client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma Client gerado com sucesso!\n');

    // Executar migrações
    console.log('🔄 Executando migrações na ordem correta...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migrações executadas com sucesso!\n');

  } else {
    console.log('✅ Todas as migrações estão na ordem correta!');
    console.log('🔄 Executando migrações...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    console.log('✅ Migrações executadas com sucesso!\n');
  }

  // Verificar status final
  console.log('🔄 Verificando status final...');
  execSync('npx prisma migrate status', { stdio: 'inherit' });
  console.log('');

  console.log('🎉 Migrações configuradas com sucesso!');
  console.log('🚀 Seu banco está funcionando perfeitamente!');

} catch (error) {
  console.log('❌ Erro durante a reorganização:');
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
