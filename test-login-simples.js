const axios = require('axios');

async function testarLogin() {
  try {
    console.log('🧪 Testando login...');
    
    const response = await axios.post('http://localhost:3001/api/auth/login', {
      email: 'teste@teste',
      password: '123456'
    });
    
    console.log('✅ Login funcionou!');
    console.log('Token:', response.data.token ? 'PRESENTE' : 'AUSENTE');
    
  } catch (error) {
    console.log('❌ Erro no login:', error.response?.data?.error || error.message);
  }
}

testarLogin();
