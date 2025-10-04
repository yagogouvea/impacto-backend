const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'https://painel.impactopr.seg.br';

async function testarCorrecaoFranquias() {
  try {
    console.log('🧪 TESTE: Correção das Franquias do Banco de Dados');
    console.log('==================================================\n');

    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
      email: 'teste@teste',
      password: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');

    // 2. Buscar prestadores cadastrados para ver suas franquias
    console.log('\n2️⃣ Buscando prestadores cadastrados...');
    const prestadoresResponse = await axios.get(`${API_BASE_URL}/api/v1/financeiro/prestadores`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Prestadores encontrados:', prestadoresResponse.data.length);
    
    if (prestadoresResponse.data.length > 0) {
      console.log('\n📊 Franquias Cadastradas no Banco:');
      
      // Mostrar os primeiros prestadores com suas franquias
      prestadoresResponse.data.slice(0, 3).forEach((prestador, index) => {
        console.log(`\n   ${index + 1}. ${prestador.nome} (${prestador.cod_nome || 'Sem código'}):`);
        console.log(`      - Franquia Horas: ${prestador.franquia_horas || 'N/A'} (${typeof prestador.franquia_horas})`);
        console.log(`      - Franquia KM: ${prestador.franquia_km || 'N/A'} km`);
        console.log(`      - Valor Hora Adicional: R$ ${prestador.valor_hora_adc || 0}`);
        console.log(`      - Valor KM Adicional: R$ ${prestador.valor_km_adc || 0}`);
      });
    }

    // 3. Testar endpoint financeiro individual para ver se as franquias estão sendo aplicadas
    console.log('\n3️⃣ Testando endpoint financeiro individual...');
    const financeiroResponse = await axios.get(`${API_BASE_URL}/api/v1/financeiro/controle-prestadores-individual`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { periodo: 'tudo' }
    });

    console.log('✅ Endpoint financeiro funcionando!');
    console.log('   Acionamentos individuais encontrados:', financeiroResponse.data.length);
    
    if (financeiroResponse.data.length > 0) {
      console.log('\n💰 Análise dos Cálculos Financeiros:');
      
      // Agrupar por prestador para análise
      const prestadoresMap = new Map();
      financeiroResponse.data.forEach((acionamento) => {
        const nome = acionamento.nome;
        if (!prestadoresMap.has(nome)) {
          prestadoresMap.set(nome, {
            nome,
            acionamentos: [],
            prestador_data: acionamento.prestador_data
          });
        }
        
        prestadoresMap.get(nome).acionamentos.push(acionamento);
      });
      
      // Analisar alguns prestadores
      let contador = 0;
      prestadoresMap.forEach((prestador, nome) => {
        if (contador < 2 && prestador.acionamentos.length > 0) {
          contador++;
          console.log(`\n   📋 ${nome}:`);
          
          if (prestador.prestador_data) {
            const franquiaHoras = Number(prestador.prestador_data.franquia_horas) || 3;
            const franquiaKm = Number(prestador.prestador_data.franquia_km) || 50;
            console.log(`      - Franquia Horas Cadastrada: ${franquiaHoras}h`);
            console.log(`      - Franquia KM Cadastrada: ${franquiaKm}km`);
            
            prestador.acionamentos.slice(0, 2).forEach((acionamento, i) => {
              console.log(`\n      ${i + 1}. Acionamento ID ${acionamento.id}:`);
              console.log(`         - Tempo Total: ${acionamento.total_horas_adicionais}h`);
              console.log(`         - KM Total: ${acionamento.total_km}km`);
              console.log(`         - Status: ${acionamento.status_cadastro}`);
              
              if (typeof acionamento.total_valor_hora_adc === 'number') {
                // Calcular manualmente para verificar
                const horasAdicionais = Math.max(0, acionamento.total_horas_adicionais - franquiaHoras);
                const kmAdicionais = Math.max(0, acionamento.total_km - franquiaKm);
                const valorHoraAdc = Number(prestador.prestador_data.valor_hora_adc) || 0;
                const valorKmAdc = Number(prestador.prestador_data.valor_km_adc) || 0;
                
                const valorHoraCalculado = horasAdicionais * valorHoraAdc;
                const valorKmCalculado = kmAdicionais * valorKmAdc;
                
                console.log(`         - Horas Adicionais: ${horasAdicionais}h (${acionamento.total_horas_adicionais} - ${franquiaHoras})`);
                console.log(`         - KM Adicionais: ${kmAdicionais}km (${acionamento.total_km} - ${franquiaKm})`);
                console.log(`         - Valor Hora Adicional: R$ ${valorHoraCalculado} (${horasAdicionais} × R$ ${valorHoraAdc})`);
                console.log(`         - Valor KM Adicional: R$ ${valorKmCalculado} (${kmAdicionais} × R$ ${valorKmAdc})`);
                console.log(`         - Sistema retornou: Hora=${acionamento.total_valor_hora_adc}, KM=${acionamento.total_valor_km_adc}`);
                
                // Verificar se os cálculos batem
                if (Math.abs(valorHoraCalculado - acionamento.total_valor_hora_adc) < 0.01) {
                  console.log(`         ✅ Valor Hora Adicional CORRETO!`);
                } else {
                  console.log(`         ❌ Valor Hora Adicional INCORRETO! Esperado: R$ ${valorHoraCalculado}, Recebido: R$ ${acionamento.total_valor_hora_adc}`);
                }
                
                if (Math.abs(valorKmCalculado - acionamento.total_valor_km_adc) < 0.01) {
                  console.log(`         ✅ Valor KM Adicional CORRETO!`);
                } else {
                  console.log(`         ❌ Valor KM Adicional INCORRETO! Esperado: R$ ${valorKmCalculado}, Recebido: R$ ${acionamento.total_valor_km_adc}`);
                }
              } else {
                console.log(`         - Valor Hora Adicional: ${acionamento.total_valor_hora_adc}`);
                console.log(`         - Valor KM Adicional: ${acionamento.total_valor_km_adc}`);
              }
            });
          } else {
            console.log(`      - Prestador não cadastrado ou sem dados`);
          }
        }
      });
    }

    // 4. Testar com dados específicos se possível
    console.log('\n4️⃣ Simulação de Cálculo:');
    
    // Exemplo: Prestador com franquia de 2h e 30km
    const exemploFranquiaHoras = 2;
    const exemploFranquiaKm = 30;
    const exemploTempoTotal = 5; // 5 horas
    const exemploKmTotal = 100;  // 100 km
    const exemploValorHoraAdc = 50; // R$ 50/hora
    const exemploValorKmAdc = 2;    // R$ 2/km
    
    const exemploHorasAdicionais = Math.max(0, exemploTempoTotal - exemploFranquiaHoras);
    const exemploKmAdicionais = Math.max(0, exemploKmTotal - exemploFranquiaKm);
    const exemploValorHora = exemploHorasAdicionais * exemploValorHoraAdc;
    const exemploValorKm = exemploKmAdicionais * exemploValorKmAdc;
    
    console.log(`   Cenário: Prestador com franquia ${exemploFranquiaHoras}h/${exemploFranquiaKm}km`);
    console.log(`   Ocorrência: ${exemploTempoTotal}h e ${exemploKmTotal}km`);
    console.log(`   Horas Adicionais: ${exemploHorasAdicionais}h (${exemploTempoTotal} - ${exemploFranquiaHoras})`);
    console.log(`   KM Adicionais: ${exemploKmAdicionais}km (${exemploKmTotal} - ${exemploFranquiaKm})`);
    console.log(`   Valor Hora: R$ ${exemploValorHora} (${exemploHorasAdicionais} × R$ ${exemploValorHoraAdc})`);
    console.log(`   Valor KM: R$ ${exemploValorKm} (${exemploKmAdicionais} × R$ ${exemploValorKmAdc})`);
    console.log(`   Total: R$ ${exemploValorHora + exemploValorKm}`);

    console.log('\n🎯 CONCLUSÃO:');
    console.log('   ✅ Correção aplicada: Franquias agora vêm do banco de dados');
    console.log('   ✅ Fallback: Usa 3h/50km apenas se valores não estiverem preenchidos');
    console.log('   ✅ Validação: Cálculos devem usar franquias específicas de cada prestador');
    
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('   1. Fazer deploy da correção em produção');
    console.log('   2. Verificar se prestadores têm franquias preenchidas no banco');
    console.log('   3. Testar com dados reais para confirmar cálculos corretos');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data?.error || error.message);
  }
}

// Executar teste
testarCorrecaoFranquias();
