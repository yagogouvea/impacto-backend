const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function testarPrestadorNaoCadastrado() {
  try {
    console.log('🧪 Testando endpoint de prestador não cadastrado...\n');

    // 1. Primeiro, criar uma ocorrência para testar
    console.log('1️⃣ Criando ocorrência de teste...');
    const ocorrenciaData = {
      placa1: 'TEST123',
      cliente: 'Cliente Teste',
      tipo: 'Recuperação',
      endereco: 'Rua Teste, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      operador: 'Laysla'
    };

    let ocorrenciaId;
    try {
      const ocorrenciaResponse = await axios.post(`${API_BASE_URL}/api/v1/ocorrencias`, ocorrenciaData);
      ocorrenciaId = ocorrenciaResponse.data.id;
      console.log('✅ Ocorrência criada com sucesso!');
      console.log(`   ID: ${ocorrenciaId}`);
    } catch (error) {
      console.log('❌ Erro ao criar ocorrência:', error.response?.data?.error || error.message);
      return;
    }

    // 2. Testar endpoint de prestador não cadastrado
    console.log('\n2️⃣ Testando endpoint prestadores-nao-cadastrados...');
    
    const prestadorData = {
      nome: 'Yago',
      telefone: '11947293221',
      ocorrencia_id: ocorrenciaId
    };

    try {
      const prestadorResponse = await axios.post(`${API_BASE_URL}/api/v1/prestadores-nao-cadastrados`, prestadorData);
      
      console.log('✅ Prestador não cadastrado adicionado com sucesso!');
      console.log('   Resposta:', prestadorResponse.data);
      
      // 3. Verificar se a ocorrência foi atualizada
      console.log('\n3️⃣ Verificando se a ocorrência foi atualizada...');
      
      try {
        const ocorrenciaAtualizada = await axios.get(`${API_BASE_URL}/api/v1/ocorrencias/${ocorrenciaId}`);
        
        console.log('✅ Ocorrência verificada:');
        console.log(`   ID: ${ocorrenciaAtualizada.data.id}`);
        console.log(`   Prestador: ${ocorrenciaAtualizada.data.prestador}`);
        console.log(`   Placa: ${ocorrenciaAtualizada.data.placa1}`);
        
        if (ocorrenciaAtualizada.data.prestador === 'Yago') {
          console.log('✅ Prestador foi corretamente adicionado à ocorrência!');
        } else {
          console.log('❌ Prestador não foi adicionado corretamente à ocorrência');
        }
        
      } catch (error) {
        console.log('❌ Erro ao verificar ocorrência:', error.response?.data?.error || error.message);
      }

    } catch (error) {
      console.log('❌ Erro ao adicionar prestador não cadastrado:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Erro: ${error.response?.data?.error || error.message}`);
      
      if (error.response?.data) {
        console.log('   Detalhes:', error.response.data);
      }
    }

    // 4. Limpeza - remover ocorrência de teste
    console.log('\n4️⃣ Limpando ocorrência de teste...');
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/ocorrencias/${ocorrenciaId}`);
      console.log('✅ Ocorrência de teste removida');
    } catch (error) {
      console.log('⚠️  Erro ao remover ocorrência de teste:', error.response?.data?.error || error.message);
    }

    console.log('\n🎉 Teste concluído!');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data?.error || error.message);
  }
}

testarPrestadorNaoCadastrado();
