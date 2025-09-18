#!/usr/bin/env node
/**
 * Script para criar usuário com todas as permissões
 * Execute: node criar-usuario-completo.js
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

async function criarUsuarioCompleto() {
  try {
    console.log('🚀 Criando usuário com todas as permissões - Cliente Impacto...');
    console.log('📊 DATABASE_URL:', process.env.DATABASE_URL ? 'Definida' : 'Não definida');

    // 1. Verificar conexão com banco
    console.log('📡 Verificando conexão com banco de dados...');
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida!');

    // 2. Criar usuário com todas as permissões
    console.log('👤 Criando usuário com todas as permissões...');
    
    const emailUsuario = 'admin@impactopr.seg.br';
    const senhaUsuario = '123456';
    const nomeUsuario = 'Admin Impacto - Usuário Completo';
    
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

    // 3. Verificar permissões criadas
    console.log('\n📋 Permissões atribuídas:');
    console.log('   Total de permissões:', TODAS_PERMISSOES.length);
    console.log('');
    
    // Agrupar permissões por categoria
    const permissoesPorCategoria = {
      'Acesso às Páginas': TODAS_PERMISSOES.filter(p => p.startsWith('access:')),
      'Funcionalidades de Prestadores': TODAS_PERMISSOES.filter(p => p.startsWith('prestadores:')),
      'Funcionalidades de Clientes': TODAS_PERMISSOES.filter(p => p.startsWith('clientes:')),
      'Funcionalidades de Usuários': TODAS_PERMISSOES.filter(p => p.includes('usuarios') || p.includes('user')),
      'Outras Funcionalidades': TODAS_PERMISSOES.filter(p => 
        !p.startsWith('access:') && 
        !p.startsWith('prestadores:') && 
        !p.startsWith('clientes:') && 
        !p.includes('usuarios') && 
        !p.includes('user')
      )
    };
    
    Object.entries(permissoesPorCategoria).forEach(([categoria, permissoes]) => {
      if (permissoes.length > 0) {
        console.log(`   ${categoria}: ${permissoes.length} permissões`);
        permissoes.forEach(perm => console.log(`     ✅ ${perm}`));
        console.log('');
      }
    });

    // 4. Resumo final
    console.log('🎉 Usuário configurado com sucesso!');
    console.log('\n🔑 Credenciais de Login:');
    console.log(`   Email: ${emailUsuario}`);
    console.log(`   Senha: ${senhaUsuario}`);
    console.log('\n⚠️ IMPORTANTE: Altere a senha após o primeiro login!');
    console.log('\n🌐 URLs de produção:');
    console.log('   Frontend: https://painel.impactopr.seg.br');
    console.log('   API: https://api.impactopr.seg.br');
    console.log('   Prestadores: https://prestador.impactopr.seg.br');

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    
    if (error.code === 'P1001') {
      console.log('\n💡 Dica: Verifique se a URL do banco de dados está correta');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  criarUsuarioCompleto();
}

module.exports = { criarUsuarioCompleto };
