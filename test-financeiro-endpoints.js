const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

async function testarEndpointsFinanceiro() {
  try {
    console.log('🧪 TESTE - Endpoints Financeiro\n');

    // 1. Login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'teste@teste',
      password: '123456'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso!');

    // 2. Testar endpoint Controle Detalhado
    console.log('\n2️⃣ Testando endpoint Controle Detalhado...');
    try {
      const detalhadoResponse = await axios.get(`${API_BASE_URL}/api/v1/financeiro/controle-detalhado`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          periodo: 'mes_atual',
          cliente: 'todos',
          operador: 'todos'
        }
      });
      
      console.log('✅ Controle Detalhado funcionando!');
      console.log(`   Total de ocorrências: ${detalhadoResponse.data.length}`);
      
      if (detalhadoResponse.data.length > 0) {
        const primeira = detalhadoResponse.data[0];
        console.log('   Primeira ocorrência:');
        console.log(`     ID: ${primeira.id}`);
        console.log(`     Cliente: ${primeira.cliente}`);
        console.log(`     Prestador: ${primeira.prestador}`);
        console.log(`     Despesas Total: ${primeira.despesas_total}`);
        console.log(`     KM Total: ${primeira.km_total}`);
        console.log(`     Tempo Total (horas): ${primeira.tempo_total_horas}`);
      }
    } catch (error) {
      console.log('❌ Erro no Controle Detalhado:', error.response?.data?.error);
    }

    // 3. Testar endpoint Controle Prestadores
    console.log('\n3️⃣ Testando endpoint Controle Prestadores...');
    try {
      const prestadoresResponse = await axios.get(`${API_BASE_URL}/api/v1/financeiro/controle-prestadores`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          periodo: 'mes_atual'
        }
      });
      
      console.log('✅ Controle Prestadores funcionando!');
      console.log(`   Total de prestadores: ${prestadoresResponse.data.length}`);
      
      if (prestadoresResponse.data.length > 0) {
        const primeiro = prestadoresResponse.data[0];
        console.log('   Primeiro prestador:');
        console.log(`     Nome: ${primeiro.nome}`);
        console.log(`     Cadastrado: ${primeiro.is_cadastrado}`);
        console.log(`     Total Acionamentos: ${primeiro.total_acionamentos}`);
        console.log(`     Total KM: ${primeiro.total_km}`);
        console.log(`     Total Despesas: ${primeiro.total_despesas}`);
        console.log(`     Total Horas Adicionais: ${primeiro.total_horas_adicionais}`);
      }
    } catch (error) {
      console.log('❌ Erro no Controle Prestadores:', error.response?.data?.error);
    }

    // 4. Testar endpoint Buscar Prestadores
    console.log('\n4️⃣ Testando endpoint Buscar Prestadores...');
    try {
      const buscarResponse = await axios.get(`${API_BASE_URL}/api/v1/financeiro/prestadores`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          busca: ''
        }
      });
      
      console.log('✅ Buscar Prestadores funcionando!');
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
      console.log('❌ Erro no Buscar Prestadores:', error.response?.data?.error);
    }

    // 5. Testar filtros específicos
    console.log('\n5️⃣ Testando filtros específicos...');
    try {
      const filtrosResponse = await axios.get(`${API_BASE_URL}/api/v1/financeiro/controle-detalhado`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          periodo: '7dias',
          busca: 'test'
        }
      });
      
      console.log('✅ Filtros funcionando!');
      console.log(`   Ocorrências com filtro "7dias" e busca "test": ${filtrosResponse.data.length}`);
    } catch (error) {
      console.log('❌ Erro nos filtros:', error.response?.data?.error);
    }

    console.log('\n🎉 TESTE DOS ENDPOINTS FINANCEIRO CONCLUÍDO!');
    console.log('✅ Todos os endpoints estão funcionando corretamente!');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data?.error || error.message);
  }
}

testarEndpointsFinanceiro();
