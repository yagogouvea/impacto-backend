const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function verificarUsuarioProducao() {
  try {
    console.log('🔍 Verificando usuários com role "usuario" em produção...');

    const usuarios = await prisma.user.findMany({
      where: {
        role: 'usuario',
        active: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
        active: true
      }
    });

    console.log(`📊 Encontrados ${usuarios.length} usuários com role "usuario"`);

    usuarios.forEach((usuario, index) => {
      console.log(`\n👤 Usuário ${index + 1}:`);
      console.log(`   ID: ${usuario.id}`);
      console.log(`   Nome: ${usuario.name}`);
      console.log(`   Email: ${usuario.email}`);
      console.log(`   Role: ${usuario.role}`);
      console.log(`   Ativo: ${usuario.active}`);

      let permissions;
      try {
        permissions = Array.isArray(usuario.permissions)
          ? usuario.permissions
          : JSON.parse(usuario.permissions || '[]');
      } catch (e) {
        console.log('   ❌ Erro ao parsear permissões');
        return;
      }

      console.log(`   📋 Total de permissões: ${permissions.length}`);

      // Verificar permissões específicas
      const permissoesChave = ['delete:user', 'usuarios:delete'];

      console.log('   🔍 Permissões importantes:');
      permissoesChave.forEach(perm => {
        if (permissions.includes(perm)) {
          console.log(`      ✅ ${perm}`);
        } else {
          console.log(`      ❌ ${perm} - FALTANDO!`);
        }
      });

      console.log('   📝 Todas as permissões:');
      permissions.forEach(perm => console.log(`      ${perm}`));
    });

  } catch (error) {
    console.error('❌ Erro ao verificar usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarUsuarioProducao();
