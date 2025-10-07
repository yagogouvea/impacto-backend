// Script completo para excluir acionamentos de teste
// Primeiro exclui as fotos, depois as ocorrências

const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  const idsParaExcluir = [1, 14, 15, 16, 17];
  
  console.log('🗑️ Excluindo acionamentos de teste...');
  console.log('📋 IDs:', idsParaExcluir.join(', '));
  
  try {
    // Primeiro, verificar quais ocorrências existem
    const ocorrenciasExistentes = await prisma.ocorrencia.findMany({
      where: {
        id: {
          in: idsParaExcluir
        }
      },
      include: {
        fotos: true
      }
    });
    
    console.log(`🔍 Encontradas ${ocorrenciasExistentes.length} ocorrência(s) para exclusão:`);
    ocorrenciasExistentes.forEach(oc => {
      console.log(`  - ID: ${oc.id}, Placa: ${oc.placa1}, Fotos: ${oc.fotos.length}`);
    });
    
    if (ocorrenciasExistentes.length === 0) {
      console.log('❌ Nenhuma ocorrência encontrada com os IDs especificados.');
      return;
    }
    
    // Excluir fotos primeiro (se houver)
    const totalFotos = ocorrenciasExistentes.reduce((acc, oc) => acc + oc.fotos.length, 0);
    if (totalFotos > 0) {
      console.log(`📸 Excluindo ${totalFotos} foto(s) associada(s)...`);
      
      const fotosExcluidas = await prisma.foto.deleteMany({
        where: {
          ocorrenciaId: {
            in: idsParaExcluir
          }
        }
      });
      
      console.log(`✅ ${fotosExcluidas.count} foto(s) excluída(s)`);
    }
    
    // Agora excluir as ocorrências
    console.log('🗑️ Excluindo ocorrências...');
    const resultado = await prisma.ocorrencia.deleteMany({
      where: {
        id: {
          in: idsParaExcluir
        }
      }
    });
    
    console.log(`✅ ${resultado.count} acionamento(s) excluído(s) com sucesso!`);
    
    // Verificar se ainda existem
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
    
    if (ocorrenciasRestantes.length === 0) {
      console.log('🎉 Todos os acionamentos de teste foram excluídos com sucesso!');
    } else {
      console.log('⚠️ Ainda existem ocorrências com os IDs:', ocorrenciasRestantes.map(oc => oc.id));
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('Detalhes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
