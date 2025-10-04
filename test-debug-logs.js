const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'https://painel.impactopr.seg.br';

async function testarDebugLogs() {
  try {
    console.log('🔍 TESTE: Debug Logs da Multiplicação');
    console.log('=====================================\n');

    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
      email: 'teste@teste',
      password: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');

    // 2. Buscar apenas alguns acionamentos para ver os logs
    console.log('\n2️⃣ Buscando acionamentos (limitado para debug)...');
    const acionamentosResponse = await axios.get(`${API_BASE_URL}/api/v1/financeiro/controle-prestadores-individual`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { periodo: '30d' } // Limitar para não gerar muitos logs
    });

    console.log('✅ Acionamentos encontrados:', acionamentosResponse.data.length);
    
    if (acionamentosResponse.data.length > 0) {
      console.log('\n📊 Primeiros acionamentos (para análise):');
      
      acionamentosResponse.data.slice(0, 3).forEach((acionamento, index) => {
        console.log(`\n   ${index + 1}. Acionamento ID ${acionamento.id}:`);
        console.log(`      - Prestador: ${acionamento.nome}`);
        console.log(`      - Status: ${acionamento.status_cadastro}`);
        console.log(`      - Tempo Total: ${acionamento.total_horas_adicionais}h`);
        console.log(`      - KM Total: ${acionamento.total_km}km`);
        console.log(`      - Valor Hora Adicional: ${acionamento.total_valor_hora_adc}`);
        console.log(`      - Valor KM Adicional: ${acionamento.total_valor_km_adc}`);
        
        if (acionamento.prestador_data) {
          console.log(`      - Prestador Cadastrado: SIM`);
          console.log(`      - Valor Hora Cadastrado: R$ ${acionamento.prestador_data.valor_hora_adc || 0}`);
          console.log(`      - Valor KM Cadastrado: R$ ${acionamento.prestador_data.valor_km_adc || 0}`);
          console.log(`      - Franquia Horas: ${acionamento.prestador_data.franquia_horas || 'N/A'}`);
          console.log(`      - Franquia KM: ${acionamento.prestador_data.franquia_km || 'N/A'} km`);
        } else {
          console.log(`      - Prestador Cadastrado: NÃO`);
        }
      });
    }

    console.log('\n🎯 Os logs de debug devem aparecer no console do servidor backend.');
    console.log('   Verifique os logs do backend para ver os detalhes da multiplicação.');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data?.error || error.message);
  }
}

// Executar teste
testarDebugLogs();
