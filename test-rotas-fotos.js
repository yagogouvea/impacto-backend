const axios = require('axios');

const API_BASE = 'https://api.impactopr.seg.br';

async function testarRotasFotos() {
  console.log('🧪 Testando rotas de fotos em produção...');
  console.log('📍 API Base:', API_BASE);

  const rotas = [
    '/api/v1/fotos',
    '/api/v1/fotos/create',
    '/api/v1/fotos/por-ocorrencia/1',
    '/api/fotos', // rota antiga para comparação
    '/api/fotos/por-ocorrencia/1' // rota antiga para comparação
  ];

  for (const rota of rotas) {
    try {
      console.log(`\n🔍 Testando: ${rota}`);
      const response = await axios.get(`${API_BASE}${rota}`, {
        timeout: 10000,
        validateStatus: () => true // aceitar qualquer status para debug
      });
      
      console.log(`✅ Status: ${response.status}`);
      console.log(`📝 Response:`, response.data);
      
    } catch (error) {
      if (error.response) {
        console.log(`❌ Status: ${error.response.status}`);
        console.log(`📝 Error:`, error.response.data);
      } else if (error.request) {
        console.log(`❌ Request Error:`, error.message);
      } else {
        console.log(`❌ Error:`, error.message);
      }
    }
  }

  // Testar POST para criar foto
  console.log('\n🔍 Testando POST para criar foto...');
  try {
    const response = await axios.post(`${API_BASE}/api/v1/fotos/create`, {
      url: 'https://teste.com/foto.jpg',
      legenda: 'Foto de teste',
      ocorrenciaId: 1
    }, {
      timeout: 10000,
      validateStatus: () => true
    });
    
    console.log(`✅ POST Status: ${response.status}`);
    console.log(`📝 POST Response:`, response.data);
    
  } catch (error) {
    if (error.response) {
      console.log(`❌ POST Status: ${error.response.status}`);
      console.log(`📝 POST Error:`, error.response.data);
    } else if (error.request) {
      console.log(`❌ POST Request Error:`, error.message);
    } else {
      console.log(`❌ POST Error:`, error.message);
    }
  }
}

testarRotasFotos().catch(console.error);
