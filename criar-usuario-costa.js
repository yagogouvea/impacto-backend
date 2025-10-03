#!/usr/bin/env node
/**
 * Script para criar usuário Costa no backend Impacto
 * Execute: node criar-usuario-costa.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

// Carregar variáveis de ambiente
require('dotenv').config();

const prisma = new PrismaClient();

// Todas as permissões disponíveis no sistema (formato correto)
const TODAS_PERMISSOES = [
  // Acesso às páginas
  'access:dashboard',
  'access:ocorrencias',
  'access:prestadores',
  'access:financeiro',
  'access:clientes',
  'access:relatorios',
  'access:usuarios',
  
  // Funcionalidades de prestadores
  'prestadores:export',
  'prestadores:create',
  'prestadores:edit',
  'prestadores:delete',
  
  // Funcionalidades de clientes
  'clientes:create',
  'clientes:edit',
  'clientes:delete',
  
  // Funcionalidades de usuários (formato correto)
  'create:usuarios',
  'update:usuarios',
  'delete:usuarios',
  
  // Permissões adicionais para compatibilidade
  'create:user',
  'read:user',
  'update:user',
  'delete:user',
  'create:client',
  'read:client',
  'update:client',
  'delete:client',
  'create:ocorrencia',
  'read:ocorrencia',
  'update:ocorrencia',
  'delete:ocorrencia',
  'create:prestador',
  'read:prestador',
  'update:prestador',
  'delete:prestador',
  'create:contrato',
  'read:contrato',
  'update:contrato',
  'delete:contrato',
  'create:relatorio',
  'read:relatorio',
  'update:relatorio',
  'delete:relatorio',
  'read:dashboard',
  'create:foto',
  'read:foto',
  'update:foto',
  'delete:foto',
  'upload:foto',
  'create:veiculo',
  'read:veiculo',
  'update:veiculo',
  'delete:veiculo',
  'create:rastreamento',
  'read:rastreamento',
  'update:rastreamento',
  'delete:rastreamento',
  'create:pagamento',
  'read:pagamento',
  'update:pagamento',
  'delete:pagamento',
  'create:checklist',
  'read:checklist',
  'update:checklist',
  'delete:checklist',
  'create:apoio',
  'read:apoio',
  'update:apoio',
  'delete:apoio'
];

async function criarUsuarioCosta() {
  try {
    console.log('🚀 Criando usuário Costa no backend Impacto...');
    console.log('📊 DATABASE_URL:', process.env.DATABASE_URL ? 'Definida' : 'Não definida');

    // 1. Verificar conexão com banco
    console.log('📡 Verificando conexão com banco de dados...');
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida!');

    // 2. Criar usuário Costa
    console.log('👤 Criando usuário Costa...');
    
    const emailUsuario = 'admin@costa.com.br';
    const senhaUsuario = '123456';
    const nomeUsuario = 'Admin Costa - Backend Impacto';
    
    // Verificar se o usuário já existe
    const usuarioExistente = await prisma.user.findUnique({
      where: { email: emailUsuario }
    });

    if (usuarioExistente) {
      console.log('⚠️ Usuário já existe, atualizando permissões...');
      
      // Atualizar permissões do usuário existente
      const usuarioAtualizado = await prisma.user.update({
        where: { email: emailUsuario },
        data: {
          permissions: TODAS_PERMISSOES,
          active: true
        }
      });
      
      console.log('✅ Usuário atualizado com sucesso!');
      console.log('📋 Detalhes do usuário:');
      console.log(`   ID: ${usuarioAtualizado.id}`);
      console.log(`   Nome: ${usuarioAtualizado.name}`);
      console.log(`   Email: ${usuarioAtualizado.email}`);
      console.log(`   Role: ${usuarioAtualizado.role}`);
      console.log(`   Ativo: ${usuarioAtualizado.active}`);
      console.log(`   Total de permissões: ${TODAS_PERMISSOES.length}`);
      
    } else {
      console.log('🆕 Criando novo usuário...');
      
      const senhaHash = await bcrypt.hash(senhaUsuario, 12);
      
      const usuario = await prisma.user.create({
        data: {
          name: nomeUsuario,
          email: emailUsuario,
          passwordHash: senhaHash,
          role: 'admin',
          permissions: TODAS_PERMISSOES,
          active: true
        }
      });
      
      console.log('✅ Usuário criado com sucesso!');
      console.log('📋 Detalhes do usuário:');
      console.log(`   ID: ${usuario.id}`);
      console.log(`   Nome: ${usuario.name}`);
      console.log(`   Email: ${usuario.email}`);
      console.log(`   Role: ${usuario.role}`);
      console.log(`   Ativo: ${usuario.active}`);
      console.log(`   Total de permissões: ${TODAS_PERMISSOES.length}`);
    }

    // 3. Resumo final
    console.log('\n🎉 Usuário Costa configurado com sucesso!');
    console.log('\n🔑 Credenciais de Login:');
    console.log(`   Email: ${emailUsuario}`);
    console.log(`   Senha: ${senhaUsuario}`);
    console.log('\n⚠️ IMPORTANTE: Este usuário agora funciona no backend Impacto!');
    console.log('\n🌐 URLs:');
    console.log('   Frontend: http://localhost:5173 (ou porta configurada)');
    console.log('   Backend: http://localhost:3001');

  } catch (error) {
    console.error('❌ Erro ao criar usuário Costa:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  criarUsuarioCosta();
}

module.exports = { criarUsuarioCosta };


