const axios = require('axios');

// Configuração da API
const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';
const API_TOKEN = process.env.API_TOKEN || 'seu-token-aqui'; // Você precisará configurar um token válido

async function excluirAcionamentosViaAPI() {
  const idsParaExcluir = [1, 14, 15, 16, 17];
  
  console.log('🗑️ Iniciando exclusão dos acionamentos de teste via API...');
  console.log('📋 IDs a serem excluídos:', idsParaExcluir);
  console.log('🌐 URL da API:', API_BASE_URL);
  
  const resultados = [];
  
  for (const id of idsParaExcluir) {
    try {
      console.log(`\n🔄 Excluindo ocorrência ID: ${id}...`);
      
      const response = await axios.delete(`${API_BASE_URL}/api/v1/ocorrencias/${id}`, {
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Ocorrência ID ${id} excluída com sucesso! Status: ${response.status}`);
      resultados.push({ id, status: 'sucesso', statusCode: response.status });
      
    } catch (error) {
      if (error.response) {
        console.log(`❌ Erro ao excluir ocorrência ID ${id}: ${error.response.status} - ${error.response.data?.error || error.response.statusText}`);
        resultados.push({ 
          id, 
          status: 'erro', 
          statusCode: error.response.status, 
          error: error.response.data?.error || error.response.statusText 
        });
      } else if (error.request) {
        console.log(`❌ Erro de conexão ao excluir ocorrência ID ${id}: ${error.message}`);
        resultados.push({ 
          id, 
          status: 'erro_conexao', 
          error: error.message 
        });
      } else {
        console.log(`❌ Erro inesperado ao excluir ocorrência ID ${id}: ${error.message}`);
        resultados.push({ 
          id, 
          status: 'erro_inesperado', 
          error: error.message 
        });
      }
    }
  }
  
  // Resumo dos resultados
  console.log('\n📊 RESUMO DA EXCLUSÃO:');
  console.log('='.repeat(50));
  
  const sucessos = resultados.filter(r => r.status === 'sucesso');
  const erros = resultados.filter(r => r.status !== 'sucesso');
  
  console.log(`✅ Sucessos: ${sucessos.length}`);
  sucessos.forEach(r => {
    console.log(`  - ID ${r.id}: Excluído (Status ${r.statusCode})`);
  });
  
  console.log(`❌ Erros: ${erros.length}`);
  erros.forEach(r => {
    console.log(`  - ID ${r.id}: ${r.error || 'Erro desconhecido'}`);
  });
  
  console.log('='.repeat(50));
  console.log(`📈 Total processado: ${resultados.length}`);
  console.log(`✅ Sucessos: ${sucessos.length}`);
  console.log(`❌ Erros: ${erros.length}`);
  
  if (sucessos.length > 0) {
    console.log('\n🎉 Pelo menos alguns acionamentos de teste foram excluídos com sucesso!');
  }
  
  if (erros.length > 0) {
    console.log('\n⚠️ Alguns acionamentos não puderam ser excluídos. Verifique os erros acima.');
  }
}

// Executar o script
excluirAcionamentosViaAPI()
  .then(() => {
    console.log('\n🏁 Script finalizado!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Erro na execução do script:', error);
    process.exit(1);
  });
