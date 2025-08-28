import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { testConnection } from './lib/prisma';
import authRoutes from './routes/authRoutes';
import clientesRoutes from './routes/clientes';
import ocorrenciasRoutes from './routes/ocorrencias';
import cnpjRoutes from './routes/cnpj';
// import protectedRoutes from './routes/protectedRoutes'; // Temporariamente desabilitado
import prestadorProtectedRoutes from './routes/prestadorProtectedRoutes.simple';
import prestadoresPublicoRouter from './routes/prestadoresPublico'; // NOVO: Rota para cadastro público
import v1Router from './api/v1/routes';

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
  'https://prestador.costaecamargo.com.br', // NOVO: Domínio para cadastro de prestadores externos
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

// Configuração de CORS melhorada
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    console.log(`🔍 CORS - Verificando origem: ${origin}`);
    console.log(`🔍 CORS - NODE_ENV: ${process.env.NODE_ENV}`);
    
    // Permitir requisições sem origin (como mobile apps, Postman, ou requisições diretas)
    if (!origin) {
      console.log('✅ CORS - Permitindo requisição sem origem');
      return callback(null, true);
    }
    
    // Em desenvolvimento, permitir todas as origens
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ CORS - Modo desenvolvimento, permitindo todas as origens');
      return callback(null, true);
    }
    
    // Em produção, verificar se a origem está na lista permitida
    if (allowedOrigins.includes(origin)) {
      console.log(`✅ CORS - Origem permitida: ${origin}`);
      return callback(null, true);
    }
    
    console.warn(`🚫 CORS - Origem bloqueada: ${origin}`);
    console.warn(`🔍 CORS - Origens permitidas:`, allowedOrigins);
    return callback(new Error(`Não permitido pelo CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name'
  ],
  exposedHeaders: ['Content-Length', 'Content-Type', 'Authorization'],
  optionsSuccessStatus: 200, // Para suportar navegadores legados
  preflightContinue: false
};

app.use(cors(corsOptions));

// Middleware adicional para garantir headers CORS em todas as respostas
app.use((req: Request, res: Response, next: NextFunction) => {
  const origin = req.get('origin');
  
  // Definir headers CORS manualmente como backup
  if (origin && (process.env.NODE_ENV === 'development' || allowedOrigins.includes(origin))) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, X-File-Name');
    res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Type, Authorization');
  }
  
  // Responder imediatamente a requisições OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    console.log(`🔧 CORS - Respondendo a preflight OPTIONS para: ${req.path}`);
    return res.status(200).end();
  }
  
  next();
});

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

// Rota de debug para verificar token JWT
app.get('/api/debug-token', (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  const debug: any = {
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
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
      debug.tokenValid = true;
      debug.decodedToken = {
        sub: decoded.sub,
        email: decoded.email,
        role: decoded.role,
        exp: decoded.exp
      };
    } catch (error) {
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
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'API Costa & Camargo - Funcionando!' });
});

// Registrar rotas de autenticação
app.use('/api/auth', authRoutes);

// Registrar rotas v1 (novas)
app.use('/api/v1', v1Router);

// Registrar rotas protegidas (legadas)
app.use('/api/clientes', clientesRoutes);
app.use('/api/ocorrencias', ocorrenciasRoutes);
app.use('/api/cnpj', cnpjRoutes);
// app.use('/api/protected', protectedRoutes); // Temporariamente desabilitado
app.use('/api/prestador', prestadorProtectedRoutes);
app.use('/api/prestadores-publico', prestadoresPublicoRouter); // NOVO: Rota para cadastro público

// Health check
app.get('/api/health', async (req, res) => {
  try {
    console.log('🏥 Health check - Iniciando...');
    console.log('🏥 Health check - Origin:', req.get('origin'));
    console.log('🏥 Health check - Method:', req.method);
    console.log('🏥 Health check - Headers CORS:', {
      'access-control-request-method': req.get('access-control-request-method'),
      'access-control-request-headers': req.get('access-control-request-headers')
    });
    
    await testConnection();
    console.log('✅ Health check - Conexão com banco OK');
    
    const response = { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      cors: {
        origin: req.get('origin'),
        allowedOrigins: allowedOrigins
      }
    };
    
    res.status(200).json(response);
  } catch (err) {
    console.error('❌ Health check - Erro:', err);
    res.status(500).json({ 
      status: 'erro', 
      detalhes: (err instanceof Error ? err.message : String(err)),
      timestamp: new Date().toISOString()
    });
  }
});

// Rota específica para testar CORS
app.get('/api/cors-test', (req, res) => {
  console.log('🧪 CORS Test - Requisição recebida');
  console.log('🧪 CORS Test - Origin:', req.get('origin'));
  console.log('🧪 CORS Test - Method:', req.method);
  console.log('🧪 CORS Test - Headers:', req.headers);
  
  res.json({
    message: 'CORS funcionando!',
    origin: req.get('origin'),
    timestamp: new Date().toISOString(),
    headers: req.headers
  });
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