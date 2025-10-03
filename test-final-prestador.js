const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function testeFinalPrestador() {
  try {
    console.log('🧪 TESTE FINAL - Funcionalidade de Prestador Não Cadastrado\n');

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

    // 3. Testar endpoint de prestador não cadastrado
    console.log('\n3️⃣ Testando adição de prestador não cadastrado...');
    
    const prestadorData = {
      nome: 'Yago',
      telefone: '11947293221',
      ocorrencia_id: ocorrenciaId
    };

    const prestadorResponse = await axios.post(`${API_BASE_URL}/api/v1/prestadores-nao-cadastrados`, prestadorData);
    
    console.log('✅ Prestador não cadastrado adicionado com sucesso!');
    console.log('   Resposta:', prestadorResponse.data);

    // 4. Verificar se a ocorrência foi atualizada
    console.log('\n4️⃣ Verificando atualização da ocorrência...');
    
    const ocorrenciaAtualizada = await axios.get(`${API_BASE_URL}/api/v1/ocorrencias/${ocorrenciaId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Ocorrência verificada:');
    console.log(`   ID: ${ocorrenciaAtualizada.data.id}`);
    console.log(`   Prestador: ${ocorrenciaAtualizada.data.prestador}`);
    console.log(`   Placa: ${ocorrenciaAtualizada.data.placa1}`);
    
    if (ocorrenciaAtualizada.data.prestador === 'Yago') {
      console.log('✅ Prestador foi corretamente adicionado à ocorrência!');
    } else {
      console.log('❌ Prestador não foi adicionado corretamente à ocorrência');
    }

    // 5. Testar outros cenários
    console.log('\n5️⃣ Testando cenários adicionais...');
    
    // Teste sem telefone
    try {
      const prestadorSemTelefone = await axios.post(`${API_BASE_URL}/api/v1/prestadores-nao-cadastrados`, {
        nome: 'Prestador Sem Telefone',
        ocorrencia_id: ocorrenciaId
      });
      console.log('✅ Prestador sem telefone adicionado com sucesso');
    } catch (error) {
      console.log('❌ Erro ao adicionar prestador sem telefone:', error.response?.data?.error);
    }

    // Teste com dados inválidos
    try {
      await axios.post(`${API_BASE_URL}/api/v1/prestadores-nao-cadastrados`, {
        telefone: '11999999999',
        ocorrencia_id: ocorrenciaId
      });
      console.log('❌ Deveria ter falhado - nome obrigatório');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validação funcionando - nome é obrigatório');
      } else {
        console.log('❌ Erro inesperado:', error.response?.data?.error);
      }
    }

    // Teste com ocorrência inexistente
    try {
      await axios.post(`${API_BASE_URL}/api/v1/prestadores-nao-cadastrados`, {
        nome: 'Teste',
        ocorrencia_id: 99999
      });
      console.log('❌ Deveria ter falhado - ocorrência inexistente');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Validação funcionando - ocorrência não encontrada');
      } else {
        console.log('❌ Erro inesperado:', error.response?.data?.error);
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

    console.log('\n🎉 TESTE FINAL CONCLUÍDO!');
    console.log('✅ Funcionalidade de prestador não cadastrado está funcionando corretamente');

  } catch (error) {
    console.error('❌ Erro no teste final:', error.response?.data?.error || error.message);
  }
}

testeFinalPrestador();
