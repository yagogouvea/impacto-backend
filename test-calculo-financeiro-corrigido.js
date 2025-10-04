const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function testarCalculoFinanceiroCorrigido() {
  try {
    console.log('🧪 TESTE: Cálculo Financeiro Corrigido');
    console.log('=====================================\n');

    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
      email: 'teste@teste',
      password: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');

    // 2. Criar uma ocorrência de teste com dados específicos
    console.log('\n2️⃣ Criando ocorrência de teste...');
    const ocorrenciaData = {
      cliente: 'Cliente Teste Cálculo',
      operador: 'Laysla',
      prestador: 'Prestador Teste Cálculo',
      tipo: 'Roubo',
      data_acionamento: new Date().toISOString(),
      inicio: new Date().toISOString(), // Hora inicial
      termino: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 horas depois
      km_inicial: 100,
      km_final: 200, // Total: 100 km
      resultado: 'RECUPERADO',
      status: 'concluida',
      descricao: 'Teste de cálculo financeiro corrigido'
    };

    const ocorrenciaResponse = await axios.post(`${API_BASE_URL}/api/v1/ocorrencias`, ocorrenciaData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const ocorrenciaId = ocorrenciaResponse.data.id;
    console.log('✅ Ocorrência criada:', ocorrenciaId);
    console.log('   Dados:', {
      duração: '4 horas',
      km_total: '100 km',
      prestador: 'Prestador Teste Cálculo'
    });

    // 3. Verificar se o prestador existe no sistema
    console.log('\n3️⃣ Verificando prestador cadastrado...');
    try {
      const prestadorResponse = await axios.get(`${API_BASE_URL}/api/v1/financeiro/prestadores`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const prestadorCadastrado = prestadorResponse.data.find(p => 
        p.nome.toLowerCase().includes('prestador teste cálculo')
      );

      if (prestadorCadastrado) {
        console.log('✅ Prestador encontrado cadastrado:');
        console.log('   Nome:', prestadorCadastrado.nome);
        console.log('   Valor Acionamento:', prestadorCadastrado.valor_acionamento);
        console.log('   Franquia Horas (cadastrada):', prestadorCadastrado.franquia_horas);
        console.log('   Franquia KM (cadastrada):', prestadorCadastrado.franquia_km);
        console.log('   Valor Hora Adicional:', prestadorCadastrado.valor_hora_adc);
        console.log('   Valor KM Adicional:', prestadorCadastrado.valor_km_adc);
      } else {
        console.log('⚠️ Prestador não encontrado cadastrado - será usado valores padrão');
      }
    } catch (error) {
      console.log('⚠️ Erro ao buscar prestadores:', error.response?.data?.error || error.message);
    }

    // 4. Testar o cálculo no controle prestadores
    console.log('\n4️⃣ Testando cálculo no Controle Prestadores...');
    const controleResponse = await axios.get(`${API_BASE_URL}/api/v1/financeiro/controle-prestadores`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { periodo: 'tudo' }
    });

    const prestadorFinanceiro = controleResponse.data.find(p => 
      p.nome.toLowerCase().includes('prestador teste cálculo')
    );

    if (prestadorFinanceiro) {
      console.log('✅ Dados financeiros calculados:');
      console.log('   Nome:', prestadorFinanceiro.nome);
      console.log('   Cadastrado:', prestadorFinanceiro.is_cadastrado);
      console.log('   Total Acionamentos:', prestadorFinanceiro.total_acionamentos);
      console.log('   Total KM:', prestadorFinanceiro.total_km);
      console.log('   Total Horas Adicionais:', prestadorFinanceiro.total_horas_adicionais);
      
      console.log('\n💰 VALORES CALCULADOS:');
      console.log('   Valor Acionamento Total:', `R$ ${prestadorFinanceiro.total_valor_acionamento.toFixed(2)}`);
      console.log('   Valor Horas Adicionais:', `R$ ${prestadorFinanceiro.total_valor_hora_adc.toFixed(2)}`);
      console.log('   Valor KM Adicionais:', `R$ ${prestadorFinanceiro.total_valor_km_adc.toFixed(2)}`);
      console.log('   Total Despesas:', `R$ ${prestadorFinanceiro.total_despesas.toFixed(2)}`);

      // Verificar se o cálculo está correto
      console.log('\n🧮 VERIFICAÇÃO DO CÁLCULO:');
      console.log('   Dados da ocorrência:');
      console.log('     - Duração: 4 horas');
      console.log('     - KM Total: 100 km');
      console.log('   Franquias aplicadas:');
      console.log('     - Franquia Horas: 3 horas (SEMPRE padrão)');
      console.log('     - Franquia KM: 50 km (SEMPRE padrão)');
      console.log('   Cálculo esperado:');
      
      const horasAdicionais = Math.max(0, 4 - 3); // 1 hora adicional
      const kmAdicionais = Math.max(0, 100 - 50); // 50 km adicionais
      
      console.log('     - Horas Adicionais:', horasAdicionais, 'hora(s)');
      console.log('     - KM Adicionais:', kmAdicionais, 'km');
      
      if (prestadorFinanceiro.is_cadastrado && prestadorFinanceiro.prestador_data) {
        const valorAcionamento = Number(prestadorFinanceiro.prestador_data.valor_acionamento || 0);
        const valorHoraAdc = Number(prestadorFinanceiro.prestador_data.valor_hora_adc || 0);
        const valorKmAdc = Number(prestadorFinanceiro.prestador_data.valor_km_adc || 0);
        
        const valorHoraEsperado = horasAdicionais * valorHoraAdc;
        const valorKmEsperado = kmAdicionais * valorKmAdc;
        const totalEsperado = valorAcionamento + valorHoraEsperado + valorKmEsperado;
        
        console.log('   Valores esperados (prestador cadastrado):');
        console.log('     - Valor Acionamento:', `R$ ${valorAcionamento.toFixed(2)}`);
        console.log('     - Valor Horas Adicionais:', `R$ ${valorHoraEsperado.toFixed(2)} (${horasAdicionais}h × R$ ${valorHoraAdc.toFixed(2)})`);
        console.log('     - Valor KM Adicionais:', `R$ ${valorKmEsperado.toFixed(2)} (${kmAdicionais}km × R$ ${valorKmAdc.toFixed(2)})`);
        console.log('     - TOTAL ESPERADO:', `R$ ${totalEsperado.toFixed(2)}`);
        
        console.log('\n   Valores calculados pelo sistema:');
        console.log('     - Valor Acionamento:', `R$ ${prestadorFinanceiro.total_valor_acionamento.toFixed(2)}`);
        console.log('     - Valor Horas Adicionais:', `R$ ${prestadorFinanceiro.total_valor_hora_adc.toFixed(2)}`);
        console.log('     - Valor KM Adicionais:', `R$ ${prestadorFinanceiro.total_valor_km_adc.toFixed(2)}`);
        
        const totalCalculado = prestadorFinanceiro.total_valor_acionamento + 
                              prestadorFinanceiro.total_valor_hora_adc + 
                              prestadorFinanceiro.total_valor_km_adc;
        console.log('     - TOTAL CALCULADO:', `R$ ${totalCalculado.toFixed(2)}`);
        
        // Verificar se os valores coincidem
        const acionamentoOk = Math.abs(prestadorFinanceiro.total_valor_acionamento - valorAcionamento) < 0.01;
        const horaOk = Math.abs(prestadorFinanceiro.total_valor_hora_adc - valorHoraEsperado) < 0.01;
        const kmOk = Math.abs(prestadorFinanceiro.total_valor_km_adc - valorKmEsperado) < 0.01;
        
        console.log('\n🎯 RESULTADO:');
        console.log('   Acionamento correto:', acionamentoOk ? '✅' : '❌');
        console.log('   Horas adicionais corretas:', horaOk ? '✅' : '❌');
        console.log('   KM adicionais corretos:', kmOk ? '✅' : '❌');
        
        if (acionamentoOk && horaOk && kmOk) {
          console.log('\n🎉 SUCESSO: Cálculo financeiro está correto!');
          console.log('   ✅ Franquias padrão (3h e 50km) sendo aplicadas corretamente');
          console.log('   ✅ Valores do prestador cadastrado sendo usados corretamente');
        } else {
          console.log('\n❌ ERRO: Cálculo financeiro ainda está incorreto');
        }
      } else {
        console.log('   Valores esperados (prestador não cadastrado):');
        console.log('     - Valor Acionamento: R$ 150,00 (padrão)');
        console.log('     - Valor Horas Adicionais: R$ 30,00 (1h × R$ 30,00)');
        console.log('     - Valor KM Adicionais: R$ 50,00 (50km × R$ 1,00)');
        console.log('     - TOTAL ESPERADO: R$ 230,00');
        
        const totalEsperadoNaoCadastrado = 150 + 30 + 50;
        const totalCalculadoNaoCadastrado = prestadorFinanceiro.total_valor_acionamento + 
                                           prestadorFinanceiro.total_valor_hora_adc + 
                                           prestadorFinanceiro.total_valor_km_adc;
        
        console.log('\n   Valores calculados pelo sistema:');
        console.log('     - TOTAL CALCULADO:', `R$ ${totalCalculadoNaoCadastrado.toFixed(2)}`);
        
        const calculoOk = Math.abs(totalCalculadoNaoCadastrado - totalEsperadoNaoCadastrado) < 0.01;
        console.log('\n🎯 RESULTADO:');
        console.log('   Cálculo correto:', calculoOk ? '✅' : '❌');
        
        if (calculoOk) {
          console.log('\n🎉 SUCESSO: Cálculo financeiro está correto!');
        } else {
          console.log('\n❌ ERRO: Cálculo financeiro ainda está incorreto');
        }
      }
    } else {
      console.log('❌ Prestador não encontrado nos dados financeiros');
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

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data?.error || error.message);
  }
}

// Executar teste
testarCalculoFinanceiroCorrigido();
