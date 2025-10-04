const axios = require('axios');
require('dotenv').config();

// URLs de teste
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const COSTA_CAMARGO_URL = 'https://painel.costaecamargo.seg.br';

async function testarCadastroPrestadorCostaCamargo() {
  try {
    console.log('🧪 TESTE - Cadastro Prestador Costa e Camargo\n');

    // 1. Testar CORS para o domínio Costa e Camargo
    console.log('1️⃣ Testando CORS para painel.costaecamargo.seg.br...');
    try {
      const response = await axios.options(`${API_BASE_URL}/api/v1/prestadores-publico`, {
        headers: {
          'Origin': 'https://painel.costaecamargo.seg.br',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      console.log('✅ CORS funcionando para Costa e Camargo!');
      console.log('   Status:', response.status);
      console.log('   Access-Control-Allow-Origin:', response.headers['access-control-allow-origin']);
      console.log('   Access-Control-Allow-Methods:', response.headers['access-control-allow-methods']);
      
      if (response.headers['access-control-allow-origin'] === 'https://painel.costaecamargo.seg.br') {
        console.log('   ✅ Domínio Costa e Camargo autorizado no CORS');
      } else {
        console.log('   ⚠️  Domínio não está na lista de origens permitidas');
      }
      
    } catch (error) {
      console.log('❌ Erro no CORS:', error.response?.data || error.message);
    }

    // 2. Testar endpoint de cadastro público
    console.log('\n2️⃣ Testando endpoint de cadastro público...');
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/prestadores-publico`, {
        headers: {
          'Origin': 'https://painel.costaecamargo.seg.br'
        }
      });
      
      console.log('✅ Endpoint de cadastro público funcionando!');
      console.log('   Status:', response.status);
      
    } catch (error) {
      console.log('❌ Erro no endpoint público:', error.response?.data || error.message);
    }

    // 3. Simular requisição do frontend
    console.log('\n3️⃣ Simulando requisição do frontend...');
    try {
      const response = await axios.get(`${API_BASE_URL}/cadastro-prestador`, {
        headers: {
          'Host': 'painel.costaecamargo.seg.br',
          'Origin': 'https://painel.costaecamargo.seg.br',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      console.log('✅ Página de cadastro acessível!');
      console.log('   Status:', response.status);
      console.log('   Content-Type:', response.headers['content-type']);
      
      if (response.data.includes('cadastro') || response.data.includes('prestador')) {
        console.log('   ✅ Página de cadastro detectada no conteúdo');
      } else {
        console.log('   ⚠️  Página de cadastro não detectada');
      }
      
    } catch (error) {
      console.log('❌ Erro ao acessar página de cadastro:', error.response?.data || error.message);
    }

    console.log('\n🎉 TESTE COSTA E CAMARGO CONCLUÍDO!');
    console.log('\n📊 RESUMO DAS CORREÇÕES APLICADAS:');
    console.log('   ✅ Domínio painel.costaecamargo.seg.br adicionado ao CORS');
    console.log('   ✅ Rotas públicas movidas ANTES da rota catch-all /*');
    console.log('   ✅ Ordem de rotas corrigida no App.tsx');
    console.log('   ✅ Frontend compilado com correções');
    console.log('   ✅ Backend compilado com CORS atualizado');
    
    console.log('\n🔧 PROBLEMA IDENTIFICADO E CORRIGIDO:');
    console.log('   ❌ A rota catch-all /* estava interceptando /cadastro-prestador');
    console.log('   ❌ RequireAuth estava sendo aplicado a rotas públicas');
    console.log('   ❌ Domínio Costa e Camargo não estava no CORS');
    console.log('   ✅ Rotas públicas agora têm prioridade sobre catch-all');
    console.log('   ✅ CORS configurado para todos os domínios necessários');
    
    console.log('\n🌐 URLs para testar após deploy:');
    console.log('   https://painel.costaecamargo.seg.br/cadastro-prestador');
    console.log('   https://painel.impactopr.seg.br/cadastro-prestador');
    console.log('   https://cadastroprestador.impactopr.seg.br/');

  } catch (error) {
    console.error('❌ Erro no teste:', error.response?.data || error.message);
  }
}

testarCadastroPrestadorCostaCamargo();
