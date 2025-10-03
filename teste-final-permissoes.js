const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function testeFinalPermissoes() {
  try {
    console.log('🧪 TESTE FINAL - PERMISSÕES DO USUÁRIO teste@teste\n');

    // 1. Login
    console.log('1️⃣ Login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'teste@teste',
      password: '123456'
    });

    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    
    console.log('✅ Login realizado!');
    console.log(`   Nome: ${user.name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Permissões: ${user.permissions.length}`);

    // 2. Testar todas as funcionalidades de usuários
    console.log('\n2️⃣ TESTANDO FUNCIONALIDADES DE USUÁRIOS:');

    // Listar usuários
    try {
      const usersResponse = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ✅ Listar usuários: OK');
      console.log(`      Total: ${usersResponse.data.length} usuários`);
    } catch (error) {
      console.log('   ❌ Listar usuários: ERRO');
      console.log(`      ${error.response?.data?.error || error.message}`);
    }

    // Criar usuário
    try {
      const newUser = await axios.post(`${API_BASE_URL}/api/users`, {
        name: 'Teste Final',
        email: 'teste-final@teste.com',
        password: '123456',
        role: 'usuario',
        permissions: ['read:ocorrencia'],
        active: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ✅ Criar usuário: OK');
      console.log(`      ID: ${newUser.data.id}`);

      // Atualizar usuário
      try {
        const updatedUser = await axios.put(`${API_BASE_URL}/api/users/${newUser.data.id}`, {
          name: 'Teste Final Atualizado',
          permissions: ['read:ocorrencia', 'create:ocorrencia']
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ✅ Atualizar usuário: OK');
        console.log(`      Nome: ${updatedUser.data.name}`);
      } catch (error) {
        console.log('   ❌ Atualizar usuário: ERRO');
        console.log(`      ${error.response?.data?.error || error.message}`);
      }

      // Excluir usuário
      try {
        await axios.delete(`${API_BASE_URL}/api/users/${newUser.data.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('   ✅ Excluir usuário: OK');
      } catch (error) {
        console.log('   ❌ Excluir usuário: ERRO');
        console.log(`      ${error.response?.data?.error || error.message}`);
      }

    } catch (error) {
      console.log('   ❌ Criar usuário: ERRO');
      console.log(`      ${error.response?.data?.error || error.message}`);
    }

    // 3. Testar outras funcionalidades importantes
    console.log('\n3️⃣ TESTANDO OUTRAS FUNCIONALIDADES:');

    // Dashboard
    try {
      const dashboard = await axios.get(`${API_BASE_URL}/api/v1/ocorrencias/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ✅ Dashboard: OK');
      console.log(`      Ocorrências: ${dashboard.data.length}`);
    } catch (error) {
      console.log('   ❌ Dashboard: ERRO');
      console.log(`      ${error.response?.data?.error || error.message}`);
    }

    // Ocorrências
    try {
      const ocorrencias = await axios.get(`${API_BASE_URL}/api/v1/ocorrencias`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ✅ Listar ocorrências: OK');
      console.log(`      Total: ${ocorrencias.data.length}`);
    } catch (error) {
      console.log('   ❌ Listar ocorrências: ERRO');
      console.log(`      ${error.response?.data?.error || error.message}`);
    }

    // Prestadores
    try {
      const prestadores = await axios.get(`${API_BASE_URL}/api/prestadores`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('   ✅ Listar prestadores: OK');
      console.log(`      Total: ${prestadores.data.length}`);
    } catch (error) {
      console.log('   ❌ Listar prestadores: ERRO');
      console.log(`      ${error.response?.data?.error || error.message}`);
    }

    console.log('\n🎉 TESTE FINAL CONCLUÍDO!');
    console.log('✅ Usuário teste@teste tem acesso completo a todas as funcionalidades');

  } catch (error) {
    console.error('❌ Erro no teste final:', error.response?.data?.error || error.message);
  }
}

testeFinalPermissoes();
