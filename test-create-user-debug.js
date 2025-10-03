const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testCreateUserDebug() {
  try {
    console.log('🧪 Testando criação de usuário com debug...');
    
    // 1. Fazer login
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'teste@teste',
      password: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado');
    
    // 2. Verificar usuário atual
    const meResponse = await axios.get(`${API_BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('👤 Usuário atual:');
    console.log('   Nome:', meResponse.data.name);
    console.log('   Email:', meResponse.data.email);
    console.log('   Role:', meResponse.data.role);
    console.log('   Permissões:', meResponse.data.permissions.length);
    
    // 3. Tentar criar usuário com dados mínimos
    console.log('\n🆕 Criando usuário com dados mínimos...');
    
    const userData = {
      name: 'Teste Debug',
      email: 'debug@teste.com',
      password: '123456',
      role: 'usuario',
      permissions: ['read:dashboard'],
      active: true
    };
    
    console.log('📋 Dados enviados:', JSON.stringify(userData, null, 2));
    
    const createResponse = await axios.post(`${API_BASE_URL}/api/users`, userData, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Usuário criado:', createResponse.data);
    
  } catch (error) {
    console.error('\n❌ Erro detalhado:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Dados:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Erro:', error.message);
    }
  }
}

testCreateUserDebug();


