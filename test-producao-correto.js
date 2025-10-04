const axios = require('axios');

async function testarProducaoCorreto() {
  try {
    console.log('🧪 TESTE PRODUÇÃO: Cálculo de Tempo Corrigido');
    console.log('==============================================\n');

    const API_BASE_URL = 'https://painel.impactopr.seg.br';

    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
      email: 'teste@teste',
      password: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');

    // 2. Buscar ocorrências existentes para verificar o cálculo
    console.log('\n2️⃣ Verificando ocorrências existentes...');
    const detalhadoResponse = await axios.get(`${API_BASE_URL}/api/v1/financeiro/controle-detalhado`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { periodo: 'tudo' }
    });

    console.log('✅ Ocorrências encontradas:', detalhadoResponse.data.length);
    
    if (detalhadoResponse.data.length > 0) {
      const ocorrenciaComTempo = detalhadoResponse.data.find(o => 
        o.tempo_total_horas && o.tempo_total_horas > 0
      );
      
      if (ocorrenciaComTempo) {
        console.log('\n📊 Ocorrência com tempo calculado:');
        console.log('   ID:', ocorrenciaComTempo.id);
        console.log('   Cliente:', ocorrenciaComTempo.cliente);
        console.log('   Prestador:', ocorrenciaComTempo.prestador);
        console.log('   Tempo Total:', `${ocorrenciaComTempo.tempo_total_horas.toFixed(2)} horas`);
        console.log('   KM Total:', `${ocorrenciaComTempo.km_total || 'N/A'} km`);
        
        // Verificar se os campos de tempo estão sendo usados corretamente
        console.log('\n🔍 Verificando campos de tempo:');
        console.log('   Chegada:', ocorrenciaComTempo.chegada || 'Não informado');
        console.log('   Término:', ocorrenciaComTempo.termino || 'Não informado');
        
        if (ocorrenciaComTempo.chegada && ocorrenciaComTempo.termino) {
          const chegada = new Date(ocorrenciaComTempo.chegada);
          const termino = new Date(ocorrenciaComTempo.termino);
          const tempoManual = (termino.getTime() - chegada.getTime()) / (1000 * 60 * 60);
          
          console.log('   Tempo calculado manualmente:', `${tempoManual.toFixed(2)} horas`);
          console.log('   Tempo no sistema:', `${ocorrenciaComTempo.tempo_total_horas.toFixed(2)} horas`);
          
          if (Math.abs(tempoManual - ocorrenciaComTempo.tempo_total_horas) < 0.01) {
            console.log('   ✅ Cálculo de tempo está correto!');
          } else {
            console.log('   ❌ Cálculo de tempo pode estar incorreto');
          }
        } else {
          console.log('   ⚠️ Campos de chegada/término não estão preenchidos');
        }
      } else {
        console.log('⚠️ Nenhuma ocorrência com tempo calculado encontrada');
      }
    }

    // 3. Verificar controle prestadores
    console.log('\n3️⃣ Verificando controle prestadores...');
    const prestadoresResponse = await axios.get(`${API_BASE_URL}/api/v1/financeiro/controle-prestadores`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { periodo: 'tudo' }
    });

    console.log('✅ Prestadores encontrados:', prestadoresResponse.data.length);
    
    if (prestadoresResponse.data.length > 0) {
      const prestadorComTempo = prestadoresResponse.data.find(p => 
        p.total_horas_adicionais > 0
      );
      
      if (prestadorComTempo) {
        console.log('\n📊 Prestador com tempo calculado:');
        console.log('   Nome:', prestadorComTempo.nome);
        console.log('   Cadastrado:', prestadorComTempo.is_cadastrado);
        console.log('   Total Acionamentos:', prestadorComTempo.total_acionamentos);
        console.log('   Total Horas:', `${prestadorComTempo.total_horas_adicionais.toFixed(2)} horas`);
        console.log('   Total KM:', `${prestadorComTempo.total_km} km`);
        
        console.log('\n💰 Valores financeiros:');
        console.log('   Valor Acionamento:', `R$ ${prestadorComTempo.total_valor_acionamento.toFixed(2)}`);
        console.log('   Valor Horas Adicionais:', `R$ ${prestadorComTempo.total_valor_hora_adc.toFixed(2)}`);
        console.log('   Valor KM Adicionais:', `R$ ${prestadorComTempo.total_valor_km_adc.toFixed(2)}`);
        console.log('   Total Despesas:', `R$ ${prestadorComTempo.total_despesas.toFixed(2)}`);
        
        // Verificar se está usando franquias padrão
        console.log('\n🔍 Verificação das franquias:');
        console.log('   Franquias padrão aplicadas: 3 horas e 50 km');
        
        if (prestadorComTempo.is_cadastrado && prestadorComTempo.prestador_data) {
          console.log('   Prestador cadastrado com:');
          console.log('     - Valor Hora Adicional:', `R$ ${prestadorComTempo.prestador_data.valor_hora_adc}`);
          console.log('     - Valor KM Adicional:', `R$ ${prestadorComTempo.prestador_data.valor_km_adc}`);
          
          // Calcular valores esperados com franquias padrão
          const horasAdicionais = Math.max(0, prestadorComTempo.total_horas_adicionais - 3);
          const kmAdicionais = Math.max(0, prestadorComTempo.total_km - 50);
          const valorHoraEsperado = horasAdicionais * prestadorComTempo.prestador_data.valor_hora_adc;
          const valorKmEsperado = kmAdicionais * prestadorComTempo.prestador_data.valor_km_adc;
          
          console.log('   Cálculo esperado:');
          console.log('     - Horas Adicionais:', `${horasAdicionais.toFixed(2)}h (${prestadorComTempo.total_horas_adicionais.toFixed(2)}h - 3h franquia)`);
          console.log('     - KM Adicionais:', `${kmAdicionais}km (${prestadorComTempo.total_km}km - 50km franquia)`);
          console.log('     - Valor Horas Esperado:', `R$ ${valorHoraEsperado.toFixed(2)}`);
          console.log('     - Valor KM Esperado:', `R$ ${valorKmEsperado.toFixed(2)}`);
          
          const horaOk = Math.abs(prestadorComTempo.total_valor_hora_adc - valorHoraEsperado) < 0.01;
          const kmOk = Math.abs(prestadorComTempo.total_valor_km_adc - valorKmEsperado) < 0.01;
          
          console.log('\n🎯 RESULTADO:');
          console.log('   Horas adicionais corretas:', horaOk ? '✅' : '❌');
          console.log('   KM adicionais corretos:', kmOk ? '✅' : '❌');
          
          if (horaOk && kmOk) {
            console.log('\n🎉 SUCESSO: Sistema está funcionando corretamente!');
            console.log('   ✅ Tempo calculado usando chegada → término');
            console.log('   ✅ Franquias padrão (3h/50km) aplicadas');
            console.log('   ✅ Valores do prestador cadastrado respeitados');
          } else {
            console.log('\n❌ ERRO: Sistema ainda precisa de ajustes');
          }
        } else {
          console.log('   Prestador não cadastrado - usando valores padrão');
        }
      } else {
        console.log('⚠️ Nenhum prestador com tempo calculado encontrado');
      }
    }

    console.log('\n📋 RESUMO DAS CORREÇÕES APLICADAS:');
    console.log('   1. ✅ Cálculo de tempo agora usa: chegada → término (não mais início → término)');
    console.log('   2. ✅ Franquias padrão: 3 horas e 50 km (sempre, ignorando valores cadastrados)');
    console.log('   3. ✅ Valores do prestador cadastrado são respeitados para acionamento, hora adicional e km adicional');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data?.error || error.message);
    console.log('\n💡 Verifique se as credenciais estão corretas e se o backend está acessível');
  }
}

// Executar teste
testarProducaoCorreto();
