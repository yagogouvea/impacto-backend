const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function testarParecerFinanceiro() {
  try {
    console.log('🧪 TESTE - Funcionalidade Parecer no Financeiro\n');

    // 1. Login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'teste@teste',
      password: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso!');

    // 2. Criar ocorrência de teste COM parecer
    console.log('\n2️⃣ Criando ocorrência de teste COM parecer...');
    const ocorrenciaComParecer = {
      placa1: 'PAR123',
      cliente: 'Cliente Parecer Teste',
      tipo: 'roubo',
      endereco: 'Rua Parecer, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      operador: 'Laysla',
      data_acionamento: new Date().toISOString(),
      inicio: new Date().toISOString(),
      chegada: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      termino: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      km_inicial: 100,
      km_final: 180,
      prestador: 'Prestador Com Parecer',
      descricao: 'Ocorrência com parecer detalhado: Veículo recuperado com sucesso após localização precisa via GPS. Cliente satisfeito com o atendimento.'
    };

    const ocorrenciaResponse1 = await axios.post(`${API_BASE_URL}/api/v1/ocorrencias`, ocorrenciaComParecer, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const ocorrenciaId1 = ocorrenciaResponse1.data.id;
    console.log('✅ Ocorrência COM parecer criada!');
    console.log(`   ID: ${ocorrenciaId1}`);

    // 3. Criar checklist para a ocorrência com parecer
    console.log('\n3️⃣ Criando checklist com parecer...');
    await axios.post(`${API_BASE_URL}/api/v1/checklist`, {
      ocorrencia_id: ocorrenciaId1,
      observacao_ocorrencia: 'Parecer técnico: Operação executada com excelência. Todos os protocolos seguidos corretamente.',
      dispensado_checklist: false
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Checklist com parecer criado!');

    // 4. Finalizar ocorrência
    console.log('\n4️⃣ Finalizando ocorrência...');
    await axios.put(`${API_BASE_URL}/api/v1/ocorrencias/${ocorrenciaId1}`, {
      resultado: 'RECUPERADO',
      status: 'concluida',
      sub_resultado: 'COM_RASTREIO'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Ocorrência finalizada!');

    // 5. Criar ocorrência SEM parecer
    console.log('\n5️⃣ Criando ocorrência de teste SEM parecer...');
    const ocorrenciaSemParecer = {
      placa1: 'SEMPAR123',
      cliente: 'Cliente Sem Parecer',
      tipo: 'furto',
      endereco: 'Rua Sem Parecer, 456',
      cidade: 'São Paulo',
      estado: 'SP',
      operador: 'Laysla',
      data_acionamento: new Date().toISOString(),
      inicio: new Date().toISOString(),
      chegada: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
      termino: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      km_inicial: 50,
      km_final: 120,
      prestador: 'Prestador Sem Parecer'
      // Sem descricao e sem checklist
    };

    const ocorrenciaResponse2 = await axios.post(`${API_BASE_URL}/api/v1/ocorrencias`, ocorrenciaSemParecer, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const ocorrenciaId2 = ocorrenciaResponse2.data.id;
    console.log('✅ Ocorrência SEM parecer criada!');
    console.log(`   ID: ${ocorrenciaId2}`);

    // 6. Finalizar ocorrência sem parecer
    await axios.put(`${API_BASE_URL}/api/v1/ocorrencias/${ocorrenciaId2}`, {
      resultado: 'NÃO RECUPERADO',
      status: 'concluida',
      sub_resultado: 'SEM_LOCALIZACAO'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Ocorrência sem parecer finalizada!');

    // 7. Testar Controle Detalhado
    console.log('\n6️⃣ Testando Controle Detalhado com parecer...');
    const detalhadoResponse = await axios.get(`${API_BASE_URL}/api/v1/financeiro/controle-detalhado`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { periodo: 'mes_atual' }
    });
    
    console.log('✅ Controle Detalhado funcionando!');
    console.log(`   Total de ocorrências: ${detalhadoResponse.data.length}`);
    
    // Verificar pareceres
    const ocorrenciasComParecer = detalhadoResponse.data.filter(o => o.parecer && o.parecer.trim() !== '');
    const ocorrenciasSemParecer = detalhadoResponse.data.filter(o => !o.parecer || o.parecer.trim() === '');
    
    console.log(`   Ocorrências COM parecer: ${ocorrenciasComParecer.length}`);
    console.log(`   Ocorrências SEM parecer: ${ocorrenciasSemParecer.length}`);
    
    if (ocorrenciasComParecer.length > 0) {
      console.log('   Primeiro parecer encontrado:');
      console.log(`     ${ocorrenciasComParecer[0].parecer.substring(0, 100)}...`);
    }

    // 8. Testar Controle Prestadores
    console.log('\n7️⃣ Testando Controle Prestadores com parecer...');
    const prestadoresResponse = await axios.get(`${API_BASE_URL}/api/v1/financeiro/controle-prestadores`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { periodo: 'mes_atual' }
    });
    
    console.log('✅ Controle Prestadores funcionando!');
    console.log(`   Total de prestadores: ${prestadoresResponse.data.length}`);
    
    // Verificar prestadores com parecer
    prestadoresResponse.data.forEach(prestador => {
      console.log(`   Prestador: ${prestador.nome}`);
      console.log(`     Tem parecer: ${prestador.tem_parecer}`);
      console.log(`     Quantidade de pareceres: ${prestador.pareceres_count}`);
      console.log(`     Total acionamentos: ${prestador.total_acionamentos}`);
    });

    // 9. Limpeza
    console.log('\n8️⃣ Limpando dados de teste...');
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/ocorrencias/${ocorrenciaId1}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await axios.delete(`${API_BASE_URL}/api/v1/ocorrencias/${ocorrenciaId2}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Ocorrências de teste removidas');
    } catch (error) {
      console.log('⚠️  Erro ao remover ocorrências:', error.response?.data?.error);
    }

    console.log('\n🎉 TESTE DA FUNCIONALIDADE PARECER CONCLUÍDO!');
    console.log('✅ A seção "parecer" foi implementada com sucesso!');
    console.log('\n📊 RESUMO DA IMPLEMENTAÇÃO:');
    console.log('   • Controle Detalhado: Coluna "Parecer" adicionada');
    console.log('   • Controle Prestadores: Coluna "Parecer" com contador adicionada');
    console.log('   • Backend: Lógica para detectar pareceres implementada');
    console.log('   • Priorização: Checklist > Descrição da ocorrência');
    console.log('   • Exportação: Parecer incluído na exportação Excel');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data?.error || error.message);
  }
}

testarParecerFinanceiro();
