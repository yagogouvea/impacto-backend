"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
console.log('🚀 Iniciando API Costa & Camargo...');
const app = (0, express_1.default)();
app.set('trust proxy', 1);
const allowedOrigins = [
    'https://painel.costaecamargo.seg.br',
    'https://api.costaecamargo.seg.br',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080'
];
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Length', 'Content-Type']
}));
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use(express_1.default.json());
app.use((req, _res, next) => {
    console.log(`📝 ${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin')}`);
    next();
});
app.get('/api/test', (req, res) => {
    console.log('✅ Rota de teste acessada');
    res.json({
        message: 'API Costa & Camargo funcionando!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});
app.get('/api', (req, res) => {
    res.status(200).json({
        message: 'API Costa & Camargo online!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});
app.get('/', (_req, res) => {
    res.json({
        message: 'API Costa & Camargo - Funcionando!',
        status: 'online',
        timestamp: new Date().toISOString()
    });
});
app.get('/api/health', async (req, res) => {
    try {
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development'
        });
    }
    catch (err) {
        console.error('❌ Erro no health check:', err);
        res.status(500).json({
            status: 'erro',
            detalhes: (err instanceof Error ? err.message : String(err)),
            timestamp: new Date().toISOString()
        });
    }
});
app.get('/api/clientes', async (req, res) => {
    try {
        console.log('🔍 GET /api/clientes - Listando clientes');
        const clientes = [
            {
                id: 1,
                nome: 'Costa & Camargo Segurança',
                cnpj: '12345678000199',
                contato: 'João Silva',
                telefone: '(11) 99999-9999',
                email: 'contato@costaecamargo.com.br',
                endereco: 'Rua das Flores, 123',
                bairro: 'Centro',
                cidade: 'São Paulo',
                estado: 'SP',
                cep: '01234-567'
            },
            {
                id: 2,
                nome: 'Empresa Teste LTDA',
                cnpj: '98765432000188',
                contato: 'Maria Santos',
                telefone: '(11) 88888-8888',
                email: 'contato@empresateste.com.br',
                endereco: 'Av. Paulista, 1000',
                bairro: 'Bela Vista',
                cidade: 'São Paulo',
                estado: 'SP',
                cep: '01310-100'
            }
        ];
        console.log(`✅ ${clientes.length} clientes retornados`);
        res.json(clientes);
    }
    catch (error) {
        console.error('❌ Erro ao listar clientes:', error);
        res.status(500).json({
            error: 'Erro ao listar clientes',
            timestamp: new Date().toISOString()
        });
    }
});
app.get('/api/ocorrencias', async (req, res) => {
    try {
        console.log('🔍 GET /api/ocorrencias - Listando ocorrências');
        console.log('📋 Query params:', req.query);
        const ocorrencias = [
            {
                id: 1,
                placa1: 'ABC1234',
                modelo1: 'Gol',
                cor1: 'Branco',
                cliente: 'Costa & Camargo Segurança',
                tipo: 'Roubo',
                status: 'em_andamento',
                criado_em: new Date().toISOString(),
                endereco: 'Rua das Flores, 123',
                bairro: 'Centro',
                cidade: 'São Paulo',
                estado: 'SP'
            },
            {
                id: 2,
                placa1: 'XYZ5678',
                modelo1: 'Civic',
                cor1: 'Prata',
                cliente: 'Empresa Teste LTDA',
                tipo: 'Furto',
                status: 'concluida',
                criado_em: new Date(Date.now() - 86400000).toISOString(),
                endereco: 'Av. Paulista, 1000',
                bairro: 'Bela Vista',
                cidade: 'São Paulo',
                estado: 'SP'
            }
        ];
        console.log(`✅ ${ocorrencias.length} ocorrências retornadas`);
        res.json(ocorrencias);
    }
    catch (error) {
        console.error('❌ Erro ao listar ocorrências:', error);
        res.status(500).json({
            error: 'Erro ao listar ocorrências',
            timestamp: new Date().toISOString()
        });
    }
});
app.use('/api', (req, res) => {
    console.log(`❌ Rota não encontrada: ${req.method} ${req.path}`);
    res.status(404).json({
        error: 'Rota não encontrada',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});
app.use((err, _req, res, _next) => {
    console.error('💥 Erro não tratado:', err);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
        timestamp: new Date().toISOString()
    });
});
console.log('✅ Configuração da API concluída!');
exports.default = app;
//# sourceMappingURL=app.js.map