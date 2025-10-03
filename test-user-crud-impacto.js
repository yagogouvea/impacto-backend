const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testUserCRUD() {
  console.log('🧪 Testando CRUD de usuários com teste@teste...');
  
  let token = '';
  
  try {
    // 1. Fazer login
    console.log('\n1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'teste@teste',
      password: '123456'
    });
    
    token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso!');
    
    // 2. Listar usuários
    console.log('\n2️⃣ Listando usuários...');
    const listResponse = await axios.get(`${API_BASE_URL}/api/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Listagem:', listResponse.data.length, 'usuários encontrados');
    
    // 3. Criar usuário
    console.log('\n3️⃣ Criando novo usuário...');
    const createResponse = await axios.post(`${API_BASE_URL}/api/users`, {
      name: 'Usuário Teste CRUD Impacto',
      email: 'teste-crud-impacto@teste.com',
      password: '123456',
      role: 'usuario',
      permissions: ['read:ocorrencia', 'read:dashboard'],
      active: true
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Usuário criado:', createResponse.data.id);
    const novoUsuarioId = createResponse.data.id;
    
    // 4. Editar usuário
    console.log('\n4️⃣ Editando usuário...');
    const updateResponse = await axios.put(`${API_BASE_URL}/api/users/${novoUsuarioId}`, {
      name: 'Usuário Teste CRUD Impacto - Editado',
      email: 'teste-crud-impacto-editado@teste.com',
      role: 'usuario',
      permissions: ['read:ocorrencia', 'read:dashboard', 'create:ocorrencia'],
      active: true
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Usuário editado:', updateResponse.data.name);
    
    // 5. Excluir usuário
    console.log('\n5️⃣ Excluindo usuário...');
    const deleteResponse = await axios.delete(`${API_BASE_URL}/api/users/${novoUsuarioId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Usuário excluído:', deleteResponse.status);
    
    console.log('\n🎉 Todos os testes de CRUD passaram!');
    
  } catch (error) {
    console.error('\n❌ Erro no teste:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    } else {
      console.error('Erro:', error.message);
    }
  }
}

testUserCRUD();


