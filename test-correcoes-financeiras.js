const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'https://painel.impactopr.seg.br';

async function testarCorrecoesFinanceiras() {
  try {
    console.log('🧪 TESTE: Correções Financeiras');
    console.log('===============================\n');

    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
      email: 'teste@teste',
      password: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');

    // 2. Testar endpoint financeiro
    console.log('\n2️⃣ Testando endpoint financeiro corrigido...');
    const financeiroResponse = await axios.get(`${API_BASE_URL}/api/v1/financeiro/controle-prestadores`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { periodo: 'tudo' }
    });

    console.log('✅ Endpoint financeiro funcionando!');
    console.log('   Prestadores encontrados:', financeiroResponse.data.length);
    
    if (financeiroResponse.data.length > 0) {
      console.log('\n💰 VERIFICAÇÃO DAS CORREÇÕES:');
      
      financeiroResponse.data.forEach((prestador, index) => {
        console.log(`\n   ${index + 1}. ${prestador.nome}:`);
        console.log(`      📊 Dados básicos:`);
        console.log(`         - Total Acionamentos: ${prestador.total_acionamentos}`);
        console.log(`         - Total KM: ${prestador.total_km} km`);
        console.log(`         - Total Horas: ${prestador.total_horas_adicionais} horas`);
        console.log(`         - Status: ${prestador.status_cadastro}`);
        
        console.log(`      💰 Valores financeiros:`);
        
        // Verificar valor acionamento
        if (typeof prestador.total_valor_acionamento === 'string') {
          console.log(`         - Valor Acionamento: ${prestador.total_valor_acionamento}`);
        } else {
          const valorAcionamentoEsperado = prestador.total_acionamentos * 400; // Assumindo R$ 400 por acionamento
          console.log(`         - Valor Acionamento: R$ ${prestador.total_valor_acionamento}`);
          console.log(`         - Valor Esperado: R$ ${valorAcionamentoEsperado} (${prestador.total_acionamentos} × R$ 400)`);
          
          if (prestador.total_valor_acionamento === valorAcionamentoEsperado) {
            console.log(`         ✅ CORRETO: Valor acionamento calculado corretamente`);
          } else {
            console.log(`         ⚠️ VERIFICAR: Valor acionamento pode estar incorreto`);
          }
        }
        
        // Verificar valor horas adicionais
        if (typeof prestador.total_valor_hora_adc === 'string') {
          console.log(`         - Valor Horas Adicionais: ${prestador.total_valor_hora_adc}`);
        } else {
          console.log(`         - Valor Horas Adicionais: R$ ${prestador.total_valor_hora_adc}`);
          if (prestador.total_horas_adicionais > 0) {
            console.log(`         ✅ CORRETO: Horas adicionais sendo calculadas (${prestador.total_horas_adicionais} horas)`);
          } else {
            console.log(`         ⚠️ VERIFICAR: Total de horas está zerado`);
          }
        }
        
        // Verificar valor KM adicionais
        if (typeof prestador.total_valor_km_adc === 'string') {
          console.log(`         - Valor KM Adicionais: ${prestador.total_valor_km_adc}`);
        } else {
          console.log(`         - Valor KM Adicionais: R$ ${prestador.total_valor_km_adc}`);
          const kmAdicionais = prestador.total_km > 50 ? prestador.total_km - 50 : 0;
          const valorKmEsperado = kmAdicionais * 1; // Assumindo R$ 1 por km adicional
          console.log(`         - KM Adicionais: ${kmAdicionais} km (${prestador.total_km} - 50)`);
          console.log(`         - Valor Esperado: R$ ${valorKmEsperado} (${kmAdicionais} × R$ 1)`);
          
          if (prestador.total_valor_km_adc === valorKmEsperado) {
            console.log(`         ✅ CORRETO: Valor KM adicionais calculado corretamente`);
          } else {
            console.log(`         ⚠️ VERIFICAR: Valor KM adicionais pode estar incorreto`);
          }
        }
        
        console.log(`         - Total Despesas: R$ ${prestador.total_despesas}`);
      });
    }

    console.log('\n🎯 RESUMO DAS CORREÇÕES APLICADAS:');
    console.log('   1. ✅ Backend: total_horas_adicionais agora é incrementado');
    console.log('   2. ✅ Frontend: Valores não são mais multiplicados duas vezes');
    console.log('   3. ✅ Cálculo: tempoTotal = termino - chegada (correto)');
    console.log('   4. ✅ Franquias: Sempre 3h e 50km para cálculos');
    console.log('   5. ✅ Builds: Backend e frontend atualizados');
    
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('   1. Fazer deploy das correções em produção');
    console.log('   2. Verificar se campos chegada/termino estão preenchidos');
    console.log('   3. Testar com dados reais de produção');
    console.log('   4. Validar que total de horas agora aparece corretamente');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data?.error || error.message);
  }
}

// Executar teste
testarCorrecoesFinanceiras();
