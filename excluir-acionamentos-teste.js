const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function excluirAcionamentosTeste() {
  const idsParaExcluir = [1, 14, 15, 16, 17];
  
  console.log('🗑️ Iniciando exclusão dos acionamentos de teste...');
  console.log('📋 IDs a serem excluídos:', idsParaExcluir);
  
  try {
    // Verificar quais ocorrências existem
    const ocorrenciasExistentes = await prisma.ocorrencia.findMany({
      where: {
        id: {
          in: idsParaExcluir
        }
      },
      select: {
        id: true,
        placa1: true,
        tipo: true,
        operador: true,
        criado_em: true
      }
    });
    
    console.log('🔍 Ocorrências encontradas para exclusão:');
    ocorrenciasExistentes.forEach(oc => {
      console.log(`  - ID: ${oc.id}, Placa: ${oc.placa1}, Tipo: ${oc.tipo}, Operador: ${oc.operador}, Criado: ${oc.criado_em}`);
    });
    
    if (ocorrenciasExistentes.length === 0) {
      console.log('❌ Nenhuma ocorrência encontrada com os IDs especificados.');
      return;
    }
    
    // Confirmar exclusão
    console.log(`\n⚠️ ATENÇÃO: Você está prestes a excluir ${ocorrenciasExistentes.length} ocorrência(s).`);
    console.log('Esta ação não pode ser desfeita!');
    
    // Para execução automática, vamos prosseguir
    // Em produção, você pode querer adicionar uma confirmação manual aqui
    
    // Excluir as ocorrências
    const resultado = await prisma.ocorrencia.deleteMany({
      where: {
        id: {
          in: idsParaExcluir
        }
      }
    });
    
    console.log(`\n✅ Exclusão concluída com sucesso!`);
    console.log(`📊 Total de ocorrências excluídas: ${resultado.count}`);
    
    // Verificar se ainda existem ocorrências com esses IDs
    const ocorrenciasRestantes = await prisma.ocorrencia.findMany({
      where: {
        id: {
          in: idsParaExcluir
        }
      },
      select: {
        id: true
      }
    });
    
    if (ocorrenciasRestantes.length > 0) {
      console.log('⚠️ Ainda existem ocorrências com os IDs especificados:', ocorrenciasRestantes.map(oc => oc.id));
    } else {
      console.log('✅ Todos os acionamentos de teste foram excluídos com sucesso!');
    }
    
  } catch (error) {
    console.error('❌ Erro ao excluir acionamentos de teste:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
excluirAcionamentosTeste()
  .then(() => {
    console.log('\n🎉 Script executado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro na execução do script:', error);
    process.exit(1);
  });
