const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'https://painel.impactopr.seg.br';

async function debugMultiplicacao() {
  try {
    console.log('🔍 DEBUG: Investigando Lógica de Multiplicação');
    console.log('==============================================\n');

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
      console.log('\n📊 Valores Cadastrados dos Prestadores:');
      
      prestadoresResponse.data.slice(0, 3).forEach((prestador, index) => {
        console.log(`\n   ${index + 1}. ${prestador.nome} (${prestador.cod_nome || 'Sem código'}):`);
        console.log(`      - Valor Acionamento: R$ ${prestador.valor_acionamento || 0}`);
        console.log(`      - Franquia Horas: ${prestador.franquia_horas || 'N/A'}`);
        console.log(`      - Franquia KM: ${prestador.franquia_km || 'N/A'} km`);
        console.log(`      - Valor Hora Adicional: R$ ${prestador.valor_hora_adc || 0}`);
        console.log(`      - Valor KM Adicional: R$ ${prestador.valor_km_adc || 0}`);
      });
    }

    // 3. Buscar acionamentos individuais
    console.log('\n3️⃣ Buscando acionamentos individuais...');
    const acionamentosResponse = await axios.get(`${API_BASE_URL}/api/v1/financeiro/controle-prestadores-individual`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { periodo: 'tudo' }
    });

    console.log('✅ Acionamentos encontrados:', acionamentosResponse.data.length);
    
    if (acionamentosResponse.data.length > 0) {
      console.log('\n💰 DEBUG: Análise Detalhada dos Cálculos:');
      
      // Procurar por acionamentos com valores que parecem incorretos
      const acionamentosSuspeitos = acionamentosResponse.data.filter(acionamento => {
        // Procurar por valores que podem indicar problemas
        return typeof acionamento.total_valor_hora_adc === 'number' && 
               typeof acionamento.total_valor_km_adc === 'number' &&
               acionamento.total_horas_adicionais > 0 &&
               acionamento.total_km > 0;
      });
      
      console.log(`   Encontrados ${acionamentosSuspeitos.length} acionamentos com valores numéricos para análise`);
      
      acionamentosSuspeitos.slice(0, 3).forEach((acionamento, index) => {
        console.log(`\n   📋 ${index + 1}. Acionamento ID ${acionamento.id}:`);
        console.log(`      - Prestador: ${acionamento.nome}`);
        console.log(`      - Tempo Total: ${acionamento.total_horas_adicionais}h`);
        console.log(`      - KM Total: ${acionamento.total_km}km`);
        
        if (acionamento.prestador_data) {
          const prestador = acionamento.prestador_data;
          console.log(`      - Prestador Cadastrado: SIM`);
          console.log(`      - Franquia Horas Cadastrada: ${prestador.franquia_horas || 'N/A'}`);
          console.log(`      - Franquia KM Cadastrada: ${prestador.franquia_km || 'N/A'} km`);
          console.log(`      - Valor Hora Adicional Cadastrado: R$ ${prestador.valor_hora_adc || 0}`);
          console.log(`      - Valor KM Adicional Cadastrado: R$ ${prestador.valor_km_adc || 0}`);
          
          // Calcular manualmente
          const franquiaHoras = Number(prestador.franquia_horas) || 3;
          const franquiaKm = Number(prestador.franquia_km) || 50;
          const horasAdicionais = Math.max(0, acionamento.total_horas_adicionais - franquiaHoras);
          const kmAdicionais = Math.max(0, acionamento.total_km - franquiaKm);
          const valorHoraAdc = Number(prestador.valor_hora_adc) || 0;
          const valorKmAdc = Number(prestador.valor_km_adc) || 0;
          
          const valorHoraCalculado = horasAdicionais * valorHoraAdc;
          const valorKmCalculado = kmAdicionais * valorKmAdc;
          
          console.log(`\n      🧮 CÁLCULO MANUAL:`);
          console.log(`         - Franquia Horas: ${franquiaHoras}h`);
          console.log(`         - Franquia KM: ${franquiaKm}km`);
          console.log(`         - Horas Adicionais: ${horasAdicionais}h (${acionamento.total_horas_adicionais} - ${franquiaHoras})`);
          console.log(`         - KM Adicionais: ${kmAdicionais}km (${acionamento.total_km} - ${franquiaKm})`);
          console.log(`         - Valor Hora: R$ ${valorHoraCalculado} (${horasAdicionais} × R$ ${valorHoraAdc})`);
          console.log(`         - Valor KM: R$ ${valorKmCalculado} (${kmAdicionais} × R$ ${valorKmAdc})`);
          
          console.log(`\n      📊 SISTEMA RETORNOU:`);
          console.log(`         - Valor Hora Adicional: R$ ${acionamento.total_valor_hora_adc}`);
          console.log(`         - Valor KM Adicional: R$ ${acionamento.total_valor_km_adc}`);
          
          // Verificar se há diferenças
          const diffHora = Math.abs(valorHoraCalculado - acionamento.total_valor_hora_adc);
          const diffKm = Math.abs(valorKmCalculado - acionamento.total_valor_km_adc);
          
          if (diffHora > 0.01) {
            console.log(`         ❌ DIFERENÇA NO VALOR HORA: ${diffHora.toFixed(2)}`);
            console.log(`         ❌ Esperado: R$ ${valorHoraCalculado}, Recebido: R$ ${acionamento.total_valor_hora_adc}`);
          } else {
            console.log(`         ✅ Valor Hora Adicional CORRETO!`);
          }
          
          if (diffKm > 0.01) {
            console.log(`         ❌ DIFERENÇA NO VALOR KM: ${diffKm.toFixed(2)}`);
            console.log(`         ❌ Esperado: R$ ${valorKmCalculado}, Recebido: R$ ${acionamento.total_valor_km_adc}`);
          } else {
            console.log(`         ✅ Valor KM Adicional CORRETO!`);
          }
          
          // Verificar se os valores parecem suspeitos
          if (valorHoraAdc > 0 && acionamento.total_valor_hora_adc > 0) {
            const taxaCalculada = acionamento.total_valor_hora_adc / acionamento.total_horas_adicionais;
            console.log(`         🔍 Taxa Hora Calculada pelo Sistema: R$ ${taxaCalculada.toFixed(2)}/hora`);
            console.log(`         🔍 Taxa Hora Cadastrada: R$ ${valorHoraAdc}/hora`);
            
            if (Math.abs(taxaCalculada - valorHoraAdc) > 0.01) {
              console.log(`         ⚠️ TAXA INCONSISTENTE! Sistema pode não estar usando valor cadastrado.`);
            }
          }
          
          if (valorKmAdc > 0 && acionamento.total_valor_km_adc > 0) {
            const taxaCalculada = acionamento.total_valor_km_adc / kmAdicionais;
            console.log(`         🔍 Taxa KM Calculada pelo Sistema: R$ ${taxaCalculada.toFixed(2)}/km`);
            console.log(`         🔍 Taxa KM Cadastrada: R$ ${valorKmAdc}/km`);
            
            if (Math.abs(taxaCalculada - valorKmAdc) > 0.01) {
              console.log(`         ⚠️ TAXA INCONSISTENTE! Sistema pode não estar usando valor cadastrado.`);
            }
          }
          
        } else {
          console.log(`      - Prestador Cadastrado: NÃO`);
          console.log(`      - Valor Hora Adicional: ${acionamento.total_valor_hora_adc}`);
          console.log(`      - Valor KM Adicional: ${acionamento.total_valor_km_adc}`);
        }
      });
    }

    // 4. Análise específica do problema da imagem
    console.log('\n4️⃣ Análise do Problema da Imagem:');
    console.log('   Dados da imagem:');
    console.log('   - Tempo Total: 8h 0min');
    console.log('   - KM Total: 308.0 km');
    console.log('   - KM Adicionais: 258.0 km');
    console.log('   - Horas Adicionais: 8h 0min');
    console.log('   - Valor Hora Adicional: R$ 150,00');
    console.log('   - Valor KM Adicional: R$ 258,00');
    
    // Se horas adicionais = 8h e valor = R$ 150,00
    const taxaHoraImagem = 150 / 8;
    console.log(`   - Taxa Hora Implícita: R$ ${taxaHoraImagem}/hora`);
    
    // Se KM adicionais = 258km e valor = R$ 258,00
    const taxaKmImagem = 258 / 258;
    console.log(`   - Taxa KM Implícita: R$ ${taxaKmImagem}/km`);
    
    console.log('\n   🎯 POSSÍVEIS PROBLEMAS:');
    console.log('   1. Sistema pode estar usando valores padrão (R$ 18,75/h e R$ 1,00/km)');
    console.log('   2. Franquias podem estar sendo ignoradas (0h franquia, 0km franquia)');
    console.log('   3. Multiplicação pode estar usando valores incorretos do banco');

  } catch (error) {
    console.error('❌ Erro no debug:', error.response?.data?.error || error.message);
  }
}

// Executar debug
debugMultiplicacao();
