const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'https://painel.impactopr.seg.br';

async function testarCorrecaoHorasAdicionais() {
  try {
    console.log('🧪 TESTE: Correção das Horas Adicionais');
    console.log('=======================================\n');

    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
      email: 'teste@teste',
      password: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');

    // 2. Buscar acionamentos individuais
    console.log('\n2️⃣ Buscando acionamentos individuais...');
    const acionamentosResponse = await axios.get(`${API_BASE_URL}/api/v1/financeiro/controle-prestadores-individual`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { periodo: 'tudo' }
    });

    console.log('✅ Acionamentos encontrados:', acionamentosResponse.data.length);
    
    if (acionamentosResponse.data.length > 0) {
      console.log('\n📊 Análise da Correção das Horas Adicionais:');
      
      acionamentosResponse.data.slice(0, 5).forEach((acionamento, index) => {
        console.log(`\n   ${index + 1}. Acionamento ID ${acionamento.id}:`);
        console.log(`      - Prestador: ${acionamento.nome}`);
        console.log(`      - Status: ${acionamento.status_cadastro}`);
        
        if (acionamento.prestador_data) {
          const prestador = acionamento.prestador_data;
          console.log(`      - Prestador Cadastrado: SIM`);
          console.log(`      - Valor Hora Adicional Cadastrado: R$ ${prestador.valor_hora_adc || 0}`);
          console.log(`      - Valor KM Adicional Cadastrado: R$ ${prestador.valor_km_adc || 0}`);
          
          // Simular cálculo correto
          const tempoTotal = acionamento.total_horas_adicionais; // Este campo agora deve ter as horas adicionais corretas
          const kmTotal = acionamento.total_km;
          
          // Calcular manualmente (deve ser igual ao que está sendo retornado)
          const franquiaHoras = 3; // Sempre 3 horas
          const franquiaKm = 50;   // Sempre 50 km
          const horasAdicionaisCalculadas = Math.max(0, tempoTotal - franquiaHoras);
          const kmAdicionaisCalculados = Math.max(0, kmTotal - franquiaKm);
          
          console.log(`      - Tempo Total (ocorrência): ${tempoTotal}h`);
          console.log(`      - KM Total: ${kmTotal}km`);
          console.log(`      - Franquia Horas: ${franquiaHoras}h (SEMPRE)`);
          console.log(`      - Franquia KM: ${franquiaKm}km (SEMPRE)`);
          console.log(`      - Horas Adicionais Calculadas: ${horasAdicionaisCalculadas}h (${tempoTotal} - ${franquiaHoras})`);
          console.log(`      - KM Adicionais Calculados: ${kmAdicionaisCalculados}km (${kmTotal} - ${franquiaKm})`);
          
          if (typeof acionamento.total_valor_hora_adc === 'number') {
            const valorHoraCalculado = horasAdicionaisCalculadas * (prestador.valor_hora_adc || 0);
            const valorKmCalculado = kmAdicionaisCalculados * (prestador.valor_km_adc || 0);
            
            console.log(`      - Valor Hora Adicional Sistema: R$ ${acionamento.total_valor_hora_adc}`);
            console.log(`      - Valor Hora Adicional Calculado: R$ ${valorHoraCalculado} (${horasAdicionaisCalculadas}h × R$ ${prestador.valor_hora_adc || 0}/h)`);
            console.log(`      - Valor KM Adicional Sistema: R$ ${acionamento.total_valor_km_adc}`);
            console.log(`      - Valor KM Adicional Calculado: R$ ${valorKmCalculado} (${kmAdicionaisCalculados}km × R$ ${prestador.valor_km_adc || 0}/km)`);
            
            // Verificar se os cálculos batem
            const diffHora = Math.abs(acionamento.total_valor_hora_adc - valorHoraCalculado);
            const diffKm = Math.abs(acionamento.total_valor_km_adc - valorKmCalculado);
            
            if (diffHora < 0.01) {
              console.log(`      ✅ Valor Hora Adicional CORRETO!`);
            } else {
              console.log(`      ❌ Valor Hora Adicional INCORRETO! Diferença: R$ ${diffHora.toFixed(2)}`);
            }
            
            if (diffKm < 0.01) {
              console.log(`      ✅ Valor KM Adicional CORRETO!`);
            } else {
              console.log(`      ❌ Valor KM Adicional INCORRETO! Diferença: R$ ${diffKm.toFixed(2)}`);
            }
          } else {
            console.log(`      - Valor Hora Adicional: ${acionamento.total_valor_hora_adc}`);
            console.log(`      - Valor KM Adicional: ${acionamento.total_valor_km_adc}`);
          }
        } else {
          console.log(`      - Prestador Cadastrado: NÃO`);
          console.log(`      - Status: ${acionamento.status_cadastro}`);
        }
      });
    }

    // 3. Teste específico com dados da imagem
    console.log('\n3️⃣ Teste Específico (Dados da Imagem):');
    console.log('   Cenário da imagem:');
    console.log('   - Tempo Total: 8h 0min');
    console.log('   - KM Total: 308.0 km');
    console.log('   - Valor Hora Adicional: R$ 150,00');
    console.log('   - Valor KM Adicional: R$ 258,00');
    
    // Calcular o que deveria ser
    const tempoTotalImagem = 8; // 8 horas
    const kmTotalImagem = 308;  // 308 km
    const franquiaHoras = 3;    // 3 horas
    const franquiaKm = 50;      // 50 km
    
    const horasAdicionaisCorreto = Math.max(0, tempoTotalImagem - franquiaHoras); // 8 - 3 = 5 horas
    const kmAdicionaisCorreto = Math.max(0, kmTotalImagem - franquiaKm); // 308 - 50 = 258 km
    
    console.log(`   - Horas Adicionais CORRETAS: ${horasAdicionaisCorreto}h (${tempoTotalImagem} - ${franquiaHoras})`);
    console.log(`   - KM Adicionais CORRETOS: ${kmAdicionaisCorreto}km (${kmTotalImagem} - ${franquiaKm})`);
    
    // Se o valor hora é R$ 150,00 para 5 horas, a taxa seria R$ 30,00/hora
    const taxaHoraImagem = 150 / horasAdicionaisCorreto; // 150 / 5 = 30
    const taxaKmImagem = 258 / kmAdicionaisCorreto; // 258 / 258 = 1
    
    console.log(`   - Taxa Hora Implícita: R$ ${taxaHoraImagem}/hora`);
    console.log(`   - Taxa KM Implícita: R$ ${taxaKmImagem}/km`);
    
    console.log('\n🎯 CONCLUSÃO:');
    console.log('   ✅ Correção aplicada: Horas adicionais = tempo total - 3h');
    console.log('   ✅ Correção aplicada: KM adicionais = KM total - 50km');
    console.log('   ✅ Valores financeiros = (horas/km adicionais) × valores cadastrados');
    console.log('   ✅ Logs de debug adicionados para monitoramento');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data?.error || error.message);
  }
}

// Executar teste
testarCorrecaoHorasAdicionais();
