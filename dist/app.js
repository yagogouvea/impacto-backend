"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const prisma_1 = require("./lib/prisma");
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
// Middleware de log para todas as requisições
app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.get('origin')}`);
    next();
});
// Rota de teste simples
app.get('/api/test', (req, res) => {
    console.log('[app] Rota de teste acessada');
    res.json({ message: 'API funcionando!', timestamp: new Date().toISOString() });
});
// Rota básica para /api
app.get('/api', (req, res) => {
    res.status(200).json({ message: 'API Costa & Camargo online!' });
});
// Rota básica para teste
app.get('/', (_req, res) => {
    res.json({ message: 'API Costa & Camargo - Funcionando!' });
});
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
// Rota simples para clientes
app.get('/api/clientes', async (req, res) => {
    try {
        console.log('[app] GET /api/clientes - Listando clientes');
        const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
        const prisma = new PrismaClient();
        const clientes = await prisma.cliente.findMany({
            orderBy: { nome: 'asc' }
        });
        console.log(`[app] ${clientes.length} clientes encontrados`);
        res.json(clientes);
        await prisma.$disconnect();
    }
    catch (error) {
        console.error('[app] Erro ao listar clientes:', error);
        res.status(500).json({ error: 'Erro ao listar clientes' });
    }
});
// Rota simples para ocorrências
app.get('/api/ocorrencias', async (req, res) => {
    try {
        console.log('[app] GET /api/ocorrencias - Listando ocorrências');
        console.log('[app] Query params:', req.query);
        const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
        const prisma = new PrismaClient();
        const ocorrencias = await prisma.ocorrencia.findMany({
            orderBy: { criado_em: 'desc' }
        });
        console.log(`[app] ${ocorrencias.length} ocorrências encontradas`);
        res.json(ocorrencias);
        await prisma.$disconnect();
    }
    catch (error) {
        console.error('[app] Erro ao listar ocorrências:', error);
        res.status(500).json({ error: 'Erro ao listar ocorrências' });
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
