const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function verificarPermissoesTeste() {
  try {
    console.log('🔍 Verificando permissões do usuário teste@teste...');
    
    const usuario = await prisma.user.findUnique({
      where: { email: 'teste@teste' }
    });
    
    if (!usuario) {
      console.log('❌ Usuário teste@teste não encontrado!');
      return;
    }
    
    console.log('✅ Usuário encontrado:');
    console.log(`   ID: ${usuario.id}`);
    console.log(`   Nome: ${usuario.name}`);
    console.log(`   Email: ${usuario.email}`);
    console.log(`   Role: ${usuario.role}`);
    console.log(`   Ativo: ${usuario.active}`);
    console.log('');
    
    const permissions = Array.isArray(usuario.permissions) ? usuario.permissions : JSON.parse(usuario.permissions);
    console.log(`📋 Total de permissões: ${permissions.length}`);
    
    // Verificar permissões específicas de usuários
    const userPermissions = [
      'access:usuarios',
      'create:usuarios',
      'update:usuarios',
      'delete:usuarios',
      'create:user',
      'read:user',
      'update:user',
      'delete:user'
    ];
    
    console.log('\n🔍 Verificando permissões de usuários:');
    userPermissions.forEach(perm => {
      if (permissions.includes(perm)) {
        console.log(`   ✅ ${perm}`);
      } else {
        console.log(`   ❌ ${perm} - FALTANDO!`);
      }
    });
    
    console.log('\n📝 Todas as permissões:');
    permissions.forEach(perm => console.log(`   ${perm}`));
    
  } catch (error) {
    console.error('❌ Erro ao verificar permissões:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarPermissoesTeste();


