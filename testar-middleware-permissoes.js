const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

// Simulação da função hasPermissionCompat do middleware (CORRIGIDA)
function hasPermissionCompat(needed, perms) {
  if (perms.includes(needed)) return true;

  // Formato recurso:acao (usuarios:create) → legado create:user
  if (needed.startsWith('usuarios:')) {
    const op = needed.split(':')[1];
    const legacyMap = {
      create: 'create:user',
      edit: 'update:user',
      delete: 'delete:user'
    };
    const legacy = legacyMap[op];
    if (legacy && perms.includes(legacy)) return true;
  }

  // Formato acao:recurso (create:usuarios) → novo padrão usuarios:create
  if (needed.endsWith(':usuarios')) {
    const op = needed.split(':')[0];
    const modernMap = {
      create: 'usuarios:create',
      update: 'usuarios:edit',
      delete: 'usuarios:delete',
      access: 'access:usuarios'
    };
    const modern = modernMap[op];
    if (modern && perms.includes(modern)) return true;
  }

  // Mapeamento direto das permissões do frontend - BIDIRECIONAL
  const frontendMap = {
    'usuarios:create': 'create:user',
    'usuarios:edit': 'update:user',
    'usuarios:delete': 'delete:user',
    'usuarios:update': 'update:user'
  };

  // Mapeamento direto (frontend → backend)
  const mapped = frontendMap[needed];
  if (mapped && perms.includes(mapped)) return true;

  // Mapeamento reverso (backend → frontend) - CORREÇÃO PRINCIPAL
  const reverseMap = {
    'create:user': 'usuarios:create',
    'update:user': 'usuarios:edit',
    'delete:user': 'usuarios:delete',
    'read:user': 'access:usuarios'
  };
  const reverseMapped = reverseMap[needed];
  if (reverseMapped && perms.includes(reverseMapped)) return true;

  return false;
}

async function testarPermissoes() {
  try {
    console.log('🔍 Testando lógica de permissões do middleware...');

    // Buscar usuário marcelo que tem usuarios:delete
    const usuario = await prisma.user.findUnique({
      where: { email: 'marcelo@impacto' }
    });

    if (!usuario) {
      console.log('❌ Usuário marcelo@impacto não encontrado!');
      return;
    }

    let permissions;
    try {
      permissions = Array.isArray(usuario.permissions)
        ? usuario.permissions
        : JSON.parse(usuario.permissions || '[]');
    } catch (e) {
      console.log('❌ Erro ao parsear permissões do usuário');
      return;
    }

    console.log('👤 Usuário:', usuario.name);
    console.log('📧 Email:', usuario.email);
    console.log('🎭 Role:', usuario.role);
    console.log('📋 Permissões:', permissions);

    // Testar diferentes cenários
    const testes = [
      'delete:user',      // Permissão esperada pela rota
      'usuarios:delete',  // Permissão que o usuário tem
      'access:usuarios',  // Outra permissão
    ];

    console.log('\n🧪 Testando mapeamento de permissões:');
    testes.forEach(permissao => {
      const resultado = hasPermissionCompat(permissao, permissions);
      console.log(`   ${permissao} → ${resultado ? '✅ PERMITIDO' : '❌ NEGADO'}`);
    });

    // Teste específico do problema
    console.log('\n🎯 Teste específico do problema:');
    const permissaoNecessaria = 'delete:user';
    const permissaoUsuario = 'usuarios:delete';

    console.log(`   Permissão necessária pela rota: ${permissaoNecessaria}`);
    console.log(`   Permissão que o usuário tem: ${permissaoUsuario}`);
    console.log(`   Usuário tem a permissão necessária? ${permissions.includes(permissaoNecessaria) ? 'SIM' : 'NÃO'}`);
    console.log(`   Mapeamento funciona? ${hasPermissionCompat(permissaoNecessaria, permissions) ? 'SIM' : 'NÃO'}`);

  } catch (error) {
    console.error('❌ Erro ao testar permissões:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testarPermissoes();
