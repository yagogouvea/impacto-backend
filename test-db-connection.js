#!/usr/bin/env node
/**
 * Script para testar conexão com o banco de dados
 * Execute: node test-db-connection.js
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function testDatabaseConnection() {
  console.log('🔍 Testando conexão com o banco de dados...');
  
  const prisma = new PrismaClient();
  
  try {
    // Testar conexão básica
    console.log('📡 Testando conexão básica...');
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Testar query simples
    console.log('📊 Testando query simples...');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Query executada com sucesso:', result);
    
    // Verificar se as tabelas existem
    console.log('📋 Verificando tabelas existentes...');
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    console.log('✅ Tabelas encontradas:', tables);
    
    // Verificar status das migrações
    console.log('🔄 Verificando status das migrações...');
    const migrations = await prisma.$queryRaw`
      SELECT * FROM _prisma_migrations 
      ORDER BY finished_at DESC 
      LIMIT 5
    `;
    console.log('✅ Últimas migrações:', migrations);
    
  } catch (error) {
    console.error('❌ Erro na conexão:', error.message);
    
    if (error.code === 'P1001') {
      console.log('💡 Dica: Verifique se a URL do banco de dados está correta');
      console.log('   DATABASE_URL atual:', process.env.DATABASE_URL ? 'Definida' : 'Não definida');
    }
    
    if (error.code === 'P1003') {
      console.log('💡 Dica: O banco de dados não existe ou não está acessível');
    }
    
    if (error.code === 'P1017') {
      console.log('💡 Dica: Conexão com o banco foi fechada pelo servidor');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Executar teste
testDatabaseConnection();
