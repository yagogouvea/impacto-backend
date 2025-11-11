const axios = require('axios');

// Configuração da API
const API_BASE_URL = 'http://localhost:3001'; // Ajuste conforme necessário
const API_ENDPOINT = '/api/prestadores-publico';

// Função para testar diferentes cenários de CPF
const testarCPF = () => {
  const cpfs = [
    '12345678901',           // CPF válido sem formatação
    '123.456.789-01',        // CPF válido com formatação
    '1234567890',            // CPF inválido (10 dígitos)
    '123456789012',          // CPF inválido (12 dígitos)
    '11111111111',           // CPF inválido (todos iguais)
    '00000000000',           // CPF inválido (zeros)
    '123.456.789-0',         // CPF com formatação incompleta
    '123456789-01',          // CPF com hífen mas sem pontos
  ];

  return cpfs;
};

// Função para testar diferentes cenários de telefone
const testarTelefone = () => {
  const telefones = [
    '11999999999',           // Celular válido sem formatação
    '(11) 99999-9999',       // Celular válido com formatação
    '1133334444',            // Fixo válido sem formatação
    '(11) 3333-4444',        // Fixo válido com formatação
    '1199999999',            // Telefone inválido (9 dígitos)
    '999999999',             // Telefone inválido (sem DDD)
    '119999999999',          // Telefone inválido (12 dígitos)
    '(11) 99999-999',        // Telefone com formatação incompleta
    '11 99999-9999',         // Telefone sem parênteses
  ];

  return telefones;
};

// Função para testar diferentes cenários de CEP
const testarCEP = () => {
  const ceps = [
    '01234567',              // CEP válido sem formatação
    '01234-567',             // CEP válido com formatação
    '0123456',               // CEP inválido (7 dígitos)
    '012345678',             // CEP inválido (9 dígitos)
    '01234-56',              // CEP com formatação incompleta
    '00000-000',             // CEP de teste
  ];

  return ceps;
};

// Função para criar payload de teste
const criarPayload = (cpf, telefone, cep) => ({
  nome: 'João Silva Teste',
  cpf: cpf,
  cod_nome: 'João',
  telefone: telefone,
  email: 'joao.teste@email.com',
  tipo_pix: 'cpf',
  chave_pix: cpf,
  cep: cep,
  endereco: 'Rua Teste, 123',
  bairro: 'Centro',
  cidade: 'São Paulo',
  estado: 'SP',
  funcoes: ['Pronta resposta'],
  regioes: ['São Paulo, SP'],
  tipo_veiculo: ['Carro'],
  aprovado: false
});

// Função para testar um cenário específico
const testarCenario = async (cpf, telefone, cep, descricao) => {
  console.log(`\n🧪 Testando: ${descricao}`);
  console.log(`   CPF: ${cpf}`);
  console.log(`   Telefone: ${telefone}`);
  console.log(`   CEP: ${cep}`);

  try {
    const payload = criarPayload(cpf, telefone, cep);
    
    const response = await axios.post(`${API_BASE_URL}${API_ENDPOINT}`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log(`   ✅ Sucesso: ${response.status} - ${response.statusText}`);
    if (response.data) {
      console.log(`   📄 Resposta:`, JSON.stringify(response.data, null, 2));
    }
    
    return { success: true, status: response.status, data: response.data };

  } catch (error) {
    console.log(`   ❌ Erro: ${error.response?.status || 'Network Error'} - ${error.response?.statusText || error.message}`);
    
    if (error.response?.data) {
      console.log(`   📄 Detalhes do erro:`, JSON.stringify(error.response.data, null, 2));
    }
    
    return { 
      success: false, 
      status: error.response?.status, 
      error: error.response?.data || error.message 
    };
  }
};

// Função principal de teste
const executarTestes = async () => {
  console.log('🚀 Iniciando testes do formulário externo...\n');

  const cpfs = testarCPF();
  const telefones = testarTelefone();
  const ceps = testarCEP();

  const resultados = [];

  // Teste 1: Cenário válido completo
  console.log('='.repeat(60));
  console.log('TESTE 1: CENÁRIO VÁLIDO COMPLETO');
  console.log('='.repeat(60));
  
  const resultado1 = await testarCenario(
    '12345678901',
    '11999999999',
    '01234567',
    'Cenário válido completo'
  );
  resultados.push({ teste: 'Cenário válido', ...resultado1 });

  // Teste 2: CPFs com diferentes formatações
  console.log('\n' + '='.repeat(60));
  console.log('TESTE 2: DIFERENTES FORMATOS DE CPF');
  console.log('='.repeat(60));
  
  for (let i = 0; i < cpfs.length; i++) {
    const cpf = cpfs[i];
    const resultado = await testarCenario(
      cpf,
      '11999999999',
      '01234567',
      `CPF: ${cpf}`
    );
    resultados.push({ teste: `CPF ${cpf}`, ...resultado });
  }

  // Teste 3: Telefones com diferentes formatações
  console.log('\n' + '='.repeat(60));
  console.log('TESTE 3: DIFERENTES FORMATOS DE TELEFONE');
  console.log('='.repeat(60));
  
  for (let i = 0; i < telefones.length; i++) {
    const telefone = telefones[i];
    const resultado = await testarCenario(
      '12345678901',
      telefone,
      '01234567',
      `Telefone: ${telefone}`
    );
    resultados.push({ teste: `Telefone ${telefone}`, ...resultado });
  }

  // Teste 4: CEPs com diferentes formatações
  console.log('\n' + '='.repeat(60));
  console.log('TESTE 4: DIFERENTES FORMATOS DE CEP');
  console.log('='.repeat(60));
  
  for (let i = 0; i < ceps.length; i++) {
    const cep = ceps[i];
    const resultado = await testarCenario(
      '12345678901',
      '11999999999',
      cep,
      `CEP: ${cep}`
    );
    resultados.push({ teste: `CEP ${cep}`, ...resultado });
  }

  // Resumo dos resultados
  console.log('\n' + '='.repeat(60));
  console.log('RESUMO DOS RESULTADOS');
  console.log('='.repeat(60));
  
  const sucessos = resultados.filter(r => r.success);
  const falhas = resultados.filter(r => !r.success);
  
  console.log(`✅ Sucessos: ${sucessos.length}`);
  console.log(`❌ Falhas: ${falhas.length}`);
  console.log(`📊 Total: ${resultados.length}`);

  if (falhas.length > 0) {
    console.log('\n🔍 DETALHES DAS FALHAS:');
    falhas.forEach((falha, index) => {
      console.log(`${index + 1}. ${falha.teste}`);
      console.log(`   Status: ${falha.status}`);
      console.log(`   Erro: ${JSON.stringify(falha.error, null, 2)}`);
    });
  }

  // Análise de padrões
  console.log('\n' + '='.repeat(60));
  console.log('ANÁLISE DE PADRÕES');
  console.log('='.repeat(60));
  
  const errosPorTipo = {};
  falhas.forEach(falha => {
    if (falha.error?.error) {
      const tipoErro = falha.error.error;
      errosPorTipo[tipoErro] = (errosPorTipo[tipoErro] || 0) + 1;
    }
  });

  console.log('Tipos de erro encontrados:');
  Object.entries(errosPorTipo).forEach(([tipo, count]) => {
    console.log(`  - ${tipo}: ${count} ocorrências`);
  });

  return resultados;
};

// Executar os testes
if (require.main === module) {
  executarTestes()
    .then(resultados => {
      console.log('\n🎯 Testes concluídos!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erro ao executar testes:', error);
      process.exit(1);
    });
}

module.exports = { executarTestes, testarCenario };

