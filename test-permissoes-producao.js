const axios = require('axios');

// Configuração da API de produção
const API_BASE_URL = 'https://api.impactopr.seg.br';
const API_ENDPOINT = '/api/users';

// Token de teste (substitua por um token válido)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIs...'; // Substitua pelo token real

async function testarPermissoesProducao() {
  console.log('🧪 Testando permissões em produção...\n');

  try {
    // 1. Testar listagem de usuários
    console.log('1️⃣ Testando listagem de usuários...');
    const responseList = await axios.get(`${API_BASE_URL}${API_ENDPOINT}`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Listagem de usuários:', responseList.status);
    console.log('📊 Total de usuários:', responseList.data.length);
    
    if (responseList.data.length > 0) {
      const primeiroUsuario = responseList.data[0];
      console.log('👤 Primeiro usuário:', {
        id: primeiroUsuario.id,
        name: primeiroUsuario.name,
        email: primeiroUsuario.email,
        role: primeiroUsuario.role,
        permissions: primeiroUsuario.permissions
      });
    }

    // 2. Testar atualização de usuário
    if (responseList.data.length > 0) {
      const usuarioId = responseList.data[0].id;
      console.log(`\n2️⃣ Testando atualização do usuário ${usuarioId}...`);
      
      try {
        const responseUpdate = await axios.put(`${API_BASE_URL}${API_ENDPOINT}/${usuarioId}`, {
          name: 'Teste Update',
          email: 'teste@teste.com',
          role: 'usuario',
          permissions: ['access:dashboard', 'access:ocorrencias'],
          active: true
        }, {
          headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Atualização de usuário:', responseUpdate.status);
        console.log('📄 Resposta:', responseUpdate.data);
        
      } catch (error) {
        console.log('❌ Erro na atualização:', error.response?.status, error.response?.statusText);
        console.log('📄 Detalhes do erro:', error.response?.data);
      }
    }

    // 3. Testar exclusão de usuário
    if (responseList.data.length > 1) {
      const usuarioId = responseList.data[1].id;
      console.log(`\n3️⃣ Testando exclusão do usuário ${usuarioId}...`);
      
      try {
        const responseDelete = await axios.delete(`${API_BASE_URL}${API_ENDPOINT}/${usuarioId}`, {
          headers: {
            'Authorization': `Bearer ${TEST_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅ Exclusão de usuário:', responseDelete.status);
        console.log('📄 Resposta:', responseDelete.data);
        
      } catch (error) {
        console.log('❌ Erro na exclusão:', error.response?.status, error.response?.statusText);
        console.log('📄 Detalhes do erro:', error.response?.data);
      }
    }

    // 4. Testar endpoint de relatórios
    console.log('\n4️⃣ Testando endpoint de relatórios...');
    try {
      const responseRelatorios = await axios.get(`${API_BASE_URL}/api/relatorios`, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Endpoint de relatórios:', responseRelatorios.status);
      console.log('📄 Resposta:', responseRelatorios.data);
      
    } catch (error) {
      console.log('❌ Erro no endpoint de relatórios:', error.response?.status, error.response?.statusText);
      console.log('📄 Detalhes do erro:', error.response?.data);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.response?.status, error.response?.statusText);
    console.error('📄 Detalhes do erro:', error.response?.data);
  }
}

// Executar o teste
if (require.main === module) {
  testarPermissoesProducao()
    .then(() => {
      console.log('\n🎯 Teste concluído');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no teste:', error);
      process.exit(1);
    });
}

module.exports = { testarPermissoesProducao };
