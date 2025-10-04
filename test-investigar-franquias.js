const axios = require('axios');

const API_BASE_URL = process.env.API_BASE_URL || 'https://painel.impactopr.seg.br';

async function investigarFranquias() {
  try {
    console.log('🔍 INVESTIGAÇÃO: Franquias dos Prestadores Cadastrados');
    console.log('===================================================\n');

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
      console.log('\n📊 Análise das Franquias Cadastradas:');
      
      let comFranquiaHoras = 0;
      let comFranquiaKm = 0;
      let comValoresCompletos = 0;
      let semFranquias = 0;
      
      prestadoresResponse.data.forEach((prestador, index) => {
        const temFranquiaHoras = prestador.franquia_horas && prestador.franquia_horas !== '0' && prestador.franquia_horas !== '0.0';
        const temFranquiaKm = prestador.franquia_km && prestador.franquia_km > 0;
        const temValoresCompletos = prestador.valor_acionamento > 0 && prestador.valor_hora_adc > 0 && prestador.valor_km_adc > 0;
        
        if (temFranquiaHoras) comFranquiaHoras++;
        if (temFranquiaKm) comFranquiaKm++;
        if (temValoresCompletos) comValoresCompletos++;
        if (!temFranquiaHoras && !temFranquiaKm) semFranquias++;
        
        // Mostrar detalhes dos primeiros prestadores
        if (index < 5) {
          console.log(`\n   ${index + 1}. ${prestador.nome} (${prestador.cod_nome || 'Sem código'}):`);
          console.log(`      - Valor Acionamento: R$ ${prestador.valor_acionamento || 0}`);
          console.log(`      - Franquia Horas: "${prestador.franquia_horas}" (${typeof prestador.franquia_horas})`);
          console.log(`      - Franquia KM: ${prestador.franquia_km || 0} km`);
          console.log(`      - Valor Hora Adicional: R$ ${prestador.valor_hora_adc || 0}`);
          console.log(`      - Valor KM Adicional: R$ ${prestador.valor_km_adc || 0}`);
          
          // Analisar franquia_horas
          if (prestador.franquia_horas) {
            console.log(`      - Franquia Horas Analisada:`);
            console.log(`        * Valor original: "${prestador.franquia_horas}"`);
            console.log(`        * É string: ${typeof prestador.franquia_horas === 'string'}`);
            console.log(`        * É número válido: ${!isNaN(Number(prestador.franquia_horas))}`);
            console.log(`        * Valor numérico: ${Number(prestador.franquia_horas)}`);
            console.log(`        * Maior que 0: ${Number(prestador.franquia_horas) > 0}`);
          }
        }
      });
      
      console.log('\n📈 ESTATÍSTICAS DAS FRANQUIAS:');
      console.log(`   - Com franquia_horas preenchida: ${comFranquiaHoras}`);
      console.log(`   - Com franquia_km preenchida: ${comFranquiaKm}`);
      console.log(`   - Com valores financeiros completos: ${comValoresCompletos}`);
      console.log(`   - Sem franquias: ${semFranquias}`);
      console.log(`   - Total: ${prestadoresResponse.data.length}`);
      
      // Buscar exemplos específicos
      console.log('\n🔍 EXEMPLOS ESPECÍFICOS:');
      
      // Prestadores com franquias diferentes de 3h e 50km
      const exemplosEspeciais = prestadoresResponse.data.filter(p => {
        const franquiaHorasNum = Number(p.franquia_horas);
        const franquiaKmNum = Number(p.franquia_km);
        return (franquiaHorasNum > 0 && franquiaHorasNum !== 3) || (franquiaKmNum > 0 && franquiaKmNum !== 50);
      });
      
      if (exemplosEspeciais.length > 0) {
        console.log(`   Encontrados ${exemplosEspeciais.length} prestadores com franquias diferentes de 3h/50km:`);
        exemplosEspeciais.forEach((p, i) => {
          if (i < 3) { // Mostrar apenas os primeiros 3
            console.log(`   ${i + 1}. ${p.nome}: ${p.franquia_horas}h / ${p.franquia_km}km`);
          }
        });
      } else {
        console.log('   ❌ Nenhum prestador encontrado com franquias diferentes de 3h/50km');
      }
    }

    // 3. Testar cálculo atual vs correto
    console.log('\n3️⃣ Testando Cálculo Atual vs Correto...');
    
    // Simular uma ocorrência com 5 horas e 100km
    const tempoTotal = 5; // 5 horas
    const kmTotal = 100;  // 100 km
    
    console.log(`   Cenário: Ocorrência com ${tempoTotal} horas e ${kmTotal} km`);
    
    // Cálculo atual (ERRADO - forçando 3h e 50km)
    const franquiaHorasAtual = 3; // FORÇADO
    const franquiaKmAtual = 50;   // FORÇADO
    const horasAdicionaisAtual = Math.max(0, tempoTotal - franquiaHorasAtual);
    const kmAdicionaisAtual = Math.max(0, kmTotal - franquiaKmAtual);
    
    console.log(`   ❌ Cálculo ATUAL (FORÇADO):`);
    console.log(`      - Franquia Horas: ${franquiaHorasAtual}h (forçado)`);
    console.log(`      - Franquia KM: ${franquiaKmAtual}km (forçado)`);
    console.log(`      - Horas Adicionais: ${horasAdicionaisAtual}h`);
    console.log(`      - KM Adicionais: ${kmAdicionaisAtual}km`);
    
    // Cálculo correto (usando dados do banco)
    if (prestadoresResponse.data.length > 0) {
      const prestadorExemplo = prestadoresResponse.data[0];
      const franquiaHorasCorreto = Number(prestadorExemplo.franquia_horas) || 3;
      const franquiaKmCorreto = Number(prestadorExemplo.franquia_km) || 50;
      const horasAdicionaisCorreto = Math.max(0, tempoTotal - franquiaHorasCorreto);
      const kmAdicionaisCorreto = Math.max(0, kmTotal - franquiaKmCorreto);
      
      console.log(`   ✅ Cálculo CORRETO (DO BANCO):`);
      console.log(`      - Prestador: ${prestadorExemplo.nome}`);
      console.log(`      - Franquia Horas: ${franquiaHorasCorreto}h (do banco)`);
      console.log(`      - Franquia KM: ${franquiaKmCorreto}km (do banco)`);
      console.log(`      - Horas Adicionais: ${horasAdicionaisCorreto}h`);
      console.log(`      - KM Adicionais: ${kmAdicionaisCorreto}km`);
      
      if (franquiaHorasAtual !== franquiaHorasCorreto || franquiaKmAtual !== franquiaKmCorreto) {
        console.log(`   ⚠️ DIFERENÇA ENCONTRADA! Os cálculos não batem!`);
      }
    }

    console.log('\n🎯 DIAGNÓSTICO:');
    console.log('   1. ✅ Verificar se franquia_horas e franquia_km estão preenchidos no banco');
    console.log('   2. ❌ PROBLEMA: Código está ignorando valores do banco e forçando 3h/50km');
    console.log('   3. ✅ SOLUÇÃO: Usar prestadorCadastrado.franquia_horas e franquia_km');
    console.log('   4. ✅ FALLBACK: Usar 3h/50km apenas se valores não estiverem preenchidos');

  } catch (error) {
    console.error('❌ Erro na investigação:', error.response?.data?.error || error.message);
  }
}

// Executar investigação
investigarFranquias();
