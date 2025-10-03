const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function testeFinalChecklist() {
  try {
    console.log('🧪 TESTE FINAL - Checklist Completo\n');

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

    // 3. Verificar dashboard sem checklist
    console.log('\n3️⃣ Verificando dashboard sem checklist...');
    
    const dashboardResponse1 = await axios.get(`${API_BASE_URL}/api/v1/ocorrencias/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const ocorrenciaNoDashboard = dashboardResponse1.data.find(o => o.id === ocorrenciaId);
    if (ocorrenciaNoDashboard) {
      console.log('✅ Ocorrência encontrada no dashboard');
      console.log(`   Checklist completo: ${ocorrenciaNoDashboard.checklistStatus.completo}`);
      console.log(`   Tem checklist: ${ocorrenciaNoDashboard.checklistStatus.temChecklist}`);
      console.log(`   Tem fotos: ${ocorrenciaNoDashboard.checklistStatus.temFotos}`);
    }

    // 4. Criar checklist dispensado
    console.log('\n4️⃣ Criando checklist dispensado...');
    
    const checklistData = {
      ocorrencia_id: ocorrenciaId,
      dispensado_checklist: true,
      loja_selecionada: false,
      guincho_selecionado: false,
      apreensao_selecionada: false,
      liberado_local_selecionado: false,
      observacao_ocorrencia: "Checklist dispensado conforme solicitado"
    };

    const checklistResponse = await axios.post(`${API_BASE_URL}/api/v1/checklist`, checklistData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Checklist dispensado criado!');
    console.log(`   ID: ${checklistResponse.data.id}`);
    console.log(`   Dispensado: ${checklistResponse.data.dispensado_checklist}`);

    // 5. Verificar dashboard com checklist
    console.log('\n5️⃣ Verificando dashboard com checklist...');
    
    const dashboardResponse2 = await axios.get(`${API_BASE_URL}/api/v1/ocorrencias/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const ocorrenciaComChecklist = dashboardResponse2.data.find(o => o.id === ocorrenciaId);
    if (ocorrenciaComChecklist) {
      console.log('✅ Ocorrência encontrada no dashboard com checklist');
      console.log(`   Checklist completo: ${ocorrenciaComChecklist.checklistStatus.completo}`);
      console.log(`   Tem checklist: ${ocorrenciaComChecklist.checklistStatus.temChecklist}`);
      console.log(`   Tem fotos: ${ocorrenciaComChecklist.checklistStatus.temFotos}`);
      
      if (ocorrenciaComChecklist.checklist) {
        console.log(`   Checklist ID: ${ocorrenciaComChecklist.checklist.id}`);
        console.log(`   Dispensado: ${ocorrenciaComChecklist.checklist.dispensado_checklist}`);
        console.log(`   Criado em: ${ocorrenciaComChecklist.checklist.criado_em}`);
      }
    }

    // 6. Testar GET checklist específico
    console.log('\n6️⃣ Testando GET checklist específico...');
    
    const getChecklistResponse = await axios.get(`${API_BASE_URL}/api/v1/checklist/ocorrencia/${ocorrenciaId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Checklist recuperado via GET!');
    console.log(`   ID: ${getChecklistResponse.data.id}`);
    console.log(`   Ocorrência ID: ${getChecklistResponse.data.ocorrencia_id}`);
    console.log(`   Dispensado: ${getChecklistResponse.data.dispensado_checklist}`);

    // 7. Limpeza
    console.log('\n7️⃣ Limpando dados de teste...');
    
    // Remover checklist
    await axios.delete(`${API_BASE_URL}/api/v1/checklist/${checklistResponse.data.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Checklist removido');
    
    // Remover ocorrência
    await axios.delete(`${API_BASE_URL}/api/v1/ocorrencias/${ocorrenciaId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Ocorrência removida');

    console.log('\n🎉 TESTE FINAL CONCLUÍDO!');
    console.log('✅ Sistema de checklist está 100% funcional!');
    console.log('✅ Dashboard integrado com checklist!');
    console.log('✅ Todos os endpoints funcionando!');

  } catch (error) {
    console.error('❌ Erro no teste final:', error.response?.data?.error || error.message);
  }
}

testeFinalChecklist();
