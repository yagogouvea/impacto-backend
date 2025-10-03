const axios = require('axios');

async function testDashboardEndpoint() {
  try {
    console.log('🧪 Testando endpoint /api/v1/ocorrencias/dashboard...');
    
    // Primeiro fazer login para obter token
    const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'teste@teste',
      password: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado, token obtido');
    
    // Testar endpoint dashboard
    const dashboardResponse = await axios.get('http://localhost:3001/api/v1/ocorrencias/dashboard', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Dashboard endpoint funcionando!');
    console.log('📊 Status:', dashboardResponse.status);
    console.log('📋 Dados recebidos:', Array.isArray(dashboardResponse.data) ? `${dashboardResponse.data.length} ocorrências` : 'Não é array');
    
  } catch (error) {
    console.error('❌ Erro no teste:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    } else {
      console.error('Erro:', error.message);
    }
  }
}

testDashboardEndpoint();


