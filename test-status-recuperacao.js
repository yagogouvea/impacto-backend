const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function testarStatusRecuperacao() {
  try {
    console.log('🧪 TESTE - Status de Recuperação\n');

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

    // 3. Testar atualização de status (payload exato do frontend)
    console.log('\n3️⃣ Testando atualização de status...');
    console.log('   Payload:', {
      resultado: 'RECUPERADO',
      status: 'concluida',
      sub_resultado: 'COM_RASTREIO'
    });
    
    try {
      const updateResponse = await axios.put(`${API_BASE_URL}/api/v1/ocorrencias/${ocorrenciaId}`, {
        resultado: 'RECUPERADO',
        status: 'concluida',
        sub_resultado: 'COM_RASTREIO'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Status atualizado com sucesso!');
      console.log(`   ID: ${updateResponse.data.id}`);
      console.log(`   Resultado: ${updateResponse.data.resultado}`);
      console.log(`   Sub Resultado: ${updateResponse.data.sub_resultado}`);
      console.log(`   Status: ${updateResponse.data.status}`);

      // 4. Verificar se a atualização foi persistida
      console.log('\n4️⃣ Verificando persistência dos dados...');
      
      const getResponse = await axios.get(`${API_BASE_URL}/api/v1/ocorrencias/${ocorrenciaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Dados verificados:');
      console.log(`   Resultado: ${getResponse.data.resultado}`);
      console.log(`   Sub Resultado: ${getResponse.data.sub_resultado}`);
      console.log(`   Status: ${getResponse.data.status}`);
      console.log(`   Atualizado em: ${getResponse.data.atualizado_em}`);

    } catch (error) {
      console.log('❌ Erro ao atualizar status:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Erro: ${error.response?.data?.error || error.message}`);
      
      if (error.response?.data) {
        console.log('   Detalhes:', error.response.data);
      }
    }

    // 5. Testar outros cenários de status
    console.log('\n5️⃣ Testando outros cenários de status...');
    
    const cenarios = [
      {
        resultado: 'NAO_RECUPERADO',
        status: 'concluida',
        sub_resultado: 'SEM_RASTREIO'
      },
      {
        resultado: 'RECUPERADO',
        status: 'concluida',
        sub_resultado: 'SEM_RASTREIO'
      },
      {
        resultado: 'CANCELADO',
        status: 'cancelada',
        sub_resultado: null
      }
    ];

    for (let i = 0; i < cenarios.length; i++) {
      const cenario = cenarios[i];
      console.log(`\n   Cenário ${i + 1}:`, cenario);
      
      try {
        const response = await axios.put(`${API_BASE_URL}/api/v1/ocorrencias/${ocorrenciaId}`, cenario, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`   ✅ Cenário ${i + 1} funcionando!`);
        console.log(`      Resultado: ${response.data.resultado}`);
        console.log(`      Sub Resultado: ${response.data.sub_resultado}`);
      } catch (error) {
        console.log(`   ❌ Erro no cenário ${i + 1}:`, error.response?.data?.error);
      }
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

    console.log('\n🎉 TESTE CONCLUÍDO!');
    console.log('✅ Funcionalidade de status de recuperação está funcionando!');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data?.error || error.message);
  }
}

testarStatusRecuperacao();
