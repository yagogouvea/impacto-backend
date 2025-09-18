#!/usr/bin/env node
/**
 * Script para corrigir permissões do usuário teste@teste no backend Impacto
 * Execute: node corrigir-permissoes-teste.js
 */

const { PrismaClient } = require('@prisma/client');

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

async function corrigirPermissoesTeste() {
  try {
    console.log('🔧 Corrigindo permissões do usuário teste@teste - Backend Impacto...');
    console.log('📊 DATABASE_URL:', process.env.DATABASE_URL ? 'Definida' : 'Não definida');

    // 1. Verificar conexão com banco
    console.log('📡 Verificando conexão com banco de dados...');
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida!');

    // 2. Buscar usuário teste@teste
    console.log('👤 Buscando usuário teste@teste...');
    
    const usuario = await prisma.user.findUnique({
      where: { email: 'teste@teste' }
    });

    if (!usuario) {
      console.log('❌ Usuário teste@teste não encontrado!');
      console.log('💡 Criando usuário teste@teste...');
      
      const bcrypt = require('bcryptjs');
      const senhaHash = await bcrypt.hash('123456', 12);
      
      const novoUsuario = await prisma.user.create({
        data: {
          name: 'Usuário Teste Impacto',
          email: 'teste@teste',
          passwordHash: senhaHash,
          role: 'admin',
          permissions: TODAS_PERMISSOES,
          active: true
        }
      });
      
      console.log('✅ Usuário teste@teste criado com sucesso!');
      console.log('📋 Detalhes do usuário:');
      console.log(`   ID: ${novoUsuario.id}`);
      console.log(`   Nome: ${novoUsuario.name}`);
      console.log(`   Email: ${novoUsuario.email}`);
      console.log(`   Role: ${novoUsuario.role}`);
      console.log(`   Ativo: ${novoUsuario.active}`);
      console.log(`   Total de permissões: ${TODAS_PERMISSOES.length}`);
      
    } else {
      console.log('✅ Usuário teste@teste encontrado!');
      console.log('📋 Detalhes atuais:');
      console.log(`   ID: ${usuario.id}`);
      console.log(`   Nome: ${usuario.name}`);
      console.log(`   Email: ${usuario.email}`);
      console.log(`   Role: ${usuario.role}`);
      console.log(`   Ativo: ${usuario.active}`);
      
      // Verificar permissões atuais
      const permissoesAtuais = Array.isArray(usuario.permissions) ? usuario.permissions : JSON.parse(usuario.permissions);
      console.log(`   Permissões atuais: ${permissoesAtuais.length}`);
      
      // Atualizar permissões
      console.log('🔄 Atualizando permissões...');
      
      const usuarioAtualizado = await prisma.user.update({
        where: { email: 'teste@teste' },
        data: {
          permissions: TODAS_PERMISSOES,
          active: true
        }
      });
      
      console.log('✅ Permissões atualizadas com sucesso!');
      console.log('📋 Novos detalhes:');
      console.log(`   Total de permissões: ${TODAS_PERMISSOES.length}`);
    }

    // 3. Verificar permissões específicas de usuários
    console.log('\n📋 Verificando permissões específicas de usuários...');
    
    const permissoesUsuarios = [
      'access:usuarios',
      'create:usuarios',
      'update:usuarios',
      'delete:usuarios',
      'create:user',
      'read:user',
      'update:user',
      'delete:user'
    ];
    
    console.log('🔍 Permissões de usuários:');
    permissoesUsuarios.forEach(perm => {
      if (TODAS_PERMISSOES.includes(perm)) {
        console.log(`   ✅ ${perm}`);
      } else {
        console.log(`   ❌ ${perm} - FALTANDO!`);
      }
    });

    // 4. Resumo final
    console.log('\n🎉 Permissões do usuário teste@teste corrigidas!');
    console.log('\n🔑 Credenciais de Login:');
    console.log('   Email: teste@teste');
    console.log('   Senha: 123456');
    console.log('\n✅ Agora o usuário pode:');
    console.log('   - Acessar a página de usuários');
    console.log('   - Criar novos usuários');
    console.log('   - Editar usuários existentes');
    console.log('   - Excluir usuários');
    console.log('\n🌐 URLs:');
    console.log('   Frontend: http://localhost:5173 (ou porta configurada)');
    console.log('   Backend: http://localhost:3001');

  } catch (error) {
    console.error('❌ Erro ao corrigir permissões:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  corrigirPermissoesTeste();
}

module.exports = { corrigirPermissoesTeste };
