const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function testCompletePermissions() {
  try {
    console.log('🧪 Testando permissões completas do usuário teste@teste...\n');

    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'teste@teste',
      password: '123456'
    });

    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    
    console.log('✅ Login realizado com sucesso!');
    console.log(`   Nome: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Total de permissões: ${user.permissions.length}`);

    // 2. Testar acesso à lista de usuários
    console.log('\n2️⃣ Testando acesso à lista de usuários...');
    try {
      const usersResponse = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Acesso à lista de usuários: OK');
      console.log(`   Total de usuários: ${usersResponse.data.length}`);
    } catch (error) {
      console.log('❌ Erro ao acessar lista de usuários:', error.response?.data?.error || error.message);
    }

    // 3. Testar criação de usuário
    console.log('\n3️⃣ Testando criação de usuário...');
    const testUserData = {
      name: 'Usuário Teste Criado',
      email: 'teste-criado@teste.com',
      password: '123456',
      role: 'usuario',
      permissions: ['read:ocorrencia'],
      active: true
    };

    try {
      const createResponse = await axios.post(`${API_BASE_URL}/api/users`, testUserData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Criação de usuário: OK');
      console.log(`   ID do usuário criado: ${createResponse.data.id}`);
      
      const createdUserId = createResponse.data.id;

      // 4. Testar atualização de usuário
      console.log('\n4️⃣ Testando atualização de usuário...');
      try {
        const updateResponse = await axios.put(`${API_BASE_URL}/api/users/${createdUserId}`, {
          name: 'Usuário Teste Atualizado',
          permissions: ['read:ocorrencia', 'create:ocorrencia']
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Atualização de usuário: OK');
        console.log(`   Nome atualizado: ${updateResponse.data.name}`);
      } catch (error) {
        console.log('❌ Erro ao atualizar usuário:', error.response?.data?.error || error.message);
      }

      // 5. Testar exclusão de usuário
      console.log('\n5️⃣ Testando exclusão de usuário...');
      try {
        await axios.delete(`${API_BASE_URL}/api/users/${createdUserId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Exclusão de usuário: OK');
      } catch (error) {
        console.log('❌ Erro ao excluir usuário:', error.response?.data?.error || error.message);
      }

    } catch (error) {
      console.log('❌ Erro ao criar usuário:', error.response?.data?.error || error.message);
    }

    // 6. Testar outras funcionalidades importantes
    console.log('\n6️⃣ Testando outras funcionalidades...');
    
    // Testar dashboard
    try {
      const dashboardResponse = await axios.get(`${API_BASE_URL}/api/v1/ocorrencias/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Acesso ao dashboard: OK');
      console.log(`   Total de ocorrências: ${dashboardResponse.data.length}`);
    } catch (error) {
      console.log('❌ Erro ao acessar dashboard:', error.response?.data?.error || error.message);
    }

    // Testar lista de ocorrências
    try {
      const ocorrenciasResponse = await axios.get(`${API_BASE_URL}/api/v1/ocorrencias`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Acesso à lista de ocorrências: OK');
      console.log(`   Total de ocorrências: ${ocorrenciasResponse.data.length}`);
    } catch (error) {
      console.log('❌ Erro ao acessar ocorrências:', error.response?.data?.error || error.message);
    }

    console.log('\n🎉 Teste de permissões concluído!');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data?.error || error.message);
  }
}

testCompletePermissions();
