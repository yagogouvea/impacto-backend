"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const allowedOrigins = [
    'https://app.painelsegtrack.com.br',
    'https://cliente.painelsegtrack.com.br',
    'https://painel.impactopr.seg.br',
    'https://api.impactopr.seg.br',
    'https://prestador.impactopr.seg.br', // Domínio para cadastro de prestadores externos
    'https://cadastroprestador.impactopr.seg.br', // Domínio específico para cadastro de prestadores
    'https://painel.costaecamargo.seg.br', // CORRIGIDO: Domínio Costa e Camargo
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080'
];
const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin'
    ],
    exposedHeaders: ['Content-Length', 'X-Requested-With'],
    maxAge: 86400 // 24 horas
};
exports.default = corsOptions;
