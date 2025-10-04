const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'https://painel.impactopr.seg.br';

async function testarCorrespondenciaPrestadores() {
  try {
    console.log('🔍 TESTE: Correspondência de Prestadores');
    console.log('=======================================\n');

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

    console.log('✅ Prestadores cadastrados:', prestadoresResponse.data.length);
    
    // 3. Buscar acionamentos individuais
    console.log('\n3️⃣ Buscando acionamentos individuais...');
    const acionamentosResponse = await axios.get(`${API_BASE_URL}/api/v1/financeiro/controle-prestadores-individual`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { periodo: 'tudo' }
    });

    console.log('✅ Acionamentos encontrados:', acionamentosResponse.data.length);
    
    if (prestadoresResponse.data.length > 0 && acionamentosResponse.data.length > 0) {
      console.log('\n📊 Análise de Correspondência:');
      
      // Criar mapa de prestadores para busca rápida
      const prestadoresMap = new Map();
      prestadoresResponse.data.forEach(prestador => {
        prestadoresMap.set(prestador.nome.toLowerCase(), prestador);
        if (prestador.cod_nome) {
          prestadoresMap.set(prestador.cod_nome.toLowerCase(), prestador);
        }
      });
      
      console.log(`   Mapa de prestadores criado com ${prestadoresMap.size} entradas`);
      
      // Analisar correspondências
      let correspondenciasEncontradas = 0;
      let correspondenciasPerdidas = 0;
      const prestadoresAnalisados = new Set();
      
      acionamentosResponse.data.forEach((acionamento, index) => {
        if (index < 10) { // Analisar apenas os primeiros 10
          const nomePrestador = acionamento.nome.toLowerCase();
          
          // Tentar encontrar correspondência exata
          let prestadorEncontrado = prestadoresMap.get(nomePrestador);
          
          // Se não encontrou, tentar busca parcial
          if (!prestadorEncontrado) {
            for (const [key, prestador] of prestadoresMap.entries()) {
              if (key.includes(nomePrestador) || nomePrestador.includes(key)) {
                prestadorEncontrado = prestador;
                break;
              }
            }
          }
          
          console.log(`\n   ${index + 1}. Acionamento ID ${acionamento.id}:`);
          console.log(`      - Nome na Ocorrência: "${acionamento.nome}"`);
          console.log(`      - Prestador Encontrado: ${prestadorEncontrado ? 'SIM' : 'NÃO'}`);
          
          if (prestadorEncontrado) {
            correspondenciasEncontradas++;
            prestadoresAnalisados.add(prestadorEncontrado.nome);
            
            console.log(`      - Nome Cadastrado: "${prestadorEncontrado.nome}"`);
            console.log(`      - Código: "${prestadorEncontrado.cod_nome || 'N/A'}"`);
            console.log(`      - Valor Hora Adicional: R$ ${prestadorEncontrado.valor_hora_adc || 0}`);
            console.log(`      - Valor KM Adicional: R$ ${prestadorEncontrado.valor_km_adc || 0}`);
            console.log(`      - Franquia Horas: ${prestadorEncontrado.franquia_horas || 'N/A'}`);
            console.log(`      - Franquia KM: ${prestadorEncontrado.franquia_km || 'N/A'} km`);
            
            // Verificar se os valores batem com o que foi calculado
            if (typeof acionamento.total_valor_hora_adc === 'number' && 
                typeof acionamento.total_valor_km_adc === 'number') {
              
              console.log(`      - Sistema Calculou:`);
              console.log(`        * Valor Hora: R$ ${acionamento.total_valor_hora_adc}`);
              console.log(`        * Valor KM: R$ ${acionamento.total_valor_km_adc}`);
              console.log(`        * Horas Adicionais: ${acionamento.total_horas_adicionais}h`);
              console.log(`        * KM Adicionais: ${acionamento.total_km_adicionais}km`);
              
              // Calcular taxa implícita
              if (acionamento.total_horas_adicionais > 0) {
                const taxaHoraSistema = acionamento.total_valor_hora_adc / acionamento.total_horas_adicionais;
                console.log(`        * Taxa Hora Sistema: R$ ${taxaHoraSistema.toFixed(2)}/h`);
                console.log(`        * Taxa Hora Cadastrada: R$ ${prestadorEncontrado.valor_hora_adc || 0}/h`);
                
                if (Math.abs(taxaHoraSistema - (prestadorEncontrado.valor_hora_adc || 0)) > 0.01) {
                  console.log(`        ❌ TAXA HORA NÃO BATE!`);
                } else {
                  console.log(`        ✅ Taxa Hora CORRETA!`);
                }
              }
              
              if (acionamento.total_km_adicionais > 0) {
                const taxaKmSistema = acionamento.total_valor_km_adc / acionamento.total_km_adicionais;
                console.log(`        * Taxa KM Sistema: R$ ${taxaKmSistema.toFixed(2)}/km`);
                console.log(`        * Taxa KM Cadastrada: R$ ${prestadorEncontrado.valor_km_adc || 0}/km`);
                
                if (Math.abs(taxaKmSistema - (prestadorEncontrado.valor_km_adc || 0)) > 0.01) {
                  console.log(`        ❌ TAXA KM NÃO BATE!`);
                } else {
                  console.log(`        ✅ Taxa KM CORRETA!`);
                }
              }
            }
            
          } else {
            correspondenciasPerdidas++;
            console.log(`      ❌ PRESTADOR NÃO ENCONTRADO NO BANCO!`);
            console.log(`      - Status: ${acionamento.status_cadastro}`);
            console.log(`      - Valor Hora: ${acionamento.total_valor_hora_adc}`);
            console.log(`      - Valor KM: ${acionamento.total_valor_km_adc}`);
          }
        }
      });
      
      console.log('\n📈 ESTATÍSTICAS:');
      console.log(`   - Correspondências Encontradas: ${correspondenciasEncontradas}`);
      console.log(`   - Correspondências Perdidas: ${correspondenciasPerdidas}`);
      console.log(`   - Prestadores Únicos Analisados: ${prestadoresAnalisados.size}`);
      
      // Mostrar prestadores cadastrados que não foram encontrados nas ocorrências
      console.log('\n🔍 Prestadores Cadastrados (amostra):');
      prestadoresResponse.data.slice(0, 5).forEach((prestador, index) => {
        console.log(`   ${index + 1}. "${prestador.nome}" (${prestador.cod_nome || 'Sem código'})`);
        console.log(`      - Valor Hora: R$ ${prestador.valor_hora_adc || 0}`);
        console.log(`      - Valor KM: R$ ${prestador.valor_km_adc || 0}`);
        console.log(`      - Franquia Horas: ${prestador.franquia_horas || 'N/A'}`);
        console.log(`      - Franquia KM: ${prestador.franquia_km || 'N/A'} km`);
      });
    }

    console.log('\n🎯 DIAGNÓSTICO:');
    console.log('   1. ✅ Verificar se nomes de prestadores nas ocorrências batem com os cadastrados');
    console.log('   2. ✅ Verificar se valores cadastrados estão sendo usados na multiplicação');
    console.log('   3. ✅ Verificar se franquias estão sendo aplicadas corretamente');
    console.log('   4. ✅ Verificar se há fallback para valores padrão quando prestador não é encontrado');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data?.error || error.message);
  }
}

// Executar teste
testarCorrespondenciaPrestadores();
