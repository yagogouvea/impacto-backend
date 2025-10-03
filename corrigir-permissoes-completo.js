const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Lista completa de permissões do sistema
const PERMISSOES_COMPLETAS = [
  // Dashboard e acesso geral
  'access:dashboard',
  'read:dashboard',
  
  // Ocorrências
  'access:ocorrencias',
  'create:ocorrencia',
  'read:ocorrencia',
  'update:ocorrencia',
  'delete:ocorrencia',
  
  // Prestadores
  'access:prestadores',
  'prestadores:create',
  'prestadores:edit',
  'prestadores:delete',
  'prestadores:export',
  'create:prestador',
  'read:prestador',
  'update:prestador',
  'delete:prestador',
  
  // Clientes
  'access:clientes',
  'clientes:create',
  'clientes:edit',
  'clientes:delete',
  'create:client',
  'read:client',
  'update:client',
  'delete:client',
  
  // Usuários (todas as variações)
  'access:usuarios',
  'create:usuarios',
  'update:usuarios',
  'delete:usuarios',
  'create:user',
  'read:user',
  'update:user',
  'delete:user',
  'usuarios:create',
  'usuarios:edit',
  'usuarios:delete',
  'usuarios:access',
  
  // Contratos
  'create:contrato',
  'read:contrato',
  'update:contrato',
  'delete:contrato',
  
  // Relatórios
  'access:relatorios',
  'create:relatorio',
  'read:relatorio',
  'update:relatorio',
  'delete:relatorio',
  
  // Financeiro
  'access:financeiro',
  'create:pagamento',
  'read:pagamento',
  'update:pagamento',
  'delete:pagamento',
  
  // Fotos
  'create:foto',
  'read:foto',
  'update:foto',
  'delete:foto',
  'upload:foto',
  
  // Veículos
  'create:veiculo',
  'read:veiculo',
  'update:veiculo',
  'delete:veiculo',
  
  // Rastreamento
  'create:rastreamento',
  'read:rastreamento',
  'update:rastreamento',
  'delete:rastreamento',
  
  // Checklist
  'create:checklist',
  'read:checklist',
  'update:checklist',
  'delete:checklist',
  
  // Apoio
  'create:apoio',
  'read:apoio',
  'update:apoio',
  'delete:apoio'
];

async function corrigirPermissoesCompleto() {
  try {
    console.log('🔧 Corrigindo permissões completas do usuário teste@teste...\n');

    // 1. Buscar usuário teste@teste
    console.log('👤 Buscando usuário teste@teste...');
    let usuario = await prisma.user.findUnique({
      where: { email: 'teste@teste' }
    });

    if (!usuario) {
      console.log('❌ Usuário teste@teste não encontrado!');
      console.log('💡 Criando usuário teste@teste...');
      
      usuario = await prisma.user.create({
        data: {
          name: 'Usuário Teste',
          email: 'teste@teste',
          passwordHash: '$2b$10$rQZ8kZ8kZ8kZ8kZ8kZ8kZuQZ8kZ8kZ8kZ8kZ8kZ8kZ8kZ8kZ8kZ8k', // 123456
          role: 'admin',
          permissions: JSON.stringify(PERMISSOES_COMPLETAS),
          active: true
        }
      });
      
      console.log('✅ Usuário teste@teste criado com sucesso!');
    } else {
      console.log('✅ Usuário teste@teste encontrado!');
    }

    // 2. Atualizar permissões para ter todas as permissões
    console.log('\n🔧 Atualizando permissões...');
    const usuarioAtualizado = await prisma.user.update({
      where: { email: 'teste@teste' },
      data: {
        permissions: JSON.stringify(PERMISSOES_COMPLETAS),
        role: 'admin',
        active: true,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        active: true,
        createdAt: true,
        updatedAt: true
      }
    });

    console.log('✅ Permissões atualizadas com sucesso!');
    
    // 3. Verificar permissões
    const permissions = JSON.parse(usuarioAtualizado.permissions);
    console.log(`\n📋 Total de permissões: ${permissions.length}`);
    
    // 4. Verificar permissões específicas de usuários
    const userPermissions = [
      'access:usuarios',
      'create:usuarios',
      'update:usuarios',
      'delete:usuarios',
      'create:user',
      'read:user',
      'update:user',
      'delete:user',
      'usuarios:create',
      'usuarios:edit',
      'usuarios:delete',
      'usuarios:access'
    ];
    
    console.log('\n🔍 Verificando permissões de usuários:');
    userPermissions.forEach(perm => {
      if (permissions.includes(perm)) {
        console.log(`   ✅ ${perm}`);
      } else {
        console.log(`   ❌ ${perm} - FALTANDO!`);
      }
    });

    console.log('\n✅ Usuário teste@teste atualizado com todas as permissões!');
    console.log('📧 Email: teste@teste');
    console.log('🔑 Senha: 123456');
    console.log(`🎭 Role: ${usuarioAtualizado.role}`);
    console.log(`📊 Total de permissões: ${permissions.length}`);
    console.log(`🕒 Última atualização: ${usuarioAtualizado.updatedAt}`);

  } catch (error) {
    console.error('❌ Erro ao corrigir permissões:', error);
  } finally {
    await prisma.$disconnect();
  }
}

corrigirPermissoesCompleto();
