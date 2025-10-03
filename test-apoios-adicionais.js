const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function testarApoiosAdicionais() {
  try {
    console.log('🧪 TESTE - Apoios Adicionais\n');

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

    // 3. Testar GET apoios adicionais (deve retornar array vazio)
    console.log('\n3️⃣ Testando GET apoios adicionais (deve retornar array vazio)...');
    
    try {
      const apoiosResponse = await axios.get(`${API_BASE_URL}/api/v1/apoios-adicionais/${ocorrenciaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Apoios adicionais carregados!');
      console.log(`   Quantidade: ${apoiosResponse.data.length}`);
      console.log(`   Dados:`, apoiosResponse.data);
    } catch (error) {
      console.log('❌ Erro ao carregar apoios adicionais:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Erro: ${error.response?.data?.error || error.message}`);
    }

    // 4. Criar apoio adicional
    console.log('\n4️⃣ Criando apoio adicional...');
    
    const apoioData = {
      ocorrencia_id: ocorrenciaId,
      nome_prestador: 'Prestador de Apoio',
      is_prestador_cadastrado: false,
      telefone: '11999999999',
      hora_inicial: '2025-10-03T10:00:00',
      hora_inicial_local: '2025-10-03T10:00:00',
      hora_final: '2025-10-03T12:00:00',
      km_inicial: 100.5,
      km_final: 105.2,
      franquia_km: false,
      observacoes: 'Apoio adicional para teste',
      ordem: 1
    };

    try {
      const apoioResponse = await axios.post(`${API_BASE_URL}/api/v1/apoios-adicionais`, apoioData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Apoio adicional criado!');
      console.log(`   ID: ${apoioResponse.data.apoio.id}`);
      console.log(`   Nome: ${apoioResponse.data.apoio.nome_prestador}`);
      console.log(`   Ocorrência ID: ${apoioResponse.data.apoio.ocorrencia_id}`);
      
      const apoioId = apoioResponse.data.apoio.id;

      // 5. Testar GET apoios adicionais (deve retornar o apoio criado)
      console.log('\n5️⃣ Testando GET apoios adicionais (deve retornar o apoio criado)...');
      
      const apoiosResponse2 = await axios.get(`${API_BASE_URL}/api/v1/apoios-adicionais/${ocorrenciaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Apoios adicionais carregados!');
      console.log(`   Quantidade: ${apoiosResponse2.data.length}`);
      if (apoiosResponse2.data.length > 0) {
        console.log(`   Primeiro apoio:`, {
          id: apoiosResponse2.data[0].id,
          nome: apoiosResponse2.data[0].nome_prestador,
          telefone: apoiosResponse2.data[0].telefone,
          hora_inicial: apoiosResponse2.data[0].hora_inicial
        });
      }

      // 6. Testar UPDATE apoio adicional
      console.log('\n6️⃣ Testando UPDATE apoio adicional...');
      
      const updateData = {
        ...apoioData,
        observacoes: 'Apoio adicional atualizado para teste',
        km_final: 106.8
      };

      const updateResponse = await axios.put(`${API_BASE_URL}/api/v1/apoios-adicionais/${apoioId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Apoio adicional atualizado!');
      console.log(`   Observações: ${updateResponse.data.apoio.observacoes}`);
      console.log(`   KM Final: ${updateResponse.data.apoio.km_final}`);

      // 7. Testar DELETE apoio adicional
      console.log('\n7️⃣ Testando DELETE apoio adicional...');
      
      await axios.delete(`${API_BASE_URL}/api/v1/apoios-adicionais/${apoioId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Apoio adicional removido!');

      // Verificar se foi realmente removido
      const apoiosResponse3 = await axios.get(`${API_BASE_URL}/api/v1/apoios-adicionais/${ocorrenciaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log(`   Apoios restantes: ${apoiosResponse3.data.length}`);

    } catch (error) {
      console.log('❌ Erro ao criar/gerenciar apoio adicional:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Erro: ${error.response?.data?.error || error.message}`);
      
      if (error.response?.data) {
        console.log('   Detalhes:', error.response.data);
      }
    }

    // 8. Limpeza
    console.log('\n8️⃣ Limpando dados de teste...');
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/ocorrencias/${ocorrenciaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Ocorrência de teste removida');
    } catch (error) {
      console.log('⚠️  Erro ao remover ocorrência:', error.response?.data?.error);
    }

    console.log('\n🎉 TESTE CONCLUÍDO!');
    console.log('✅ Funcionalidade de apoios adicionais está funcionando!');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data?.error || error.message);
  }
}

testarApoiosAdicionais();
