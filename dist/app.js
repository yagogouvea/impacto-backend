"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const prisma_1 = require("./lib/prisma");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const clientes_1 = __importDefault(require("./routes/clientes"));
const ocorrencias_1 = __importDefault(require("./routes/ocorrencias"));
// import protectedRoutes from './routes/protectedRoutes'; // Temporariamente desabilitado
const prestadorProtectedRoutes_simple_1 = __importDefault(require("./routes/prestadorProtectedRoutes.simple"));
console.log('Iniciando configuração do Express...');
const app = (0, express_1.default)();
// Configuração de segurança
app.set('trust proxy', 1);
// CORS - deve vir antes de qualquer rota
const allowedOrigins = [
    'https://app.painelsegtrack.com.br',
    'https://cliente.painelsegtrack.com.br',
    'https://painel.costaecamargo.seg.br',
    'https://api.costaecamargo.seg.br',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:8080',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:8080'
];
// Adicionar origens adicionais de produção se especificadas
if (process.env.CORS_ORIGINS) {
    const additionalOrigins = process.env.CORS_ORIGINS.split(',');
    allowedOrigins.push(...additionalOrigins);
}
// Em produção, permitir apenas origens HTTPS
const corsOptions = {
    origin: (origin, callback) => {
        // Permitir requisições sem origin (como mobile apps ou Postman)
        if (!origin)
            return callback(null, true);
        // Em desenvolvimento, permitir todas as origens
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        // Em produção, verificar se a origem está na lista permitida
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        console.warn(`🚫 CORS bloqueado para origem: ${origin}`);
        return callback(new Error('Não permitido pelo CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Length', 'Content-Type']
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.use(express_1.default.json());
// Middleware de log para todas as requisições
app.use((req, _res, next) => {
    const logInfo = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        origin: req.get('origin'),
        userAgent: req.get('user-agent'),
        ip: req.ip,
        query: Object.keys(req.query).length > 0 ? req.query : undefined,
        bodySize: req.body ? JSON.stringify(req.body).length : 0
    };
    console.log(`📡 Request:`, logInfo);
    next();
});
// Rota de teste simples
app.get('/api/test', (req, res) => {
    console.log('[app] Rota de teste acessada');
    res.json({ message: 'API funcionando!', timestamp: new Date().toISOString() });
});
// Rota de teste para verificar ambiente
app.get('/api/status', (req, res) => {
    const status = {
        message: 'API Costa & Camargo funcionando!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'unknown',
        version: '1.0.0',
        database: 'connected', // Será atualizado pelo health check
        cors: {
            allowedOrigins: allowedOrigins.length,
            mode: process.env.NODE_ENV === 'development' ? 'development' : 'production'
        }
    };
    console.log('[app] Status da API:', status);
    res.json(status);
});
// Rota de debug para verificar token JWT
app.get('/api/debug-token', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const debug = {
        hasAuthHeader: !!authHeader,
        authHeader: authHeader ? `${authHeader.substring(0, 20)}...` : null,
        hasToken: !!token,
        tokenStart: token ? token.substring(0, 20) : null,
        jwtSecret: process.env.JWT_SECRET ? 'PRESENTE' : 'AUSENTE',
        environment: process.env.NODE_ENV
    };
    console.log('[app] Debug Token:', debug);
    if (token && process.env.JWT_SECRET) {
        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            debug.tokenValid = true;
            debug.decodedToken = {
                sub: decoded.sub,
                email: decoded.email,
                role: decoded.role,
                exp: decoded.exp
            };
        }
        catch (error) {
            debug.tokenValid = false;
            debug.tokenError = error instanceof Error ? error.message : String(error);
        }
    }
    res.json(debug);
});
// Rota básica para /api
app.get('/api', (req, res) => {
    res.status(200).json({ message: 'API Costa & Camargo online!' });
});
// Rota básica para teste
app.get('/', (_req, res) => {
    res.json({ message: 'API Costa & Camargo - Funcionando!' });
});
// Registrar rotas de autenticação
app.use('/api/auth', authRoutes_1.default);
// Registrar rotas protegidas
app.use('/api/clientes', clientes_1.default);
app.use('/api/ocorrencias', ocorrencias_1.default);
// app.use('/api/protected', protectedRoutes); // Temporariamente desabilitado
app.use('/api/prestador', prestadorProtectedRoutes_simple_1.default);
// Health check
app.get('/api/health', async (req, res) => {
    try {
        await (0, prisma_1.testConnection)();
        res.status(200).json({ status: 'ok' });
    }
    catch (err) {
        console.error('Erro no health check:', err);
        res.status(500).json({ status: 'erro', detalhes: (err instanceof Error ? err.message : String(err)) });
    }
});
// Middleware fallback 404 (apenas para rotas de API)
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});
// Error handling
app.use((err, _req, res, _next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
console.log('Configuração do Express concluída!');
exports.default = app;
