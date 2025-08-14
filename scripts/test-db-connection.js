#!/usr/bin/env node

/**
 * Script para testar conexão com banco de dados
 * Execute: node scripts/test-db-connection.js
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const prisma = new PrismaClient();

async function testDatabaseConnection() {
  console.log('🔍 Testando conexão com banco de dados...\n');
  
  // Verificar se DATABASE_URL está definida
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log('❌ DATABASE_URL não está definida!');
    console.log('💡 Configure esta variável de ambiente primeiro.');
    process.exit(1);
  }
  
  // Verificar formato da URL
  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    console.log('❌ DATABASE_URL com formato inválido!');
    console.log('   Deve começar com "postgresql://" ou "postgres://"');
    console.log(`   Valor atual: ${databaseUrl}`);
    process.exit(1);
  }
  
  console.log('📋 Configuração do banco:');
  console.log(`   URL: ${databaseUrl.substring(0, 50)}...`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'não definido'}`);
  console.log(`   PORT: ${process.env.PORT || 'não definido'}\n`);
  
  try {
    console.log('🔄 Tentando conectar ao banco...');
    
    // Testar conexão
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Testar query simples
    console.log('🔄 Testando query simples...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query executada com sucesso:', result);
    
    // Verificar versão do PostgreSQL
    console.log('🔄 Verificando versão do PostgreSQL...');
    const version = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Versão do PostgreSQL:', version[0].version);
    
    console.log('\n🎉 Banco de dados funcionando perfeitamente!');
    
  } catch (error) {
    console.log('❌ Erro ao conectar com o banco:');
    console.log(`   Tipo: ${error.constructor.name}`);
    console.log(`   Mensagem: ${error.message}`);
    
    if (error.code) {
      console.log(`   Código: ${error.code}`);
    }
    
    // Sugestões baseadas no erro
    if (error.message.includes("Can't reach database server")) {
      console.log('\n💡 Possíveis soluções:');
      console.log('   1. Verifique se o PostgreSQL está rodando');
      console.log('   2. Confirme se o host e porta estão corretos');
      console.log('   3. Verifique se não há firewall bloqueando');
      console.log('   4. No Railway: confirme se o serviço PostgreSQL foi criado');
    }
    
    if (error.message.includes("authentication failed")) {
      console.log('\n💡 Possíveis soluções:');
      console.log('   1. Verifique usuário e senha');
      console.log('   2. Confirme se o usuário tem permissão de acesso');
      console.log('   3. Verifique se o banco existe');
    }
    
    if (error.message.includes("does not exist")) {
      console.log('\n💡 Possíveis soluções:');
      console.log('   1. Crie o banco de dados primeiro');
      console.log('   2. Verifique o nome do banco na URL');
      console.log('   3. Execute: CREATE DATABASE nome_do_banco;');
    }
    
    process.exit(1);
    
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Conexão fechada.');
  }
}

// Executar teste
testDatabaseConnection().catch(console.error);
