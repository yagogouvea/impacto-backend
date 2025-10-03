const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function testarUpdateSimples() {
  try {
    console.log('🧪 TESTE SIMPLES - Update de Ocorrência\n');

    // 1. Login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'teste@teste',
      password: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso!');

    // 2. Criar ocorrência
    console.log('\n2️⃣ Criando ocorrência de teste...');
    const ocorrenciaData = {
      placa1: 'TEST123',
      cliente: 'Cliente Teste',
      tipo: 'Recuperação',
      endereco: 'Rua Teste, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      operador: 'Laysla'
    };

    const ocorrenciaResponse = await axios.post(`${API_BASE_URL}/api/v1/ocorrencias`, ocorrenciaData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const ocorrenciaId = ocorrenciaResponse.data.id;
    console.log('✅ Ocorrência criada!');
    console.log(`   ID: ${ocorrenciaId}`);

    // 3. Testar update simples (apenas resultado)
    console.log('\n3️⃣ Testando update simples (apenas resultado)...');
    
    try {
      const updateResponse = await axios.put(`${API_BASE_URL}/api/v1/ocorrencias/${ocorrenciaId}`, {
        resultado: 'RECUPERADO'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Update simples funcionou!');
      console.log(`   Resultado: ${updateResponse.data.resultado}`);
    } catch (error) {
      console.log('❌ Erro no update simples:', error.response?.data?.error);
    }

    // 4. Testar update com sub_resultado
    console.log('\n4️⃣ Testando update com sub_resultado...');
    
    try {
      const updateResponse = await axios.put(`${API_BASE_URL}/api/v1/ocorrencias/${ocorrenciaId}`, {
        resultado: 'RECUPERADO',
        sub_resultado: 'COM_RASTREIO'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Update com sub_resultado funcionou!');
      console.log(`   Resultado: ${updateResponse.data.resultado}`);
      console.log(`   Sub Resultado: ${updateResponse.data.sub_resultado}`);
    } catch (error) {
      console.log('❌ Erro no update com sub_resultado:', error.response?.data?.error);
    }

    // 5. Testar update com status
    console.log('\n5️⃣ Testando update com status...');
    
    try {
      const updateResponse = await axios.put(`${API_BASE_URL}/api/v1/ocorrencias/${ocorrenciaId}`, {
        resultado: 'RECUPERADO',
        sub_resultado: 'COM_RASTREIO',
        status: 'concluida'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Update com status funcionou!');
      console.log(`   Resultado: ${updateResponse.data.resultado}`);
      console.log(`   Sub Resultado: ${updateResponse.data.sub_resultado}`);
      console.log(`   Status: ${updateResponse.data.status}`);
    } catch (error) {
      console.log('❌ Erro no update com status:', error.response?.data?.error);
      console.log('   Detalhes do erro:', error.response?.data);
    }

    // 6. Limpeza
    console.log('\n6️⃣ Limpando dados de teste...');
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/ocorrencias/${ocorrenciaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Ocorrência de teste removida');
    } catch (error) {
      console.log('⚠️  Erro ao remover ocorrência:', error.response?.data?.error);
    }

    console.log('\n🎉 TESTE SIMPLES CONCLUÍDO!');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data?.error || error.message);
  }
}

testarUpdateSimples();
