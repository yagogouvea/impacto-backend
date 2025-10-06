const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testarExclusaoCliente() {
  const clienteId = 2;
  
  console.log('🔍 Testando exclusão do cliente ID:', clienteId);
  
  try {
    // 1. Verificar se o cliente existe
    console.log('\n1️⃣ Verificando se o cliente existe...');
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      include: {
        contratos: true,
        camposAdicionais: true,
        auth: true
      }
    });
    
    if (!cliente) {
      console.log('❌ Cliente não encontrado');
      return;
    }
    
    console.log('✅ Cliente encontrado:', {
      id: cliente.id,
      nome: cliente.nome,
      cnpj: cliente.cnpj,
      contratos: cliente.contratos.length,
      camposAdicionais: cliente.camposAdicionais.length,
      temAuth: !!cliente.auth
    });
    
    // 2. Verificar ocorrências relacionadas
    console.log('\n2️⃣ Verificando ocorrências relacionadas...');
    const ocorrencias = await prisma.ocorrencia.findMany({
      where: {
        cliente: cliente.nome
      },
      select: {
        id: true,
        cliente: true,
        tipo: true,
        status: true,
        criado_em: true
      }
    });
    
    console.log(`📊 Ocorrências encontradas: ${ocorrencias.length}`);
    if (ocorrencias.length > 0) {
      console.log('📋 Primeiras 5 ocorrências:');
      ocorrencias.slice(0, 5).forEach((oc, index) => {
        console.log(`  ${index + 1}. ID: ${oc.id}, Tipo: ${oc.tipo}, Status: ${oc.status}`);
      });
    }
    
    // 3. Verificar outras dependências
    console.log('\n3️⃣ Verificando outras dependências...');
    
    // Verificar se há relatórios relacionados
    const relatorios = await prisma.relatorio.findMany({
      where: {
        cliente: cliente.nome
      }
    });
    console.log(`📄 Relatórios encontrados: ${relatorios.length}`);
    
    // 4. Tentar exclusão
    console.log('\n4️⃣ Tentando excluir o cliente...');
    
    // Primeiro, tentar excluir dependências
    if (cliente.auth) {
      console.log('🗑️ Excluindo autenticação do cliente...');
      await prisma.clienteAuth.delete({
        where: { cliente_id: clienteId }
      });
      console.log('✅ Autenticação excluída');
    }
    
    if (cliente.camposAdicionais.length > 0) {
      console.log('🗑️ Excluindo campos adicionais...');
      await prisma.campoAdicionalCliente.deleteMany({
        where: { clienteId: clienteId }
      });
      console.log('✅ Campos adicionais excluídos');
    }
    
    if (cliente.contratos.length > 0) {
      console.log('🗑️ Excluindo contratos...');
      await prisma.contrato.deleteMany({
        where: { clienteId: clienteId }
      });
      console.log('✅ Contratos excluídos');
    }
    
    // Agora tentar excluir o cliente
    console.log('🗑️ Excluindo cliente...');
    const clienteExcluido = await prisma.cliente.delete({
      where: { id: clienteId }
    });
    
    console.log('✅ Cliente excluído com sucesso:', clienteExcluido.nome);
    
  } catch (error) {
    console.error('❌ Erro ao excluir cliente:', error);
    
    // Analisar o tipo de erro
    if (error.code === 'P2003') {
      console.log('🔍 Erro de foreign key constraint detectado');
      console.log('📋 Detalhes:', error.meta);
      
      // Tentar identificar qual tabela está causando o problema
      const constraint = error.meta?.field_name;
      if (constraint) {
        console.log(`🔗 Constraint violada: ${constraint}`);
        
        // Sugerir soluções
        if (constraint.includes('ocorrencia')) {
          console.log('💡 Solução: Excluir ou transferir ocorrências relacionadas primeiro');
        } else if (constraint.includes('contrato')) {
          console.log('💡 Solução: Excluir contratos relacionados primeiro');
        } else if (constraint.includes('auth')) {
          console.log('💡 Solução: Excluir autenticação do cliente primeiro');
        }
      }
    } else if (error.code === 'P2025') {
      console.log('🔍 Cliente não encontrado para exclusão');
    } else {
      console.log('🔍 Erro desconhecido:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o teste
if (require.main === module) {
  testarExclusaoCliente()
    .then(() => {
      console.log('\n🎯 Teste concluído');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no teste:', error);
      process.exit(1);
    });
}

module.exports = { testarExclusaoCliente };
