const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Todas as permissões disponíveis no sistema
const TODAS_PERMISSOES = [
  'access:dashboard',
  'access:ocorrencias',
  'access:prestadores',
  'prestadores:export',
  'prestadores:create',
  'prestadores:edit',
  'prestadores:delete',
  'access:financeiro',
  'access:clientes',
  'clientes:create',
  'clientes:edit',
  'clientes:delete',
  'access:relatorios',
  'access:usuarios',
  'usuarios:create',
  'usuarios:edit',
  'usuarios:delete'
];

async function criarUsuarioTeste() {
  try {
    console.log('🚀 Criando usuário teste...');

    // Verificar se o usuário já existe
    const usuarioExistente = await prisma.user.findUnique({
      where: { email: 'teste@teste' }
    });

    if (usuarioExistente) {
      console.log('⚠️  Usuário teste@teste já existe. Atualizando permissões...');
      
      // Atualizar permissões do usuário existente
      await prisma.user.update({
        where: { email: 'teste@teste' },
        data: {
          permissions: TODAS_PERMISSOES,
          role: 'admin',
          active: true
        }
      });
      
      console.log('✅ Usuário teste atualizado com todas as permissões!');
    } else {
      // Criar novo usuário (sem hash de senha por enquanto)
      const novoUsuario = await prisma.user.create({
        data: {
          name: 'Usuário Teste',
          email: 'teste@teste',
          passwordHash: 'temp_hash_123456', // Hash temporário
          role: 'admin',
          permissions: TODAS_PERMISSOES,
          active: true
        }
      });

      console.log('✅ Usuário teste criado com sucesso!');
      console.log('📧 Email: teste@teste');
      console.log('🔑 Senha: 123456 (hash temporário)');
      console.log('👤 Role: admin');
      console.log('🔐 Permissões: Todas (' + TODAS_PERMISSOES.length + ' permissões)');
    }

    // Listar todas as permissões atribuídas
    console.log('\n📋 Permissões atribuídas:');
    TODAS_PERMISSOES.forEach((permissao, index) => {
      console.log(`   ${index + 1}. ${permissao}`);
    });

    console.log('\n⚠️  IMPORTANTE: Você precisará atualizar a senha usando o sistema de autenticação do backend!');

  } catch (error) {
    console.error('❌ Erro ao criar usuário teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar função
criarUsuarioTeste();

