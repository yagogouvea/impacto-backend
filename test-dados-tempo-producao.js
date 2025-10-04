const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'https://painel.impactopr.seg.br';

async function investigarDadosTempo() {
  try {
    console.log('🔍 INVESTIGAÇÃO: Dados de Tempo em Produção');
    console.log('==========================================\n');

    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
      email: 'teste@teste',
      password: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');

    // 2. Buscar ocorrências com dados de tempo
    console.log('\n2️⃣ Buscando ocorrências com dados de tempo...');
    const ocorrenciasResponse = await axios.get(`${API_BASE_URL}/api/v1/ocorrencias/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { periodo: 'tudo' }
    });

    console.log('✅ Ocorrências encontradas:', ocorrenciasResponse.data.length);
    
    if (ocorrenciasResponse.data.length > 0) {
      console.log('\n📊 Análise dos campos de tempo:');
      
      let comChegada = 0;
      let comTermino = 0;
      let comAmbos = 0;
      let semTempo = 0;
      
      ocorrenciasResponse.data.forEach((ocorrencia, index) => {
        const temChegada = !!ocorrencia.chegada;
        const temTermino = !!ocorrencia.termino;
        const temAmbos = temChegada && temTermino;
        
        if (temAmbos) {
          comAmbos++;
          // Calcular tempo total
          const chegada = new Date(ocorrencia.chegada);
          const termino = new Date(ocorrencia.termino);
          const diffMs = termino.getTime() - chegada.getTime();
          const diffHours = diffMs / (1000 * 60 * 60);
          
          console.log(`\n   ${index + 1}. Ocorrência ID: ${ocorrencia.id}`);
          console.log(`      Cliente: ${ocorrencia.cliente}`);
          console.log(`      Prestador: ${ocorrencia.prestador}`);
          console.log(`      Início: ${ocorrencia.inicio || 'N/A'}`);
          console.log(`      Chegada: ${ocorrencia.chegada || 'N/A'}`);
          console.log(`      Término: ${ocorrencia.termino || 'N/A'}`);
          console.log(`      Data Acionamento: ${ocorrencia.data_acionamento || 'N/A'}`);
          console.log(`      Tempo Total: ${diffHours.toFixed(2)} horas`);
          
          if (diffHours < 0) {
            console.log(`      ⚠️ TEMPO NEGATIVO! Término antes da chegada`);
          } else if (diffHours === 0) {
            console.log(`      ⚠️ TEMPO ZERO! Mesmo horário de chegada e término`);
          }
        } else {
          if (temChegada) comChegada++;
          if (temTermino) comTermino++;
          if (!temChegada && !temTermino) semTempo++;
          
          console.log(`\n   ${index + 1}. Ocorrência ID: ${ocorrencia.id} - DADOS INCOMPLETOS`);
          console.log(`      Cliente: ${ocorrencia.cliente}`);
          console.log(`      Prestador: ${ocorrencia.prestador}`);
          console.log(`      Chegada: ${ocorrencia.chegada || '❌ AUSENTE'}`);
          console.log(`      Término: ${ocorrencia.termino || '❌ AUSENTE'}`);
        }
      });
      
      console.log('\n📈 ESTATÍSTICAS DOS CAMPOS DE TEMPO:');
      console.log(`   - Com chegada e término: ${comAmbos}`);
      console.log(`   - Apenas com chegada: ${comChegada}`);
      console.log(`   - Apenas com término: ${comTermino}`);
      console.log(`   - Sem dados de tempo: ${semTempo}`);
      console.log(`   - Total: ${ocorrenciasResponse.data.length}`);
      
      const percentualCompletos = ((comAmbos / ocorrenciasResponse.data.length) * 100).toFixed(1);
      console.log(`   - Percentual com dados completos: ${percentualCompletos}%`);
    }

    // 3. Testar endpoint financeiro para ver se os cálculos estão corretos
    console.log('\n3️⃣ Testando endpoint financeiro...');
    try {
      const financeiroResponse = await axios.get(`${API_BASE_URL}/api/v1/financeiro/controle-prestadores`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { periodo: 'tudo' }
      });

      console.log('✅ Endpoint financeiro funcionando!');
      console.log('   Prestadores encontrados:', financeiroResponse.data.length);
      
      if (financeiroResponse.data.length > 0) {
        console.log('\n💰 Análise dos cálculos financeiros:');
        
        financeiroResponse.data.forEach((prestador, index) => {
          console.log(`\n   ${index + 1}. ${prestador.nome}:`);
          console.log(`      Total Acionamentos: ${prestador.total_acionamentos}`);
          console.log(`      Total KM: ${prestador.total_km} km`);
          console.log(`      Total Horas: ${prestador.total_horas_adicionais} horas`);
          console.log(`      Status: ${prestador.status_cadastro}`);
          
          if (typeof prestador.total_valor_km_adc === 'string') {
            console.log(`      Valor KM Adicional: ${prestador.total_valor_km_adc}`);
          } else {
            console.log(`      Valor KM Adicional: R$ ${prestador.total_valor_km_adc}`);
          }
          
          if (typeof prestador.total_valor_hora_adc === 'string') {
            console.log(`      Valor Hora Adicional: ${prestador.total_valor_hora_adc}`);
          } else {
            console.log(`      Valor Hora Adicional: R$ ${prestador.total_valor_hora_adc}`);
          }
        });
      }
    } catch (error) {
      console.log('❌ Erro no endpoint financeiro:', error.response?.data?.error || error.message);
    }

    console.log('\n🎯 DIAGNÓSTICO:');
    console.log('   1. ✅ Verificar se campos chegada/termino estão preenchidos');
    console.log('   2. ✅ Verificar se cálculo de tempo está correto (termino - chegada)');
    console.log('   3. ✅ Verificar se total_horas_adicionais está sendo incrementado');
    console.log('   4. ✅ Verificar se valores financeiros não estão sendo multiplicados duas vezes');

  } catch (error) {
    console.error('❌ Erro na investigação:', error.response?.data?.error || error.message);
  }
}

// Executar investigação
investigarDadosTempo();
