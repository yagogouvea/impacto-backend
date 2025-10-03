const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

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

async function setupProduction() {
  try {
    console.log('🚀 Configurando ambiente de produção - Cliente Impacto...');

    // 1. Verificar conexão com banco
    console.log('📊 Verificando conexão com banco de dados...');
    await prisma.$connect();
    console.log('✅ Conexão com banco estabelecida!');

    // 2. Executar migrations
    console.log('🔄 Executando migrations...');
    // As migrations serão executadas automaticamente pelo Railway

    // 3. Criar usuário admin padrão
    console.log('👤 Criando usuário administrador...');
    
    const adminExistente = await prisma.user.findUnique({
      where: { email: 'admin@impactopr.seg.br' }
    });

    if (!adminExistente) {
      const senhaHash = await bcrypt.hash('admin123', 12);
      
      await prisma.user.create({
        data: {
          name: 'Administrador Impacto',
          email: 'admin@impactopr.seg.br',
          passwordHash: senhaHash,
          role: 'admin',
          permissions: TODAS_PERMISSOES,
          active: true
        }
      });
      
      console.log('✅ Usuário admin criado: admin@impactopr.seg.br / admin123');
    } else {
      console.log('⚠️  Usuário admin já existe');
    }

    // 4. Criar usuário teste
    console.log('🧪 Criando usuário teste...');
    
    const testeExistente = await prisma.user.findUnique({
      where: { email: 'teste@teste' }
    });

    if (!testeExistente) {
      const senhaHash = await bcrypt.hash('123456', 12);
      
      await prisma.user.create({
        data: {
          name: 'Usuário Teste',
          email: 'teste@teste',
          passwordHash: senhaHash,
          role: 'admin',
          permissions: TODAS_PERMISSOES,
          active: true
        }
      });
      
      console.log('✅ Usuário teste criado: teste@teste / 123456');
    } else {
      console.log('⚠️  Usuário teste já existe');
    }

    // 5. Criar cliente padrão Impacto
    console.log('🏢 Criando cliente padrão Impacto...');
    
    const clienteExistente = await prisma.cliente.findFirst({
      where: { nome: 'Impacto' }
    });

    if (!clienteExistente) {
      const cliente = await prisma.cliente.create({
        data: {
          nome: 'Impacto',
          cnpj: '00000000000000',
          contato: 'Administrador',
          telefone: '(11) 99999-9999',
          email: 'contato@impactopr.seg.br',
          endereco: 'Endereço Impacto',
          cidade: 'São Paulo',
          estado: 'SP',
          nome_fantasia: 'Impacto'
        }
      });

      // Criar autenticação para o cliente
      await prisma.clienteAuth.create({
        data: {
          cliente_id: cliente.id,
          cnpj_normalizado: '00000000000000',
          senha_hash: await bcrypt.hash('impacto123', 12),
          ativo: true
        }
      });

      console.log('✅ Cliente Impacto criado com sucesso!');
      console.log('📧 Login cliente: 00000000000000 / impacto123');
    } else {
      console.log('⚠️  Cliente Impacto já existe');
    }

    // 6. Resumo final
    console.log('\n🎉 Configuração de produção concluída!');
    console.log('\n📋 Credenciais criadas:');
    console.log('   👤 Admin: admin@impactopr.seg.br / admin123');
    console.log('   🧪 Teste: teste@teste / 123456');
    console.log('   🏢 Cliente: 00000000000000 / impacto123');
    console.log('\n🔐 Todas as permissões foram atribuídas aos usuários admin e teste');
    console.log('\n🌐 URLs de produção:');
    console.log('   Frontend: https://painel.impactopr.seg.br');
    console.log('   API: https://api.impactopr.seg.br');
    console.log('   Prestadores: https://prestador.impactopr.seg.br');

  } catch (error) {
    console.error('❌ Erro na configuração de produção:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  setupProduction();
}

module.exports = { setupProduction };





