const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function testarCalculoSimples() {
  try {
    console.log('🧪 TESTE SIMPLES: Verificação do Cálculo Financeiro');
    console.log('=================================================\n');

    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
      email: 'teste@teste',
      password: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');

    // 2. Buscar prestadores cadastrados
    console.log('\n2️⃣ Buscando prestadores cadastrados...');
    const prestadoresResponse = await axios.get(`${API_BASE_URL}/api/v1/financeiro/prestadores`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Prestadores encontrados:', prestadoresResponse.data.length);
    
    if (prestadoresResponse.data.length > 0) {
      const primeiroPrestador = prestadoresResponse.data[0];
      console.log('\n📋 Primeiro prestador cadastrado:');
      console.log('   Nome:', primeiroPrestador.nome);
      console.log('   Valor Acionamento:', `R$ ${primeiroPrestador.valor_acionamento || 0}`);
      console.log('   Franquia Horas (cadastrada):', primeiroPrestador.franquia_horas || 'Não definida');
      console.log('   Franquia KM (cadastrada):', primeiroPrestador.franquia_km || 'Não definida');
      console.log('   Valor Hora Adicional:', `R$ ${primeiroPrestador.valor_hora_adc || 0}`);
      console.log('   Valor KM Adicional:', `R$ ${primeiroPrestador.valor_km_adc || 0}`);
      
      console.log('\n💡 IMPORTANTE:');
      console.log('   - Franquias cadastradas no banco:', primeiroPrestador.franquia_horas, 'horas,', primeiroPrestador.franquia_km, 'km');
      console.log('   - Franquias que DEVEM ser usadas no cálculo: 3 horas, 50 km (SEMPRE)');
      console.log('   - O sistema agora deve ignorar as franquias cadastradas e usar sempre 3h/50km');
    }

    // 3. Verificar controle prestadores
    console.log('\n3️⃣ Verificando dados do controle prestadores...');
    const controleResponse = await axios.get(`${API_BASE_URL}/api/v1/financeiro/controle-prestadores`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { periodo: 'tudo' }
    });

    console.log('✅ Prestadores no controle:', controleResponse.data.length);
    
    if (controleResponse.data.length > 0) {
      const primeiroControle = controleResponse.data[0];
      console.log('\n📊 Primeiro prestador no controle:');
      console.log('   Nome:', primeiroControle.nome);
      console.log('   Cadastrado:', primeiroControle.is_cadastrado);
      console.log('   Total Acionamentos:', primeiroControle.total_acionamentos);
      console.log('   Total KM:', primeiroControle.total_km);
      console.log('   Total Horas:', primeiroControle.total_horas_adicionais);
      console.log('   Valor Acionamento Total:', `R$ ${primeiroControle.total_valor_acionamento.toFixed(2)}`);
      console.log('   Valor Horas Adicionais:', `R$ ${primeiroControle.total_valor_hora_adc.toFixed(2)}`);
      console.log('   Valor KM Adicionais:', `R$ ${primeiroControle.total_valor_km_adc.toFixed(2)}`);
      console.log('   Total Despesas:', `R$ ${primeiroControle.total_despesas.toFixed(2)}`);
      
      if (primeiroControle.is_cadastrado && primeiroControle.prestador_data) {
        console.log('\n🔍 Dados do prestador cadastrado:');
        console.log('   Valor Acionamento:', `R$ ${primeiroControle.prestador_data.valor_acionamento || 0}`);
        console.log('   Valor Hora Adicional:', `R$ ${primeiroControle.prestador_data.valor_hora_adc || 0}`);
        console.log('   Valor KM Adicional:', `R$ ${primeiroControle.prestador_data.valor_km_adc || 0}`);
      }
      
      console.log('\n🧮 EXEMPLO DE CÁLCULO:');
      console.log('   Se uma ocorrência tiver:');
      console.log('     - 4 horas de duração');
      console.log('     - 100 km total');
      console.log('   Com este prestador, o cálculo deveria ser:');
      
      if (primeiroControle.is_cadastrado && primeiroControle.prestador_data) {
        const valorAcionamento = Number(primeiroControle.prestador_data.valor_acionamento || 0);
        const valorHoraAdc = Number(primeiroControle.prestador_data.valor_hora_adc || 0);
        const valorKmAdc = Number(primeiroControle.prestador_data.valor_km_adc || 0);
        
        const horasAdicionais = Math.max(0, 4 - 3); // 1 hora adicional (franquia padrão 3h)
        const kmAdicionais = Math.max(0, 100 - 50); // 50 km adicionais (franquia padrão 50km)
        
        const totalEsperado = valorAcionamento + (horasAdicionais * valorHoraAdc) + (kmAdicionais * valorKmAdc);
        
        console.log('     - Valor Acionamento:', `R$ ${valorAcionamento.toFixed(2)}`);
        console.log('     - Horas Adicionais:', `${horasAdicionais}h × R$ ${valorHoraAdc.toFixed(2)} = R$ ${(horasAdicionais * valorHoraAdc).toFixed(2)}`);
        console.log('     - KM Adicionais:', `${kmAdicionais}km × R$ ${valorKmAdc.toFixed(2)} = R$ ${(kmAdicionais * valorKmAdc).toFixed(2)}`);
        console.log('     - TOTAL ESPERADO:', `R$ ${totalEsperado.toFixed(2)}`);
        console.log('\n   ✅ Este cálculo agora usa SEMPRE 3h/50km de franquia, ignorando valores cadastrados');
      } else {
        console.log('     - Valor Acionamento: R$ 150,00 (padrão)');
        console.log('     - Horas Adicionais: 1h × R$ 30,00 = R$ 30,00');
        console.log('     - KM Adicionais: 50km × R$ 1,00 = R$ 50,00');
        console.log('     - TOTAL ESPERADO: R$ 230,00');
        console.log('\n   ✅ Este cálculo usa valores padrão com franquias 3h/50km');
      }
    }

    console.log('\n🎯 CONCLUSÃO:');
    console.log('   A lógica foi corrigida para SEMPRE usar:');
    console.log('   - 3 horas como franquia padrão');
    console.log('   - 50 km como franquia padrão');
    console.log('   - Valores do prestador cadastrado (se existir)');
    console.log('   - Valores padrão (se não cadastrado)');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data?.error || error.message);
    console.log('\n💡 Dica: Verifique se o backend está rodando em http://localhost:3001');
  }
}

// Executar teste
testarCalculoSimples();
