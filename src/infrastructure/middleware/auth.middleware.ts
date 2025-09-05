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

    // Compatibilidade com permissões legadas (ex.: create:user -> usuarios:create)
    const hasPermissionCompat = (needed: Permission): boolean => {
      if (perms.includes(needed)) return true;
      if (needed === 'access:usuarios') {
        if (perms.includes('read:user')) return true;
      }
      if (needed.startsWith('usuarios:')) {
        const op = needed.split(':')[1];
        const legacyMap: Record<string, Permission> = {
          create: 'create:user' as Permission,
          edit: 'update:user' as Permission,
          delete: 'delete:user' as Permission
        };
        const legacy = legacyMap[op];
        if (legacy && perms.includes(legacy)) return true;
      }
      return false;
    };
    
    // LOG DETALHADO DO ARRAY DE PERMISSÕES
    console.log('[requirePermission] Permissões do usuário (array):', perms);
    console.log('[requirePermission] Permissão necessária:', permission);
    
    if (!hasPermissionCompat(permission)) {
      console.log('[requirePermission] Acesso negado - permissão não encontrada');
      sendResponse.forbidden(res, 'Acesso negado');
      return;
    }

    console.log('[requirePermission] Permissão concedida');
    next();
  };
}; 