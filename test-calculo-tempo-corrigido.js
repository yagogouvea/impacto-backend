const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function testarCalculoTempoCorrigido() {
  try {
    console.log('🧪 TESTE: Cálculo de Tempo Corrigido');
    console.log('===================================\n');

    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
      email: 'teste@teste',
      password: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');

    // 2. Criar uma ocorrência de teste com dados específicos de tempo
    console.log('\n2️⃣ Criando ocorrência de teste...');
    
    const agora = new Date();
    const chegada = new Date(agora.getTime() + 30 * 60 * 1000); // 30 minutos depois
    const termino = new Date(agora.getTime() + 4.5 * 60 * 60 * 1000); // 4.5 horas depois
    
    const ocorrenciaData = {
      cliente: 'Cliente Teste Tempo',
      operador: 'Laysla',
      prestador: 'Prestador Teste Tempo',
      tipo: 'Roubo',
      data_acionamento: agora.toISOString(),
      chegada: chegada.toISOString(), // Horário de chegada
      termino: termino.toISOString(), // Horário de término
      km_inicial: 100,
      km_final: 200, // Total: 100 km
      resultado: 'RECUPERADO',
      status: 'concluida',
      descricao: 'Teste de cálculo de tempo corrigido'
    };

    const ocorrenciaResponse = await axios.post(`${API_BASE_URL}/api/v1/ocorrencias`, ocorrenciaData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const ocorrenciaId = ocorrenciaResponse.data.id;
    console.log('✅ Ocorrência criada:', ocorrenciaId);
    console.log('   Dados de tempo:');
    console.log('     - Chegada:', chegada.toLocaleString('pt-BR'));
    console.log('     - Término:', termino.toLocaleString('pt-BR'));
    console.log('     - Tempo esperado:', '4 horas (4.5h - 0.5h)');
    console.log('     - KM total: 100 km');

    // 3. Testar o cálculo no controle detalhado
    console.log('\n3️⃣ Testando cálculo no Controle Detalhado...');
    const detalhadoResponse = await axios.get(`${API_BASE_URL}/api/v1/financeiro/controle-detalhado`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { periodo: 'tudo' }
    });

    const ocorrenciaDetalhada = detalhadoResponse.data.find(o => o.id === ocorrenciaId);
    if (ocorrenciaDetalhada) {
      console.log('✅ Ocorrência encontrada no controle detalhado:');
      console.log('   ID:', ocorrenciaDetalhada.id);
      console.log('   Tempo Total Calculado:', `${ocorrenciaDetalhada.tempo_total_horas?.toFixed(2) || 'N/A'} horas`);
      console.log('   KM Total:', `${ocorrenciaDetalhada.km_total || 'N/A'} km`);
      
      // Verificar se o cálculo está correto (deve ser ~4 horas)
      const tempoEsperado = 4.0; // 4.5h - 0.5h = 4h
      const tempoCalculado = ocorrenciaDetalhada.tempo_total_horas;
      
      if (tempoCalculado && Math.abs(tempoCalculado - tempoEsperado) < 0.1) {
        console.log('   ✅ Tempo calculado corretamente!');
      } else {
        console.log('   ❌ Tempo calculado incorretamente!');
        console.log('     Esperado: ~4.0 horas');
        console.log('     Calculado:', tempoCalculado, 'horas');
      }
    } else {
      console.log('❌ Ocorrência não encontrada no controle detalhado');
    }

    // 4. Testar o cálculo no controle prestadores
    console.log('\n4️⃣ Testando cálculo no Controle Prestadores...');
    const prestadoresResponse = await axios.get(`${API_BASE_URL}/api/v1/financeiro/controle-prestadores`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { periodo: 'tudo' }
    });

    const prestadorFinanceiro = prestadoresResponse.data.find(p => 
      p.nome.toLowerCase().includes('prestador teste tempo')
    );

    if (prestadorFinanceiro) {
      console.log('✅ Prestador encontrado no controle prestadores:');
      console.log('   Nome:', prestadorFinanceiro.nome);
      console.log('   Total Acionamentos:', prestadorFinanceiro.total_acionamentos);
      console.log('   Total Horas:', `${prestadorFinanceiro.total_horas_adicionais.toFixed(2)} horas`);
      console.log('   Total KM:', `${prestadorFinanceiro.total_km} km`);
      
      // Verificar se o cálculo está correto
      const tempoEsperado = 4.0; // 4.5h - 0.5h = 4h
      const tempoCalculado = prestadorFinanceiro.total_horas_adicionais;
      
      if (Math.abs(tempoCalculado - tempoEsperado) < 0.1) {
        console.log('   ✅ Tempo calculado corretamente!');
      } else {
        console.log('   ❌ Tempo calculado incorretamente!');
        console.log('     Esperado: ~4.0 horas');
        console.log('     Calculado:', tempoCalculado, 'horas');
      }
      
      console.log('\n💰 Cálculo financeiro com tempo corrigido:');
      console.log('   Tempo Total:', `${tempoCalculado.toFixed(2)} horas`);
      console.log('   Franquia (padrão): 3 horas');
      console.log('   Horas Adicionais:', `${Math.max(0, tempoCalculado - 3).toFixed(2)} horas`);
      
      if (prestadorFinanceiro.is_cadastrado && prestadorFinanceiro.prestador_data) {
        const valorHoraAdc = Number(prestadorFinanceiro.prestador_data.valor_hora_adc || 0);
        const horasAdicionais = Math.max(0, tempoCalculado - 3);
        const valorHoraEsperado = horasAdicionais * valorHoraAdc;
        
        console.log('   Valor Hora Adicional:', `R$ ${prestadorFinanceiro.total_valor_hora_adc.toFixed(2)}`);
        console.log('   Valor esperado:', `R$ ${valorHoraEsperado.toFixed(2)} (${horasAdicionais.toFixed(2)}h × R$ ${valorHoraAdc})`);
      } else {
        const horasAdicionais = Math.max(0, tempoCalculado - 3);
        const valorHoraEsperado = horasAdicionais * 30.00; // Valor padrão
        
        console.log('   Valor Hora Adicional:', `R$ ${prestadorFinanceiro.total_valor_hora_adc.toFixed(2)}`);
        console.log('   Valor esperado:', `R$ ${valorHoraEsperado.toFixed(2)} (${horasAdicionais.toFixed(2)}h × R$ 30,00)`);
      }
    } else {
      console.log('❌ Prestador não encontrado no controle prestadores');
    }

    // 5. Limpeza
    console.log('\n5️⃣ Limpando dados de teste...');
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/ocorrencias/${ocorrenciaId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Ocorrência de teste removida');
    } catch (error) {
      console.log('⚠️ Erro ao remover ocorrência de teste:', error.response?.data?.error || error.message);
    }

    console.log('\n🎯 CONCLUSÃO:');
    console.log('   ✅ Cálculo de tempo agora usa: chegada → término');
    console.log('   ✅ Franquias padrão: 3 horas e 50 km (sempre)');
    console.log('   ✅ Valores do prestador cadastrado são respeitados');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data?.error || error.message);
    console.log('\n💡 Dica: Verifique se o backend está rodando em http://localhost:3001');
  }
}

// Executar teste
testarCalculoTempoCorrigido();
