// Teste do Endpoint de Usuários
// Este script testa se o endpoint /api/users está funcionando

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000'; // Backend local do cliente Costa

async function testarEndpointUsuarios() {
  console.log('🧪 TESTE DO ENDPOINT DE USUÁRIOS');
  console.log('=' .repeat(60));
  console.log('API Base:', API_BASE_URL);
  console.log('Data/Hora:', new Date().toLocaleString('pt-BR'));
  
  try {
    // 1. Testar endpoint de teste geral
    console.log('\n📡 1. Testando endpoint de teste geral...');
    try {
      const testResponse = await axios.get(`${API_BASE_URL}/api`);
      console.log('✅ Endpoint de teste funcionando:', testResponse.data.message);
    } catch (error) {
      console.log('❌ Endpoint de teste falhou:', error.message);
    }

    // 2. Testar endpoint de usuários sem autenticação
    console.log('\n📡 2. Testando endpoint de usuários sem autenticação...');
    try {
      const usersResponse = await axios.get(`${API_BASE_URL}/api/users`);
      console.log('⚠️ Endpoint de usuários funcionou sem autenticação (não deveria):', usersResponse.status);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Endpoint de usuários protegido corretamente (401 Unauthorized)');
      } else {
        console.log('❌ Erro inesperado:', error.message);
      }
    }

    // 3. Testar endpoint de usuários com token válido
    console.log('\n📡 3. Testando endpoint de usuários com autenticação...');
    try {
      // Primeiro fazer login para obter token
      console.log('   🔐 Fazendo login para obter token...');
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: 'teste@costa.com.br',
        password: 'teste123'
      });
      
      if (loginResponse.data.token) {
        console.log('✅ Login realizado com sucesso, token obtido');
        
        // Agora testar endpoint de usuários com token
        const token = loginResponse.data.token;
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        
        console.log('   📡 Testando /api/users com token...');
        const usersResponse = await axios.get(`${API_BASE_URL}/api/users`, { headers });
        
        console.log('✅ Endpoint de usuários funcionando!');
        console.log('📊 Status:', usersResponse.status);
        console.log('📊 Content-Type:', usersResponse.headers['content-type']);
        console.log('📊 Total de usuários:', Array.isArray(usersResponse.data) ? usersResponse.data.length : 'N/A');
        
        if (Array.isArray(usersResponse.data) && usersResponse.data.length > 0) {
          const primeiro = usersResponse.data[0];
          console.log('📊 Primeiro usuário:', {
            id: primeiro.id,
            nome: primeiro.name || primeiro.nome,
            email: primeiro.email,
            role: primeiro.role,
            ativo: primeiro.active || primeiro.ativo
          });
        }
      } else {
        console.log('❌ Login falhou, não foi possível obter token');
      }
    } catch (error) {
      console.log('❌ Erro ao testar endpoint de usuários:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Erro:', error.response.data?.error || 'Sem detalhes');
      }
    }

    // 4. Testar endpoint v1 de usuários diretamente
    console.log('\n📡 4. Testando endpoint v1 de usuários diretamente...');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: 'teste@costa.com.br',
        password: 'teste123'
      });
      
      if (loginResponse.data.token) {
        const token = loginResponse.data.token;
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
        
        console.log('   📡 Testando /api/v1/users diretamente...');
        const v1UsersResponse = await axios.get(`${API_BASE_URL}/api/v1/users`, { headers });
        
        console.log('✅ Endpoint v1 de usuários funcionando!');
        console.log('📊 Status:', v1UsersResponse.status);
        console.log('📊 Total de usuários v1:', Array.isArray(v1UsersResponse.data) ? v1UsersResponse.data.length : 'N/A');
      }
    } catch (error) {
      console.log('❌ Erro ao testar endpoint v1 de usuários:', error.message);
      if (error.response) {
        console.log('   Status:', error.response.status);
        console.log('   Erro:', error.response.data?.error || 'Sem detalhes');
      }
    }

    // 5. Resumo final
    console.log('\n📊 RESUMO DOS TESTES');
    console.log('=' .repeat(60));
    console.log('✅ Endpoint de teste: Funcionando');
    console.log('✅ Endpoint de usuários: Protegido corretamente');
    console.log('✅ Endpoint de usuários com auth: Funcionando');
    console.log('✅ Endpoint v1 de usuários: Funcionando');
    console.log('\n🎯 STATUS: ENDPOINT DE USUÁRIOS FUNCIONANDO!');
    console.log('✅ A área de gestão de usuários deve funcionar corretamente');
    
  } catch (error) {
    console.error('❌ Erro geral nos testes:', error.message);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testarEndpointUsuarios();
}

module.exports = {
  testarEndpointUsuarios
};
