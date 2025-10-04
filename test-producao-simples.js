const axios = require('axios');

async function testarProducaoSimples() {
  try {
    console.log('🧪 TESTE SIMPLES PRODUÇÃO');
    console.log('==========================\n');

    // Testar diferentes URLs
    const urls = [
      'https://api.impactopr.seg.br',
      'https://painel.impactopr.seg.br',
      'https://app.painelsegtrack.com.br'
    ];

    for (const url of urls) {
      console.log(`\n🔍 Testando URL: ${url}`);
      try {
        const response = await axios.get(`${url}/health`, { timeout: 5000 });
        console.log(`✅ ${url} está respondendo:`, response.status);
      } catch (error) {
        console.log(`❌ ${url} não está respondendo:`, error.message);
      }
    }

    // Tentar login em produção
    console.log('\n🔐 Tentando login em produção...');
    const loginUrl = 'https://api.impactopr.seg.br';
    
    try {
      const loginResponse = await axios.post(`${loginUrl}/api/v1/auth/login`, {
        email: 'teste@teste',
        password: '123456'
      }, { timeout: 10000 });

      console.log('✅ Login em produção funcionou!');
      console.log('Token recebido:', loginResponse.data.token ? 'Sim' : 'Não');

      // Testar endpoint financeiro
      const token = loginResponse.data.token;
      const financeiroResponse = await axios.get(`${loginUrl}/api/v1/financeiro/controle-detalhado`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { periodo: 'tudo' },
        timeout: 10000
      });

      console.log('✅ Endpoint financeiro funcionando!');
      console.log('Ocorrências encontradas:', financeiroResponse.data.length);

      if (financeiroResponse.data.length > 0) {
        const primeira = financeiroResponse.data[0];
        console.log('\n📊 Primeira ocorrência:');
        console.log('   ID:', primeira.id);
        console.log('   Cliente:', primeira.cliente);
        console.log('   Tempo Total:', primeira.tempo_total_horas || 'N/A');
        console.log('   KM Total:', primeira.km_total || 'N/A');
        console.log('   Chegada:', primeira.chegada || 'N/A');
        console.log('   Término:', primeira.termino || 'N/A');
        
        if (primeira.chegada && primeira.termino && primeira.tempo_total_horas) {
          const chegada = new Date(primeira.chegada);
          const termino = new Date(primeira.termino);
          const tempoManual = (termino.getTime() - chegada.getTime()) / (1000 * 60 * 60);
          
          console.log('\n🧮 Verificação do cálculo:');
          console.log('   Tempo manual (chegada → término):', `${tempoManual.toFixed(2)} horas`);
          console.log('   Tempo no sistema:', `${primeira.tempo_total_horas.toFixed(2)} horas`);
          
          if (Math.abs(tempoManual - primeira.tempo_total_horas) < 0.01) {
            console.log('   ✅ Cálculo de tempo está correto!');
          } else {
            console.log('   ❌ Cálculo de tempo está incorreto');
          }
        }
      }

    } catch (error) {
      console.log('❌ Erro no login/produção:', error.response?.data?.error || error.message);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

// Executar teste
testarProducaoSimples();
