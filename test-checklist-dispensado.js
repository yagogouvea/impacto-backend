const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function testarChecklistDispensado() {
  try {
    console.log('🧪 TESTE - Checklist Dispensado (cenário do frontend)\n');

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

    // 3. Testar o payload exato do frontend
    console.log('\n3️⃣ Testando checklist dispensado (payload do frontend)...');
    
    const checklistData = {
      ocorrencia_id: ocorrenciaId,
      dispensado_checklist: true,
      loja_selecionada: false,
      nome_loja: undefined,
      endereco_loja: undefined,
      nome_atendente: undefined,
      matricula_atendente: undefined,
      guincho_selecionado: false,
      tipo_guincho: undefined,
      valor_guincho: undefined,
      telefone_guincho: undefined,
      nome_empresa_guincho: undefined,
      nome_motorista_guincho: undefined,
      destino_guincho: undefined,
      endereco_destino_guincho: undefined,
      apreensao_selecionada: false,
      nome_dp_batalhao: undefined,
      endereco_apreensao: undefined,
      numero_bo_noc: undefined,
      liberado_local_selecionado: false,
      liberado_nome_responsavel: undefined,
      liberado_numero_referencia: undefined,
      recuperado_com_chave: undefined,
      posse_veiculo: undefined,
      observacao_posse: "",
      avarias: undefined,
      detalhes_avarias: undefined,
      fotos_realizadas: undefined,
      justificativa_fotos: undefined,
      observacao_ocorrencia: ""
    };

    try {
      const checklistResponse = await axios.post(`${API_BASE_URL}/api/v1/checklist`, checklistData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Checklist dispensado criado com sucesso!');
      console.log('   ID:', checklistResponse.data.id);
      console.log('   Ocorrência ID:', checklistResponse.data.ocorrencia_id);
      console.log('   Dispensado:', checklistResponse.data.dispensado_checklist);
      console.log('   Loja selecionada:', checklistResponse.data.loja_selecionada);
      console.log('   Guincho selecionado:', checklistResponse.data.guincho_selecionado);
      console.log('   Apreensão selecionada:', checklistResponse.data.apreensao_selecionada);
      console.log('   Liberado local:', checklistResponse.data.liberado_local_selecionado);
      
      const checklistId = checklistResponse.data.id;

      // 4. Verificar se pode ser recuperado
      console.log('\n4️⃣ Verificando se checklist pode ser recuperado...');
      
      const getResponse = await axios.get(`${API_BASE_URL}/api/v1/checklist/ocorrencia/${ocorrenciaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Checklist recuperado com sucesso!');
      console.log('   Dispensado:', getResponse.data.dispensado_checklist);
      console.log('   Criado em:', getResponse.data.criado_em);

      // 5. Limpeza
      console.log('\n5️⃣ Limpando dados de teste...');
      
      // Remover checklist
      await axios.delete(`${API_BASE_URL}/api/v1/checklist/${checklistId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Checklist removido');
      
      // Remover ocorrência
      await axios.delete(`${API_BASE_URL}/api/v1/ocorrencias/${ocorrenciaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Ocorrência removida');

      console.log('\n🎉 TESTE CONCLUÍDO!');
      console.log('✅ Checklist dispensado funcionando perfeitamente!');

    } catch (error) {
      console.log('❌ Erro ao criar checklist dispensado:');
      console.log(`   Status: ${error.response?.status}`);
      console.log(`   Erro: ${error.response?.data?.error || error.message}`);
      
      if (error.response?.data) {
        console.log('   Detalhes:', error.response.data);
      }
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data?.error || error.message);
  }
}

testarChecklistDispensado();
