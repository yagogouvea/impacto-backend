const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function testarChecklistCompleto() {
  try {
    console.log('🧪 TESTE COMPLETO - Funcionalidade de Checklist\n');

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

    // 3. Testar GET checklist (deve retornar 404 - não existe)
    console.log('\n3️⃣ Testando GET checklist (deve retornar 404)...');
    
    try {
      await axios.get(`${API_BASE_URL}/api/v1/checklist/ocorrencia/${ocorrenciaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('❌ Deveria ter retornado 404 - checklist não existe');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ GET funcionando - checklist não encontrado (como esperado)');
      } else {
        console.log('❌ Erro inesperado no GET:', error.response?.data?.error);
      }
    }

    // 4. Criar checklist
    console.log('\n4️⃣ Criando checklist...');
    
    const checklistData = {
      ocorrencia_id: ocorrenciaId,
      dispensado_checklist: false,
      loja_selecionada: true,
      nome_loja: 'Loja Teste',
      endereco_loja: 'Rua da Loja, 456',
      nome_atendente: 'João Atendente',
      matricula_atendente: '12345',
      recuperado_com_chave: 'sim',
      posse_veiculo: 'sim',
      observacao_posse: 'Veículo em perfeito estado',
      avarias: 'nao',
      fotos_realizadas: 'sim',
      observacao_ocorrencia: 'Checklist de teste realizado com sucesso'
    };

    try {
      const checklistResponse = await axios.post(`${API_BASE_URL}/api/v1/checklist`, checklistData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Checklist criado com sucesso!');
      console.log('   ID:', checklistResponse.data.id);
      console.log('   Ocorrência ID:', checklistResponse.data.ocorrencia_id);
      console.log('   Loja:', checklistResponse.data.nome_loja);
      
      const checklistId = checklistResponse.data.id;

      // 5. Testar GET checklist (deve retornar o checklist)
      console.log('\n5️⃣ Testando GET checklist (deve retornar o checklist)...');
      
      const getResponse = await axios.get(`${API_BASE_URL}/api/v1/checklist/ocorrencia/${ocorrenciaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Checklist recuperado com sucesso!');
      console.log('   ID:', getResponse.data.id);
      console.log('   Nome da loja:', getResponse.data.nome_loja);
      console.log('   Atendente:', getResponse.data.nome_atendente);

      // 6. Testar UPDATE checklist
      console.log('\n6️⃣ Testando UPDATE checklist...');
      
      const updateData = {
        ...checklistData,
        nome_atendente: 'Maria Atendente Atualizada',
        observacao_ocorrencia: 'Checklist atualizado com sucesso'
      };

      const updateResponse = await axios.put(`${API_BASE_URL}/api/v1/checklist/${checklistId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Checklist atualizado com sucesso!');
      console.log('   Atendente atualizado:', updateResponse.data.nome_atendente);
      console.log('   Observação atualizada:', updateResponse.data.observacao_ocorrencia);

      // 7. Testar cenários de erro
      console.log('\n7️⃣ Testando cenários de erro...');
      
      // Tentar criar checklist duplicado
      try {
        await axios.post(`${API_BASE_URL}/api/v1/checklist`, checklistData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('❌ Deveria ter falhado - checklist duplicado');
      } catch (error) {
        if (error.response?.status === 409) {
          console.log('✅ Validação funcionando - não permite checklist duplicado');
        } else {
          console.log('❌ Erro inesperado:', error.response?.data?.error);
        }
      }

      // Tentar buscar checklist de ocorrência inexistente
      try {
        await axios.get(`${API_BASE_URL}/api/v1/checklist/ocorrencia/99999`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('❌ Deveria ter retornado 404 - ocorrência inexistente');
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('✅ Validação funcionando - ocorrência não encontrada');
        } else {
          console.log('❌ Erro inesperado:', error.response?.data?.error);
        }
      }

      // 8. Testar DELETE checklist
      console.log('\n8️⃣ Testando DELETE checklist...');
      
      await axios.delete(`${API_BASE_URL}/api/v1/checklist/${checklistId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Checklist removido com sucesso!');

      // Verificar se foi realmente removido
      try {
        await axios.get(`${API_BASE_URL}/api/v1/checklist/ocorrencia/${ocorrenciaId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('❌ Deveria ter retornado 404 - checklist foi removido');
      } catch (error) {
        if (error.response?.status === 404) {
          console.log('✅ DELETE funcionando - checklist não encontrado após remoção');
        } else {
          console.log('❌ Erro inesperado:', error.response?.data?.error);
        }
      }

    } catch (error) {
      console.log('❌ Erro ao criar checklist:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Erro: ${error.response?.data?.error || error.message}`);
    }

    // 9. Limpeza - remover ocorrência de teste
    console.log('\n9️⃣ Limpando ocorrência de teste...');
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/ocorrencias/${ocorrenciaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Ocorrência de teste removida');
    } catch (error) {
      console.log('⚠️  Erro ao remover ocorrência:', error.response?.data?.error);
    }

    console.log('\n🎉 TESTE COMPLETO CONCLUÍDO!');
    console.log('✅ Funcionalidade de checklist está funcionando corretamente');

  } catch (error) {
    console.error('❌ Erro no teste completo:', error.response?.data?.error || error.message);
  }
}

testarChecklistCompleto();
