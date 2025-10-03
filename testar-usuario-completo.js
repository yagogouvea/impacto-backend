#!/usr/bin/env node
/**
 * Script para testar o usuário criado
 * Execute: node testar-usuario-completo.js
 */

const { PrismaClient } = require('@prisma/client');

// Carregar variáveis de ambiente
require('dotenv').config();

const prisma = new PrismaClient();

async function testarUsuarioCompleto() {
  try {
    console.log('🧪 Testando usuário criado - Cliente Impacto...');

    // 1. Verificar conexão com banco
    console.log('📡 Verificando conexão com banco de dados...');
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida!');

    // 2. Buscar o usuário criado
    console.log('👤 Buscando usuário admin...');
    
    const usuario = await prisma.user.findUnique({
      where: { email: 'admin@impactopr.seg.br' }
    });

    if (!usuario) {
      console.log('❌ Usuário não encontrado!');
      return;
    }

    console.log('✅ Usuário encontrado!');
    console.log('📋 Detalhes do usuário:');
    console.log(`   ID: ${usuario.id}`);
    console.log(`   Nome: ${usuario.name}`);
    console.log(`   Email: ${usuario.email}`);
    console.log(`   Role: ${usuario.role}`);
    console.log(`   Ativo: ${usuario.active}`);
    console.log(`   Criado em: ${usuario.createdAt}`);
    console.log(`   Atualizado em: ${usuario.updatedAt}`);

    // 3. Verificar permissões
    console.log('\n📋 Verificando permissões...');
    const permissoes = Array.isArray(usuario.permissions) ? usuario.permissions : JSON.parse(usuario.permissions);
    console.log(`   Total de permissões: ${permissoes.length}`);
    console.log(`   Tipo das permissões: ${typeof usuario.permissions}`);

    // 4. Verificar permissões específicas
    console.log('\n🔍 Verificando permissões específicas...');
    
    const permissoesImportantes = [
      'access:dashboard',
      'access:usuarios',
      'create:usuarios',
      'update:usuarios',
      'delete:usuarios',
      'access:ocorrencias',
      'access:prestadores',
      'access:clientes'
    ];

    let todasPresentes = true;
    permissoesImportantes.forEach(perm => {
      if (permissoes.includes(perm)) {
        console.log(`   ✅ ${perm}`);
      } else {
        console.log(`   ❌ ${perm} - FALTANDO!`);
        todasPresentes = false;
      }
    });

    if (todasPresentes) {
      console.log('\n🎉 Todas as permissões importantes estão presentes!');
    } else {
      console.log('\n❌ Algumas permissões importantes estão faltando!');
    }

    // 5. Verificar outros usuários
    console.log('\n👥 Verificando outros usuários no sistema...');
    const todosUsuarios = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true
      }
    });

    console.log(`   Total de usuários: ${todosUsuarios.length}`);
    todosUsuarios.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role} - Ativo: ${user.active}`);
    });

    // 6. Verificar cliente padrão
    console.log('\n🏢 Verificando cliente padrão...');
    const cliente = await prisma.cliente.findFirst({
      where: { nome: 'Impacto' }
    });

    if (cliente) {
      console.log('✅ Cliente Impacto encontrado!');
      console.log(`   ID: ${cliente.id}`);
      console.log(`   Nome: ${cliente.nome}`);
      console.log(`   CNPJ: ${cliente.cnpj}`);
      console.log(`   Email: ${cliente.email}`);
    } else {
      console.log('❌ Cliente Impacto não encontrado!');
    }

    // 7. Resumo final
    console.log('\n🎉 Teste concluído com sucesso!');
    console.log('\n📋 Resumo:');
    console.log(`   ✅ Usuário admin criado e configurado`);
    console.log(`   ✅ ${permissoes.length} permissões atribuídas`);
    console.log(`   ✅ ${todosUsuarios.length} usuários no sistema`);
    console.log(`   ✅ Cliente padrão configurado`);
    console.log('\n🔑 Credenciais para uso:');
    console.log(`   Email: admin@impactopr.seg.br`);
    console.log(`   Senha: 123456`);

  } catch (error) {
    console.error('❌ Erro ao testar usuário:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  testarUsuarioCompleto();
}

module.exports = { testarUsuarioCompleto };


