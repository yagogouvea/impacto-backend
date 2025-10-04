const axios = require('axios');
require('dotenv').config();

// URLs de produção
const PRODUCTION_API_URL = 'https://api.impactopr.seg.br';

async function testarFinanceiroProducao() {
  try {
    console.log('🧪 TESTE - Endpoints Financeiro em Produção\n');

    // 1. Login em produção
    console.log('1️⃣ Fazendo login em produção...');
    const loginResponse = await axios.post(`${PRODUCTION_API_URL}/api/auth/login`, {
      email: 'teste@teste',
      password: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login em produção realizado com sucesso!');

    // 2. Testar endpoint Controle Detalhado
    console.log('\n2️⃣ Testando endpoint Controle Detalhado em produção...');
    try {
      const detalhadoResponse = await axios.get(`${PRODUCTION_API_URL}/api/v1/financeiro/controle-detalhado`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          periodo: 'mes_atual',
          cliente: 'todos',
          operador: 'todos'
        }
      });
      
      console.log('✅ Controle Detalhado funcionando em produção!');
      console.log(`   Total de ocorrências: ${detalhadoResponse.data.length}`);
      
      if (detalhadoResponse.data.length > 0) {
        const primeira = detalhadoResponse.data[0];
        console.log('   Primeira ocorrência:');
        console.log(`     ID: ${primeira.id}`);
        console.log(`     Cliente: ${primeira.cliente}`);
        console.log(`     Prestador: ${primeira.prestador}`);
        console.log(`     Parecer: ${primeira.parecer ? 'SIM' : 'NÃO'}`);
        console.log(`     Despesas Total: ${primeira.despesas_total}`);
        console.log(`     KM Total: ${primeira.km_total}`);
        console.log(`     Tempo Total (horas): ${primeira.tempo_total_horas}`);
        
        if (primeira.parecer) {
          console.log(`     Texto do parecer: ${primeira.parecer.substring(0, 100)}...`);
        }
      }
    } catch (error) {
      console.log('❌ Erro no Controle Detalhado em produção:', error.response?.data?.error);
      console.log('   Status:', error.response?.status);
      console.log('   Headers:', error.response?.headers);
    }

    // 3. Testar endpoint Controle Prestadores
    console.log('\n3️⃣ Testando endpoint Controle Prestadores em produção...');
    try {
      const prestadoresResponse = await axios.get(`${PRODUCTION_API_URL}/api/v1/financeiro/controle-prestadores`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          periodo: 'mes_atual'
        }
      });
      
      console.log('✅ Controle Prestadores funcionando em produção!');
      console.log(`   Total de prestadores: ${prestadoresResponse.data.length}`);
      
      if (prestadoresResponse.data.length > 0) {
        const primeiro = prestadoresResponse.data[0];
        console.log('   Primeiro prestador:');
        console.log(`     Nome: ${primeiro.nome}`);
        console.log(`     Cadastrado: ${primeiro.is_cadastrado}`);
        console.log(`     Tem parecer: ${primeiro.tem_parecer}`);
        console.log(`     Quantidade de pareceres: ${primeiro.pareceres_count}`);
        console.log(`     Total Acionamentos: ${primeiro.total_acionamentos}`);
        console.log(`     Total KM: ${primeiro.total_km}`);
        console.log(`     Total Despesas: ${primeiro.total_despesas}`);
        console.log(`     Total Horas Adicionais: ${primeiro.total_horas_adicionais}`);
      }
    } catch (error) {
      console.log('❌ Erro no Controle Prestadores em produção:', error.response?.data?.error);
      console.log('   Status:', error.response?.status);
    }

    // 4. Testar endpoint Buscar Prestadores
    console.log('\n4️⃣ Testando endpoint Buscar Prestadores em produção...');
    try {
      const buscarResponse = await axios.get(`${PRODUCTION_API_URL}/api/v1/financeiro/prestadores`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          busca: ''
        }
      });
      
      console.log('✅ Buscar Prestadores funcionando em produção!');
      console.log(`   Total de prestadores cadastrados: ${buscarResponse.data.length}`);
      
      if (buscarResponse.data.length > 0) {
        const primeiro = buscarResponse.data[0];
        console.log('   Primeiro prestador cadastrado:');
        console.log(`     Nome: ${primeiro.nome}`);
        console.log(`     Código: ${primeiro.cod_nome}`);
        console.log(`     Valor Acionamento: ${primeiro.valor_acionamento}`);
        console.log(`     Franquia Horas: ${primeiro.franquia_horas}`);
        console.log(`     Franquia KM: ${primeiro.franquia_km}`);
        console.log(`     Valor Hora Adicional: ${primeiro.valor_hora_adc}`);
        console.log(`     Valor KM Adicional: ${primeiro.valor_km_adc}`);
      }
    } catch (error) {
      console.log('❌ Erro no Buscar Prestadores em produção:', error.response?.data?.error);
      console.log('   Status:', error.response?.status);
    }

    // 5. Verificar se o problema é no frontend
    console.log('\n5️⃣ Verificando se o problema é no frontend...');
    console.log('   Para verificar o frontend, acesse:');
    console.log('   https://painel.impactopr.seg.br/financeiro');
    console.log('   e verifique se as abas "Controle Detalhado" e "Controle Prestadores"');
    console.log('   estão mostrando dados ou se estão vazias.');

    console.log('\n🎉 TESTE DOS ENDPOINTS FINANCEIRO EM PRODUÇÃO CONCLUÍDO!');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data?.error || error.message);
    console.log('   Status:', error.response?.status);
    console.log('   URL:', error.config?.url);
  }
}

testarFinanceiroProducao();
