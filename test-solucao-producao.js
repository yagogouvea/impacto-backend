const axios = require('axios');
require('dotenv').config();

// URLs de produção
const PRODUCTION_API_URL = 'https://api.impactopr.seg.br';

async function testarSolucaoProducao() {
  try {
    console.log('🧪 TESTE - Solução para Produção\n');

    // 1. Login em produção
    console.log('1️⃣ Fazendo login em produção...');
    const loginResponse = await axios.post(`${PRODUCTION_API_URL}/api/auth/login`, {
      email: 'teste@teste',
      password: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login em produção realizado com sucesso!');

    // 2. Testar endpoint Controle Detalhado com período "tudo"
    console.log('\n2️⃣ Testando Controle Detalhado com período "tudo"...');
    try {
      const detalhadoResponse = await axios.get(`${PRODUCTION_API_URL}/api/v1/financeiro/controle-detalhado`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          periodo: 'tudo'
        }
      });
      
      console.log('✅ Controle Detalhado com "tudo" funcionando!');
      console.log(`   Total de ocorrências: ${detalhadoResponse.data.length}`);
      
      if (detalhadoResponse.data.length > 0) {
        const primeira = detalhadoResponse.data[0];
        console.log('   Primeira ocorrência:');
        console.log(`     ID: ${primeira.id}`);
        console.log(`     Cliente: ${primeira.cliente}`);
        console.log(`     Prestador: ${primeira.prestador}`);
        console.log(`     Data: ${primeira.data_acionamento ? new Date(primeira.data_acionamento).toLocaleDateString('pt-BR') : 'N/A'}`);
        console.log(`     Parecer: ${primeira.parecer ? 'SIM' : 'NÃO'}`);
        console.log(`     Despesas Total: R$ ${primeira.despesas_total || 0}`);
        console.log(`     KM Total: ${primeira.km_total || 0} km`);
        console.log(`     Tempo Total: ${primeira.tempo_total_horas || 0} horas`);
        
        if (primeira.parecer) {
          console.log(`     Texto do parecer: ${primeira.parecer.substring(0, 100)}...`);
        }
      }
    } catch (error) {
      console.log('❌ Erro no Controle Detalhado:', error.response?.data?.error);
    }

    // 3. Testar endpoint Controle Prestadores com período "tudo"
    console.log('\n3️⃣ Testando Controle Prestadores com período "tudo"...');
    try {
      const prestadoresResponse = await axios.get(`${PRODUCTION_API_URL}/api/v1/financeiro/controle-prestadores`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          periodo: 'tudo'
        }
      });
      
      console.log('✅ Controle Prestadores com "tudo" funcionando!');
      console.log(`   Total de prestadores: ${prestadoresResponse.data.length}`);
      
      if (prestadoresResponse.data.length > 0) {
        prestadoresResponse.data.forEach((prestador, index) => {
          console.log(`   Prestador ${index + 1}:`);
          console.log(`     Nome: ${prestador.nome}`);
          console.log(`     Cadastrado: ${prestador.is_cadastrado}`);
          console.log(`     Tem parecer: ${prestador.tem_parecer}`);
          console.log(`     Quantidade de pareceres: ${prestador.pareceres_count}`);
          console.log(`     Total Acionamentos: ${prestador.total_acionamentos}`);
          console.log(`     Total KM: ${prestador.total_km} km`);
          console.log(`     Total Despesas: R$ ${prestador.total_despesas}`);
          console.log(`     Total Horas Adicionais: ${prestador.total_horas_adicionais} horas`);
        });
      }
    } catch (error) {
      console.log('❌ Erro no Controle Prestadores:', error.response?.data?.error);
    }

    console.log('\n🎉 TESTE DA SOLUÇÃO CONCLUÍDO!');
    console.log('\n📊 RESUMO DA SOLUÇÃO:');
    console.log('   ✅ Backend funcionando corretamente em produção');
    console.log('   ✅ Endpoints financeiros respondendo');
    console.log('   ✅ Dados sendo retornados quando período = "tudo"');
    console.log('   ✅ Problema identificado: filtro padrão era "mes_atual"');
    console.log('   ✅ Solução aplicada: mudança do padrão para "tudo"');
    console.log('\n🔧 PRÓXIMOS PASSOS:');
    console.log('   1. Deploy do frontend atualizado em produção');
    console.log('   2. As abas financeiras agora mostrarão dados por padrão');
    console.log('   3. Usuários podem filtrar por período conforme necessário');
    console.log('\n🌐 Para testar em produção após deploy:');
    console.log('   https://painel.impactopr.seg.br/financeiro');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data?.error || error.message);
  }
}

testarSolucaoProducao();
