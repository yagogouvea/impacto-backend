import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { testConnection } from './lib/prisma';
import authRoutes from './routes/authRoutes';

console.log('Iniciando configuração do Express...');

const app = express();

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
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Permitir requisições sem origin (como mobile apps ou Postman)
    if (!origin) return callback(null, true);
    
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

app.use(cors(corsOptions));

app.use(helmet());
app.use(compression());
app.use(express.json());

// Middleware de log para todas as requisições
app.use((req: Request, _res: Response, next: NextFunction) => {
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

// Rota básica para /api
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'API Costa & Camargo online!' });
});

// Rota básica para teste
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'API Costa & Camargo - Funcionando!' });
});

// Registrar rotas de autenticação
app.use('/api/auth', authRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await testConnection();
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Erro no health check:', err);
    res.status(500).json({ status: 'erro', detalhes: (err instanceof Error ? err.message : String(err)) });
  }
});

// Rota simples para clientes
app.get('/api/clientes', async (req, res) => {
  try {
    console.log('[app] GET /api/clientes - Listando clientes');
    console.log('[app] Headers:', req.headers);
    console.log('[app] Query params:', req.query);
    
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // Verificar conexão com o banco
    await prisma.$queryRaw`SELECT 1`;
    console.log('[app] Conexão com banco verificada');
    
    const clientes = await prisma.cliente.findMany({
      orderBy: { nome: 'asc' }
    });
    
    console.log(`[app] ${clientes.length} clientes encontrados`);
    res.json(clientes);
    
    await prisma.$disconnect();
  } catch (error: unknown) {
    console.error('[app] Erro ao listar clientes:', error);
    
    // Log detalhado do erro
    if (error instanceof Error) {
      console.error('[app] Erro detalhado:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    // Verificar se é erro de conexão com banco
    if (error instanceof Error && error.message.includes('connect')) {
      res.status(503).json({ 
        error: 'Serviço temporariamente indisponível',
        message: 'Problema de conexão com o banco de dados'
      });
    } else {
      res.status(500).json({ 
        error: 'Erro ao listar clientes',
        message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Erro interno do servidor'
      });
    }
  }
});

// Rota simples para ocorrências
app.get('/api/ocorrencias', async (req, res) => {
  try {
    console.log('[app] GET /api/ocorrencias - Listando ocorrências');
    console.log('[app] Headers:', req.headers);
    console.log('[app] Query params:', req.query);
    
    // Validar parâmetros de query
    const { page, limit, status, cliente } = req.query;
    
    if (page && (isNaN(Number(page)) || Number(page) < 1)) {
      return res.status(400).json({ 
        error: 'Parâmetro inválido',
        message: 'page deve ser um número maior que 0'
      });
    }
    
    if (limit && (isNaN(Number(limit)) || Number(limit) < 1 || Number(limit) > 100)) {
      return res.status(400).json({ 
        error: 'Parâmetro inválido',
        message: 'limit deve ser um número entre 1 e 100'
      });
    }
    
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // Verificar conexão com o banco
    await prisma.$queryRaw`SELECT 1`;
    console.log('[app] Conexão com banco verificada');
    
    // Construir filtros
    const where: any = {};
    if (status) where.status = status;
    if (cliente) where.cliente = { contains: String(cliente), mode: 'insensitive' };
    
    const ocorrencias = await prisma.ocorrencia.findMany({
      where,
      orderBy: { criado_em: 'desc' },
      take: limit ? Number(limit) : undefined,
      skip: page ? (Number(page) - 1) * (limit ? Number(limit) : 10) : undefined
    });
    
    console.log(`[app] ${ocorrencias.length} ocorrências encontradas`);
    res.json(ocorrencias);
    
    await prisma.$disconnect();
  } catch (error: unknown) {
    console.error('[app] Erro ao listar ocorrências:', error);
    
    // Log detalhado do erro
    if (error instanceof Error) {
      console.error('[app] Erro detalhado:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    // Verificar se é erro de conexão com banco
    if (error instanceof Error && error.message.includes('connect')) {
      res.status(503).json({ 
        error: 'Serviço temporariamente indisponível',
        message: 'Problema de conexão com o banco de dados'
      });
    } else {
      res.status(500).json({ 
        error: 'Erro ao listar ocorrências',
        message: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Erro interno do servidor'
      });
    }
  }
});

// Middleware fallback 404 (apenas para rotas de API)
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handling
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

console.log('Configuração do Express concluída!');

export default app; 