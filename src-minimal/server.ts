import app from './app';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = process.env.HOST || '0.0.0.0';

console.log('🚀 Iniciando servidor Costa & Camargo...');
console.log(`📋 Configuração:`);
console.log(`   Porta: ${PORT}`);
console.log(`   Host: ${HOST}`);
console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'DEFINIDA' : 'NÃO DEFINIDA'}`);

const server = app.listen(PORT, HOST, () => {
  console.log(`✅ Servidor rodando em http://${HOST}:${PORT}`);
  console.log(`🌐 Health check: http://${HOST}:${PORT}/api/health`);
  console.log(`🔍 Teste: http://${HOST}:${PORT}/api/test`);
  console.log(`📊 Status: http://${HOST}:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM recebido, fechando servidor...');
  server.close(() => {
    console.log('✅ Servidor fechado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT recebido, fechando servidor...');
  server.close(() => {
    console.log('✅ Servidor fechado');
    process.exit(0);
  });
});

export default server;
