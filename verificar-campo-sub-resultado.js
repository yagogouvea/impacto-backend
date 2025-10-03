const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

async function verificarCampoSubResultado() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando se o campo sub_resultado existe na tabela Ocorrencia...\n');

    // Tentar fazer uma consulta que inclui o campo sub_resultado
    const ocorrencias = await prisma.ocorrencia.findMany({
      select: {
        id: true,
        resultado: true,
        sub_resultado: true,
        status: true
      },
      take: 1
    });

    console.log('✅ Campo sub_resultado existe e está acessível!');
    console.log('   Primeira ocorrência:', ocorrencias[0]);

    // Tentar fazer um update simples para testar
    if (ocorrencias.length > 0) {
      console.log('\n🧪 Testando update com sub_resultado...');
      
      const updated = await prisma.ocorrencia.update({
        where: { id: ocorrencias[0].id },
        data: {
          sub_resultado: 'TESTE'
        }
      });
      
      console.log('✅ Update funcionou!');
      console.log(`   ID: ${updated.id}`);
      console.log(`   Sub Resultado: ${updated.sub_resultado}`);
      
      // Reverter o teste
      await prisma.ocorrencia.update({
        where: { id: ocorrencias[0].id },
        data: {
          sub_resultado: null
        }
      });
      
      console.log('✅ Teste revertido');
    }

  } catch (error) {
    console.error('❌ Erro ao verificar campo sub_resultado:', error);
    
    if (error.message.includes('Unknown field')) {
      console.log('\n🔧 Campo sub_resultado não existe na tabela!');
      console.log('   Possíveis soluções:');
      console.log('   1. Verificar se a migração foi aplicada');
      console.log('   2. Regenerar o Prisma Client');
      console.log('   3. Reiniciar o servidor');
    }
  } finally {
    await prisma.$disconnect();
  }
}

verificarCampoSubResultado();
