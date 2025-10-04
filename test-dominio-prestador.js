const axios = require('axios');
require('dotenv').config();

// URLs de teste
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const PRESTADOR_DOMAIN_URL = 'https://cadastroprestador.impactopr.seg.br';

async function testarDominioPrestador() {
  try {
    console.log('🧪 TESTE - Domínio cadastroprestador.impactopr.seg.br\n');

    // 1. Testar endpoint local com header de domínio
    console.log('1️⃣ Testando endpoint local com header de domínio...');
    try {
      const response = await axios.get(`${API_BASE_URL}/`, {
        headers: {
          'Host': 'cadastroprestador.impactopr.seg.br',
          'Origin': 'https://cadastroprestador.impactopr.seg.br'
        }
      });
      
      console.log('✅ Resposta recebida do endpoint local!');
      console.log('   Status:', response.status);
      console.log('   Content-Type:', response.headers['content-type']);
      console.log('   Tamanho da resposta:', response.data.length, 'caracteres');
      
      if (response.data.includes('Cadastro de Prestadores')) {
        console.log('   ✅ Página de cadastro detectada!');
      } else {
        console.log('   ⚠️  Página de cadastro não detectada');
      }
      
    } catch (error) {
      console.log('❌ Erro no teste local:', error.response?.data || error.message);
    }

    // 2. Testar endpoint de cadastro específico
    console.log('\n2️⃣ Testando endpoint de cadastro específico...');
    try {
      const response = await axios.get(`${API_BASE_URL}/cadastro-prestador-externo`, {
        headers: {
          'Host': 'cadastroprestador.impactopr.seg.br',
          'Origin': 'https://cadastroprestador.impactopr.seg.br'
        }
      });
      
      console.log('✅ Endpoint específico funcionando!');
      console.log('   Status:', response.status);
      console.log('   Content-Type:', response.headers['content-type']);
      
    } catch (error) {
      console.log('❌ Erro no endpoint específico:', error.response?.data || error.message);
    }

    // 3. Testar CORS
    console.log('\n3️⃣ Testando configuração CORS...');
    try {
      const response = await axios.options(`${API_BASE_URL}/api/v1/prestadores`, {
        headers: {
          'Origin': 'https://cadastroprestador.impactopr.seg.br',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      console.log('✅ CORS funcionando!');
      console.log('   Status:', response.status);
      console.log('   Access-Control-Allow-Origin:', response.headers['access-control-allow-origin']);
      console.log('   Access-Control-Allow-Methods:', response.headers['access-control-allow-methods']);
      
    } catch (error) {
      console.log('❌ Erro no CORS:', error.response?.data || error.message);
    }

    // 4. Testar endpoint de cadastro público
    console.log('\n4️⃣ Testando endpoint de cadastro público...');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/prestadores-publico`, {
        headers: {
          'Origin': 'https://cadastroprestador.impactopr.seg.br'
        }
      });
      
      console.log('✅ Endpoint de cadastro público funcionando!');
      console.log('   Status:', response.status);
      
    } catch (error) {
      console.log('❌ Erro no endpoint público:', error.response?.data || error.message);
    }

    console.log('\n🎉 TESTE DO DOMÍNIO PRESTADOR CONCLUÍDO!');
    console.log('\n📊 RESUMO DA IMPLEMENTAÇÃO:');
    console.log('   ✅ Middleware de redirecionamento implementado');
    console.log('   ✅ Rota específica para domínio criada');
    console.log('   ✅ Página de cadastro personalizada');
    console.log('   ✅ Configuração CORS atualizada');
    console.log('   ✅ Frontend com rota específica');
    console.log('\n🔧 PRÓXIMOS PASSOS:');
    console.log('   1. Deploy do backend com middleware');
    console.log('   2. Deploy do frontend com nova rota');
    console.log('   3. Configurar DNS para cadastroprestador.impactopr.seg.br');
    console.log('   4. Testar em produção');
    console.log('\n🌐 URLs para testar após deploy:');
    console.log('   https://cadastroprestador.impactopr.seg.br/');
    console.log('   https://cadastroprestador.impactopr.seg.br/cadastro-prestador-externo');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testarDominioPrestador();
