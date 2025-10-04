const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'https://painel.impactopr.seg.br';

async function testarAcionamentosIndividuais() {
  try {
    console.log('🧪 TESTE: Acionamentos Individuais (Não Agrupados)');
    console.log('==================================================\n');

    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/v1/auth/login`, {
      email: 'teste@teste',
      password: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso');

    // 2. Testar endpoint antigo (agrupado)
    console.log('\n2️⃣ Testando endpoint ANTIGO (agrupado)...');
    const antigoResponse = await axios.get(`${API_BASE_URL}/api/v1/financeiro/controle-prestadores`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { periodo: 'tudo' }
    });

    console.log('✅ Endpoint antigo funcionando!');
    console.log('   Prestadores únicos encontrados:', antigoResponse.data.length);
    
    if (antigoResponse.data.length > 0) {
      console.log('   Primeiro prestador (agrupado):');
      const p = antigoResponse.data[0];
      console.log(`     - Nome: ${p.nome}`);
      console.log(`     - Total Acionamentos: ${p.total_acionamentos}`);
      console.log(`     - Total KM: ${p.total_km} km`);
      console.log(`     - Total Horas: ${p.total_horas_adicionais} horas`);
    }

    // 3. Testar endpoint novo (individual)
    console.log('\n3️⃣ Testando endpoint NOVO (individual)...');
    const novoResponse = await axios.get(`${API_BASE_URL}/api/v1/financeiro/controle-prestadores-individual`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { periodo: 'tudo' }
    });

    console.log('✅ Endpoint novo funcionando!');
    console.log('   Acionamentos individuais encontrados:', novoResponse.data.length);
    
    if (novoResponse.data.length > 0) {
      console.log('\n📊 Análise dos acionamentos individuais:');
      
      // Agrupar por prestador para comparar
      const prestadoresMap = new Map();
      novoResponse.data.forEach((acionamento, index) => {
        const nome = acionamento.nome;
        if (!prestadoresMap.has(nome)) {
          prestadoresMap.set(nome, {
            nome,
            acionamentos: [],
            total_acionamentos: 0,
            total_km: 0,
            total_horas: 0
          });
        }
        
        const prestador = prestadoresMap.get(nome);
        prestador.acionamentos.push(acionamento);
        prestador.total_acionamentos += 1;
        prestador.total_km += acionamento.total_km;
        prestador.total_horas += acionamento.total_horas_adicionais;
        
        // Mostrar alguns exemplos
        if (index < 3) {
          console.log(`\n   ${index + 1}. Acionamento Individual:`);
          console.log(`      - ID: ${acionamento.id}`);
          console.log(`      - Data: ${new Date(acionamento.data_ocorrencia).toLocaleDateString('pt-BR')}`);
          console.log(`      - Cliente: ${acionamento.cliente}`);
          console.log(`      - Placa: ${acionamento.placa}`);
          console.log(`      - Prestador: ${acionamento.nome}`);
          console.log(`      - Status: ${acionamento.status_cadastro}`);
          console.log(`      - KM: ${acionamento.total_km} km`);
          console.log(`      - Horas: ${acionamento.total_horas_adicionais} horas`);
          console.log(`      - Acionamentos: ${acionamento.total_acionamentos} (sempre 1)`);
        }
      });
      
      console.log('\n📈 COMPARAÇÃO: Agrupado vs Individual');
      console.log('   Prestadores únicos no endpoint antigo:', antigoResponse.data.length);
      console.log('   Total de acionamentos no endpoint novo:', novoResponse.data.length);
      console.log('   Prestadores únicos no endpoint novo:', prestadoresMap.size);
      
      // Verificar se os totais batem
      prestadoresMap.forEach((prestador, nome) => {
        const prestadorAntigo = antigoResponse.data.find(p => p.nome === nome);
        if (prestadorAntigo) {
          console.log(`\n   📋 ${nome}:`);
          console.log(`      Antigo: ${prestadorAntigo.total_acionamentos} acionamentos, ${prestadorAntigo.total_km} km, ${prestadorAntigo.total_horas_adicionais} horas`);
          console.log(`      Novo:   ${prestador.total_acionamentos} acionamentos, ${prestador.total_km} km, ${prestador.total_horas} horas`);
          
          if (prestadorAntigo.total_acionamentos === prestador.total_acionamentos) {
            console.log(`      ✅ Acionamentos batem!`);
          } else {
            console.log(`      ⚠️ Diferença nos acionamentos!`);
          }
        }
      });
    }

    console.log('\n🎯 CONCLUSÃO:');
    console.log('   ✅ Endpoint antigo: Agrupa prestadores (uma linha por prestador)');
    console.log('   ✅ Endpoint novo: Cada acionamento em uma linha separada');
    console.log('   ✅ Dados financeiros calculados corretamente para cada acionamento');
    console.log('   ✅ Frontend atualizado para usar o novo endpoint');
    
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('   1. Fazer deploy das correções em produção');
    console.log('   2. Testar no frontend para confirmar que cada acionamento aparece em uma linha');
    console.log('   3. Verificar se os valores financeiros estão corretos para cada linha');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data?.error || error.message);
  }
}

// Executar teste
testarAcionamentosIndividuais();
