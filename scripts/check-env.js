#!/usr/bin/env node

/**
 * Script para verificar variáveis de ambiente
 * Execute: node scripts/check-env.js
 */

console.log('🔍 Verificando variáveis de ambiente...\n');

const requiredVars = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET'
];

const optionalVars = [
  'BASE_URL',
  'FRONTEND_URL'
];

let hasErrors = false;

// Verificar variáveis obrigatórias
console.log('📋 Variáveis obrigatórias:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: NÃO DEFINIDA`);
    hasErrors = true;
  } else {
    // Verificar formato da DATABASE_URL
    if (varName === 'DATABASE_URL') {
      if (!value.startsWith('postgresql://') && !value.startsWith('postgres://')) {
        console.log(`❌ ${varName}: Formato inválido. Deve começar com 'postgresql://' ou 'postgres://'`);
        console.log(`   Valor atual: ${value}`);
        hasErrors = true;
      } else {
        console.log(`✅ ${varName}: ${value.substring(0, 50)}...`);
      }
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  }
});

// Verificar variáveis opcionais
console.log('\n📋 Variáveis opcionais:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`⚠️  ${varName}: NÃO DEFINIDA (opcional)`);
  } else {
    console.log(`✅ ${varName}: ${value}`);
  }
});

// Verificar NODE_ENV
const nodeEnv = process.env.NODE_ENV;
if (nodeEnv && !['development', 'production', 'test'].includes(nodeEnv)) {
  console.log(`❌ NODE_ENV: Valor inválido '${nodeEnv}'. Deve ser: development, production ou test`);
  hasErrors = true;
}

// Verificar PORT
const port = process.env.PORT;
if (port && isNaN(Number(port))) {
  console.log(`❌ PORT: Valor inválido '${port}'. Deve ser um número`);
  hasErrors = true;
}

console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.log('❌ ERROS ENCONTRADOS!');
  console.log('💡 Dica: Configure as variáveis de ambiente ou use os arquivos de exemplo:');
  console.log('   - env.example');
  console.log('   - railway.env (para Railway)');
  console.log('   - gcp.env (para Google Cloud)');
  process.exit(1);
} else {
  console.log('✅ Todas as variáveis obrigatórias estão configuradas!');
  console.log('🚀 Pronto para iniciar a aplicação.');
}
