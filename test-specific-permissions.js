const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testSpecificPermissions() {
  try {
    console.log('🧪 Testando permissões específicas...');
    
    // 1. Fazer login
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'teste@teste',
      password: '123456'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login realizado');
    
    // 2. Verificar usuário atual e permissões
    const meResponse = await axios.get(`${API_BASE_URL}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const user = meResponse.data;
    const permissions = Array.isArray(user.permissions) ? user.permissions : JSON.parse(user.permissions);
    
    console.log('👤 Usuário:', user.name);
    console.log('📧 Email:', user.email);
    console.log('🔑 Role:', user.role);
    console.log('📋 Total de permissões:', permissions.length);
    
    // 3. Verificar permissões específicas para CRUD de usuários
    const requiredPermissions = [
      'access:usuarios',
      'create:usuarios',
      'update:usuarios',
      'delete:usuarios',
      'create:user',
      'read:user',
      'update:user',
      'delete:user'
    ];
    
    console.log('\n🔍 Verificando permissões específicas:');
    requiredPermissions.forEach(perm => {
      if (permissions.includes(perm)) {
        console.log(`   ✅ ${perm}`);
      } else {
        console.log(`   ❌ ${perm} - FALTANDO!`);
      }
    });
    
    // 4. Testar endpoints específicos com logs detalhados
    console.log('\n🧪 Testando endpoints específicos...');
    
    // Testar listagem
    try {
      const listResponse = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Listagem de usuários: OK');
    } catch (error) {
      console.log('❌ Listagem de usuários: ERRO');
      console.log('   Status:', error.response?.status);
      console.log('   Dados:', error.response?.data);
    }
    
    // Testar criação
    try {
      const createResponse = await axios.post(`${API_BASE_URL}/api/users`, {
        name: 'Teste Permissões',
        email: 'teste-permissoes@teste.com',
        password: '123456',
        role: 'usuario',
        permissions: ['read:dashboard'],
        active: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Criação de usuário: OK');
      
      // Limpar usuário criado
      await axios.delete(`${API_BASE_URL}/api/users/${createResponse.data.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Usuário de teste removido');
      
    } catch (error) {
      console.log('❌ Criação de usuário: ERRO');
      console.log('   Status:', error.response?.status);
      console.log('   Dados:', error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testSpecificPermissions();
