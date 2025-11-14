import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { sendResponse } from '../../utils/response';
import { jsonUtils } from '../../utils/json';

interface JwtPayload {
  sub: string;
  id?: string; // Adicionando id para compatibilidade
  nome?: string;
  email?: string;
  role?: string;
  permissions?: string[];
  razaoSocial?: string;
  cnpj?: string;
  tipo?: string;
  prestador_id?: number;
}

// Definição local do tipo UserRole para evitar erro de importação
type UserRole = 'admin' | 'manager' | 'operator' | 'client';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
}

type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'upload' | 'access';
type ResourceType = 
  | 'ocorrencia' 
  | 'foto' 
  | 'user' 
  | 'admin' 
  | 'manager' 
  | 'dashboard' 
  | 'relatorio' 
  | 'cliente' 
  | 'prestador'
  | 'usuarios';
type Permission = `${PermissionAction}:${ResourceType}`;

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      cliente?: JwtPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  console.log('🔍 [authenticateToken] Verificando token...');
  console.log('🔍 [authenticateToken] URL:', req.url);
  console.log('🔍 [authenticateToken] Method:', req.method);
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('❌ [authenticateToken] Token não encontrado');
    res.status(401).json({ message: 'Token de acesso necessário' });
    return;
  }

  console.log('🔍 [authenticateToken] Token encontrado:', token.substring(0, 20) + '...');

  if (!process.env.JWT_SECRET) {
    console.error('❌ [authenticateToken] JWT_SECRET não está definido no ambiente');
    res.status(500).json({ message: 'Erro de configuração do servidor' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    console.log('✅ [authenticateToken] Token válido');
    console.log('🔍 [authenticateToken] User:', decoded.nome, 'Role:', decoded.role);
    
    // Garantir que o id seja mapeado do sub para compatibilidade
    if (decoded.sub && !decoded.id) {
      decoded.id = decoded.sub;
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    console.error('❌ [authenticateToken] Erro na verificação do token:', error);
    res.status(403).json({ message: 'Token inválido' });
  }
};

// Middleware específico para autenticação de clientes
export const authenticateCliente = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ message: 'Token de acesso necessário' });
    return;
  }

  if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET não está definido no ambiente');
    res.status(500).json({ message: 'Erro de configuração do servidor' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    
    // Garantir que o id seja mapeado do sub para compatibilidade
    if (decoded.sub && !decoded.id) {
      decoded.id = decoded.sub;
    }
    
    // Verificar se é um token de cliente
    if (decoded.tipo !== 'cliente') {
      res.status(403).json({ message: 'Acesso negado. Token de cliente necessário.' });
      return;
    }

    req.cliente = decoded;
    next();
  } catch (error) {
    console.error('Erro na verificação do token de cliente:', error);
    res.status(403).json({ message: 'Token inválido' });
  }
};

export const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    console.log('[requirePermission] Verificando permissão:', permission);
    console.log('[requirePermission] Usuário:', req.user);
    console.log('[requirePermission] URL:', req.url);
    console.log('[requirePermission] Method:', req.method);
    
    if (!req.user) {
      console.log('[requirePermission] Usuário não autenticado');
      sendResponse.unauthorized(res, 'Usuário não autenticado');
      return;
    }

    // Removido bypass por cargo: autorização somente por permissões explícitas

    const perms = Array.isArray(req.user.permissions)
      ? req.user.permissions
      : typeof req.user.permissions === 'string'
        ? JSON.parse(req.user.permissions)
        : [];

    // Compatibilidade com diferentes convenções de chave
    const hasPermissionCompat = (needed: Permission): boolean => {
      if (perms.includes(needed)) return true;
      if (needed === 'access:usuarios') {
        if (perms.includes('read:user')) return true;
      }
      // Formato recurso:acao (usuarios:create) → legado create:user
      if ((needed as string).startsWith('usuarios:')) {
        const op = needed.split(':')[1];
        const legacyMap: Record<string, Permission> = {
          create: 'create:user' as Permission,
          edit: 'update:user' as Permission,
          delete: 'delete:user' as Permission
        };
        const legacy = legacyMap[op];
        if (legacy && perms.includes(legacy)) return true;
      }
      // Formato acao:recurso (create:usuarios) → novo padrão usuarios:create
      if ((needed as string).endsWith(':usuarios')) {
        const op = needed.split(':')[0];
        const modernMap: Record<string, string> = {
          create: 'usuarios:create',
          update: 'usuarios:edit',
          delete: 'usuarios:delete',
          access: 'access:usuarios'
        };
        const modern = modernMap[op];
        if (modern && perms.includes(modern)) return true;
      }
      // Mapeamento direto das permissões do frontend - BIDIRECIONAL
      const frontendMap: Record<string, string> = {
        'usuarios:create': 'create:user',
        'usuarios:edit': 'update:user',
        'usuarios:delete': 'delete:user',
        'usuarios:update': 'update:user'
      };

      // Mapeamento direto (frontend → backend)
      const mapped = frontendMap[needed as string];
      if (mapped && perms.includes(mapped)) return true;

      // Mapeamento reverso (backend → frontend) - CORREÇÃO PRINCIPAL
      const reverseMap: Record<string, string> = {
        'create:user': 'usuarios:create',
        'update:user': 'usuarios:edit',
        'delete:user': 'usuarios:delete',
        'read:user': 'access:usuarios'
      };
      const reverseMapped = reverseMap[needed as string];
      if (reverseMapped && perms.includes(reverseMapped)) return true;

      return false;
    };
    
    // LOG DETALHADO DO ARRAY DE PERMISSÕES
    console.log('[requirePermission] Permissões do usuário (array):', perms);
    console.log('[requirePermission] Permissão necessária:', permission);
    console.log('[requirePermission] Tipo das permissões:', typeof perms);
    console.log('[requirePermission] É array?', Array.isArray(perms));
    console.log('[requirePermission] URL da requisição:', req.originalUrl);
    console.log('[requirePermission] Método da requisição:', req.method);
    
    // Teste de compatibilidade detalhado
    const testResult = hasPermissionCompat(permission);
    console.log('[requirePermission] Resultado do teste de compatibilidade:', testResult);
    
    // Log específico para rota de senha
    if (req.originalUrl.includes('/password')) {
      console.log('🔐 [PASSWORD MIDDLEWARE] Rota de senha detectada');
      console.log('🔐 [PASSWORD MIDDLEWARE] Permissões do usuário:', perms);
      console.log('🔐 [PASSWORD MIDDLEWARE] Permissão necessária:', permission);
      console.log('🔐 [PASSWORD MIDDLEWARE] Usuário do token:', req.user);
    }
    
    if (!testResult) {
      console.log('[requirePermission] ❌ Acesso negado - permissão não encontrada');
      console.log('[requirePermission] Permissões disponíveis:', perms);
      console.log('[requirePermission] Permissão necessária:', permission);
      
      // Log específico para rota de senha
      if (req.originalUrl.includes('/password')) {
        console.log('🔐 [PASSWORD MIDDLEWARE] ❌ Acesso negado para alteração de senha');
        console.log('🔐 [PASSWORD MIDDLEWARE] Verificando mapeamento de permissões...');
        
        // Verificar mapeamento específico
        const frontendMap: Record<string, string> = {
          'usuarios:create': 'create:user',
          'usuarios:edit': 'update:user',
          'usuarios:delete': 'delete:user',
          'usuarios:update': 'update:user'
        };
        
        for (const [frontend, backend] of Object.entries(frontendMap)) {
          if (perms.includes(frontend)) {
            console.log(`🔐 [PASSWORD MIDDLEWARE] ✅ Encontrada permissão frontend: ${frontend} -> ${backend}`);
          }
        }
        
        if (perms.includes('update:user')) {
          console.log('🔐 [PASSWORD MIDDLEWARE] ✅ Permissão update:user encontrada diretamente');
        }
      }
      
      sendResponse.forbidden(res, 'Acesso negado');
      return;
    }

    console.log('[requirePermission] ✅ Permissão concedida');
    
    // Log específico para rota de senha
    if (req.originalUrl.includes('/password')) {
      console.log('🔐 [PASSWORD MIDDLEWARE] ✅ Permissão concedida para alteração de senha');
    }
    
    next();
  };
}; 