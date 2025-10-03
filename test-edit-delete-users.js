const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testEditDeleteUsers() {
  try {
    console.log('🧪 Testando edição e exclusão de usuários...');
    
    // 1. Fazer login
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'teste@teste',
      password: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado');
    
    // 2. Listar usuários para pegar um ID
    const listResponse = await axios.get(`${API_BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('📋 Usuários encontrados:', listResponse.data.length);
    
    if (listResponse.data.length === 0) {
      console.log('❌ Nenhum usuário encontrado para testar');
      return;
    }
    
    // Pegar o primeiro usuário que não seja o teste@teste
    const targetUser = listResponse.data.find(user => user.email !== 'teste@teste');
    
    if (!targetUser) {
      console.log('❌ Nenhum usuário diferente de teste@teste encontrado');
      return;
    }
    
    console.log('🎯 Usuário alvo para teste:', targetUser.email);
    
    // 3. Testar edição
    console.log('\n✏️ Testando edição...');
    try {
      const editResponse = await axios.put(`${API_BASE_URL}/api/users/${targetUser.id}`, {
        name: `${targetUser.name} - Editado`,
        email: targetUser.email,
        role: targetUser.role,
        permissions: targetUser.permissions,
        active: targetUser.active
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Edição bem-sucedida:', editResponse.data.name);
    } catch (error) {
      console.log('❌ Erro na edição:');
      console.log('   Status:', error.response?.status);
      console.log('   Dados:', error.response?.data);
    }
    
    // 4. Testar exclusão
    console.log('\n🗑️ Testando exclusão...');
    try {
      const deleteResponse = await axios.delete(`${API_BASE_URL}/api/users/${targetUser.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Exclusão bem-sucedida:', deleteResponse.status);
    } catch (error) {
      console.log('❌ Erro na exclusão:');
      console.log('   Status:', error.response?.status);
      console.log('   Dados:', error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testEditDeleteUsers();


