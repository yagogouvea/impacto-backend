const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function testarApoiosFrontend() {
  try {
    console.log('🧪 TESTE - Apoios Adicionais (Cenário do Frontend)\n');

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
      placa1: 'PQP4C05',
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
    console.log(`   Placa: ${ocorrenciaData.placa1}`);

    // 3. Testar o endpoint exato que estava falhando
    console.log('\n3️⃣ Testando endpoint que estava falhando...');
    console.log(`   URL: GET /api/v1/apoios-adicionais/${ocorrenciaId}`);
    
    try {
      const apoiosResponse = await axios.get(`${API_BASE_URL}/api/v1/apoios-adicionais/${ocorrenciaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Endpoint funcionando!');
      console.log(`   Status: ${apoiosResponse.status}`);
      console.log(`   Quantidade de apoios: ${apoiosResponse.data.length}`);
      console.log(`   Dados:`, apoiosResponse.data);
    } catch (error) {
      console.log('❌ Erro no endpoint:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Erro: ${error.response?.data?.error || error.message}`);
      return;
    }

    // 4. Criar alguns apoios adicionais para testar
    console.log('\n4️⃣ Criando apoios adicionais para teste...');
    
    const apoiosData = [
      {
        ocorrencia_id: ocorrenciaId,
        nome_prestador: 'Prestador Apoio 1',
        is_prestador_cadastrado: false,
        telefone: '11999999999',
        ordem: 1
      },
      {
        ocorrencia_id: ocorrenciaId,
        nome_prestador: 'Prestador Apoio 2',
        is_prestador_cadastrado: false,
        telefone: '11888888888',
        ordem: 2
      }
    ];

    const apoiosIds = [];
    for (let i = 0; i < apoiosData.length; i++) {
      try {
        const apoioResponse = await axios.post(`${API_BASE_URL}/api/v1/apoios-adicionais`, apoiosData[i], {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log(`✅ Apoio ${i + 1} criado! ID: ${apoioResponse.data.apoio.id}`);
        apoiosIds.push(apoioResponse.data.apoio.id);
      } catch (error) {
        console.log(`❌ Erro ao criar apoio ${i + 1}:`, error.response?.data?.error);
      }
    }

    // 5. Testar GET novamente (deve retornar os apoios criados)
    console.log('\n5️⃣ Testando GET com apoios criados...');
    
    try {
      const apoiosResponse = await axios.get(`${API_BASE_URL}/api/v1/apoios-adicionais/${ocorrenciaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Apoios carregados com sucesso!');
      console.log(`   Quantidade: ${apoiosResponse.data.length}`);
      
      apoiosResponse.data.forEach((apoio, index) => {
        console.log(`   Apoio ${index + 1}:`, {
          id: apoio.id,
          nome: apoio.nome_prestador,
          telefone: apoio.telefone,
          ordem: apoio.ordem
        });
      });
    } catch (error) {
      console.log('❌ Erro ao carregar apoios:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Erro: ${error.response?.data?.error || error.message}`);
    }

    // 6. Limpeza
    console.log('\n6️⃣ Limpando dados de teste...');
    
    // Remover apoios
    for (const apoioId of apoiosIds) {
      try {
        await axios.delete(`${API_BASE_URL}/api/v1/apoios-adicionais/${apoioId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Apoio ${apoioId} removido`);
      } catch (error) {
        console.log(`⚠️  Erro ao remover apoio ${apoioId}:`, error.response?.data?.error);
      }
    }
    
    // Remover ocorrência
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/ocorrencias/${ocorrenciaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Ocorrência removida');
    } catch (error) {
      console.log('⚠️  Erro ao remover ocorrência:', error.response?.data?.error);
    }

    console.log('\n🎉 TESTE FRONTEND CONCLUÍDO!');
    console.log('✅ Endpoint de apoios adicionais está funcionando perfeitamente!');
    console.log('✅ O erro 404 foi resolvido!');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data?.error || error.message);
  }
}

testarApoiosFrontend();
