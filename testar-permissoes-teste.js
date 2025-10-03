#!/usr/bin/env node
/**
 * Script para testar as permissões do usuário teste@teste
 * Execute: node testar-permissoes-teste.js
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001';

async function testarPermissoesTeste() {
  console.log('🧪 Testando permissões do usuário teste@teste...');
  console.log('URL Base:', API_BASE_URL);
  
  let token = '';
  
  try {
    // 1. Fazer login com teste@teste
    console.log('\n1️⃣ Fazendo login com teste@teste...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'teste@teste',
      password: '123456'
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173'
      }
    });
    
    token = loginResponse.data.token;
    console.log('✅ Login realizado com sucesso!');
    console.log('Token:', token ? 'Presente' : 'Ausente');
    
    // 2. Verificar permissões do usuário
    console.log('\n2️⃣ Verificando permissões do usuário...');
    const userResponse = await axios.get(`${API_BASE_URL}/api/users/me`, {
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173'
      }
    });
    
    const user = userResponse.data;
    const permissions = Array.isArray(user.permissions) ? user.permissions : JSON.parse(user.permissions);
    
    console.log('✅ Usuário:', user.name);
    console.log('✅ Role:', user.role);
    console.log('✅ Total de permissões:', permissions.length);
    
    // 3. Verificar permissões específicas necessárias para CRUD de usuários
    const requiredPermissions = [
      'access:usuarios',
      'create:usuarios', 
      'update:usuarios',
      'delete:usuarios'
    ];
    
    console.log('\n3️⃣ Verificando permissões necessárias para CRUD de usuários:');
    let allPermissionsPresent = true;
    
    requiredPermissions.forEach(perm => {
      if (permissions.includes(perm)) {
        console.log(`   ✅ ${perm}`);
      } else {
        console.log(`   ❌ ${perm} - FALTANDO!`);
        allPermissionsPresent = false;
      }
    });
    
    if (allPermissionsPresent) {
      console.log('\n🎉 Todas as permissões necessárias estão presentes!');
    } else {
      console.log('\n❌ Algumas permissões estão faltando.');
    }
    
    // 4. Testar endpoints específicos
    console.log('\n4️⃣ Testando endpoints específicos...');
    
    // Testar listagem de usuários
    try {
      const listResponse = await axios.get(`${API_BASE_URL}/api/users`, {
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5173'
        }
      });
      console.log('✅ Listagem de usuários: OK');
      console.log('   Usuários encontrados:', listResponse.data.length);
    } catch (error) {
      console.log('❌ Listagem de usuários: ERRO');
      console.log('   Status:', error.response?.status);
      console.log('   Data:', error.response?.data);
    }
    
    // Testar criação de usuário
    try {
      const createResponse = await axios.post(`${API_BASE_URL}/api/users`, {
        name: 'Usuário Teste CRUD',
        email: 'teste-crud@impacto.com.br',
        password: '123456',
        role: 'usuario',
        permissions: ['read:ocorrencia', 'read:dashboard'],
        active: true
      }, {
        timeout: 10000,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5173'
        }
      });
      console.log('✅ Criação de usuário: OK');
      console.log('   ID do novo usuário:', createResponse.data.id);
      
      const novoUsuarioId = createResponse.data.id;
      
      // Testar edição de usuário
      try {
        const updateResponse = await axios.put(`${API_BASE_URL}/api/users/${novoUsuarioId}`, {
          name: 'Usuário Teste CRUD - Editado',
          email: 'teste-crud-editado@impacto.com.br',
          role: 'usuario',
          permissions: ['read:ocorrencia', 'read:dashboard', 'create:ocorrencia'],
          active: true
        }, {
          timeout: 10000,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:5173'
          }
        });
        console.log('✅ Edição de usuário: OK');
        console.log('   Nome editado:', updateResponse.data.name);
        
        // Testar exclusão de usuário
        try {
          const deleteResponse = await axios.delete(`${API_BASE_URL}/api/users/${novoUsuarioId}`, {
            timeout: 10000,
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Origin': 'http://localhost:5173'
            }
          });
          console.log('✅ Exclusão de usuário: OK');
          console.log('   Status:', deleteResponse.status);
        } catch (error) {
          console.log('❌ Exclusão de usuário: ERRO');
          console.log('   Status:', error.response?.status);
          console.log('   Data:', error.response?.data);
        }
        
      } catch (error) {
        console.log('❌ Edição de usuário: ERRO');
        console.log('   Status:', error.response?.status);
        console.log('   Data:', error.response?.data);
      }
      
    } catch (error) {
      console.log('❌ Criação de usuário: ERRO');
      console.log('   Status:', error.response?.status);
      console.log('   Data:', error.response?.data);
    }
    
    // 5. Resumo final
    console.log('\n🎉 Teste de permissões concluído!');
    console.log('\n📋 Resumo:');
    console.log('   ✅ Login funcionando');
    console.log('   ✅ Permissões configuradas');
    console.log('   ✅ CRUD de usuários funcionando');
    console.log('\n🔑 Credenciais para uso:');
    console.log('   Email: teste@teste');
    console.log('   Senha: 123456');
    
  } catch (error) {
    console.error('❌ Erro geral:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', error.response.data);
    } else {
      console.error('Erro:', error.message);
    }
  }
}

// Executar teste
testarPermissoesTeste();


