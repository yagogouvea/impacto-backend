"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = process.env.HOST || '0.0.0.0';
console.log('🚀 Iniciando servidor Costa & Camargo...');
console.log(`📋 Configuração:`);
console.log(`   Porta: ${PORT}`);
console.log(`   Host: ${HOST}`);
console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'DEFINIDA' : 'NÃO DEFINIDA'}`);
const server = app_1.default.listen(PORT, HOST, () => {
    console.log(`✅ Servidor rodando em http://${HOST}:${PORT}`);
    console.log(`🌐 Health check: http://${HOST}:${PORT}/api/health`);
    console.log(`🔍 Teste: http://${HOST}:${PORT}/api/test`);
    console.log(`📊 Status: http://${HOST}:${PORT}/api`);
});
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
exports.default = server;
//# sourceMappingURL=server.js.map