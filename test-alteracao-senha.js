const axios = require('axios');

// Configuração da API de produção
const API_BASE_URL = 'https://api.impactopr.seg.br';

// Token de teste (substitua por um token válido)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIs...'; // Substitua pelo token real

async function testarAlteracaoSenha() {
  console.log('🔐 Testando alteração de senha em produção...\n');

  try {
    // 1. Listar usuários para pegar um ID
    console.log('1️⃣ Listando usuários...');
    const responseList = await axios.get(`${API_BASE_URL}/api/users`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Listagem de usuários:', responseList.status);
    console.log('📊 Total de usuários:', responseList.data.length);
    
    if (responseList.data.length === 0) {
      console.log('❌ Nenhum usuário encontrado para teste');
      return;
    }

    const primeiroUsuario = responseList.data[0];
    console.log('👤 Primeiro usuário:', {
      id: primeiroUsuario.id,
      name: primeiroUsuario.name,
      email: primeiroUsuario.email,
      role: primeiroUsuario.role,
      permissions: primeiroUsuario.permissions
    });

    // 2. Testar alteração de senha
    const usuarioId = primeiroUsuario.id;
    console.log(`\n2️⃣ Testando alteração de senha para usuário ${usuarioId}...`);
    
    const passwordData = {
      password: 'novaSenha123',
      confirmPassword: 'novaSenha123'
    };
    
    console.log('📤 Dados enviados:', passwordData);
    
    try {
      const responsePassword = await axios.patch(`${API_BASE_URL}/api/users/${usuarioId}/password`, passwordData, {
        headers: {
          'Authorization': `Bearer ${TEST_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Alteração de senha:', responsePassword.status);
      console.log('📄 Resposta:', responsePassword.data);
      
    } catch (error) {
      console.log('❌ Erro na alteração de senha:', error.response?.status, error.response?.statusText);
      console.log('📄 Detalhes do erro:', error.response?.data);
      console.log('🔍 Headers da requisição:', error.config?.headers);
      console.log('🔍 URL da requisição:', error.config?.url);
    }

    // 3. Testar outras operações para comparar
    console.log(`\n3️⃣ Testando atualização de usuário para comparação...`);
    
    try {
      const responseUpdate = await axios.put(`${API_BASE_URL}/api/users/${usuarioId}`, {
        name: 'Teste Update',
        email: primeiroUsuario.email,
        role: primeiroUsuario.role,
        permissions: primeiroUsuario.permissions,
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
      console.log('❌ Erro na atualização de usuário:', error.response?.status, error.response?.statusText);
      console.log('📄 Detalhes do erro:', error.response?.data);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error.response?.status, error.response?.statusText);
    console.error('📄 Detalhes do erro:', error.response?.data);
  }
}

// Executar o teste
if (require.main === module) {
  testarAlteracaoSenha()
    .then(() => {
      console.log('\n🎯 Teste de alteração de senha concluído');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no teste:', error);
      process.exit(1);
    });
}

module.exports = { testarAlteracaoSenha };

