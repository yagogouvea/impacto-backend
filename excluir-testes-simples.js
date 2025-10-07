// Script simples para excluir acionamentos de teste
// Execute com: node excluir-testes-simples.js

const { PrismaClient } = require('@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  
  const idsParaExcluir = [1, 14, 15, 16, 17];
  
  console.log('🗑️ Excluindo acionamentos de teste...');
  console.log('📋 IDs:', idsParaExcluir.join(', '));
  
  try {
    // Excluir as ocorrências
    const resultado = await prisma.ocorrencia.deleteMany({
      where: {
        id: {
          in: idsParaExcluir
        }
      }
    });
    
    console.log(`✅ ${resultado.count} acionamento(s) excluído(s) com sucesso!`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
