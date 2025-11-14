"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermission = exports.authenticateCliente = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const response_1 = require("../../utils/response");
const authenticateToken = (req, res, next) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log('✅ [authenticateToken] Token válido');
        console.log('🔍 [authenticateToken] User:', decoded.nome, 'Role:', decoded.role);
        // Garantir que o id seja mapeado do sub para compatibilidade
        if (decoded.sub && !decoded.id) {
            decoded.id = decoded.sub;
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        console.error('❌ [authenticateToken] Erro na verificação do token:', error);
        res.status(403).json({ message: 'Token inválido' });
    }
};
exports.authenticateToken = authenticateToken;
// Middleware específico para autenticação de clientes
const authenticateCliente = (req, res, next) => {
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
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
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
    }
    catch (error) {
        console.error('Erro na verificação do token de cliente:', error);
        res.status(403).json({ message: 'Token inválido' });
    }
};
exports.authenticateCliente = authenticateCliente;
const requirePermission = (permission) => {
    return (req, res, next) => {
        console.log('[requirePermission] Verificando permissão:', permission);
        console.log('[requirePermission] Usuário:', req.user);
        console.log('[requirePermission] URL:', req.url);
        console.log('[requirePermission] Method:', req.method);
        if (!req.user) {
            console.log('[requirePermission] Usuário não autenticado');
            response_1.sendResponse.unauthorized(res, 'Usuário não autenticado');
            return;
        }
        // Removido bypass por cargo: autorização somente por permissões explícitas
        const perms = Array.isArray(req.user.permissions)
            ? req.user.permissions
            : typeof req.user.permissions === 'string'
                ? JSON.parse(req.user.permissions)
                : [];
        // Compatibilidade com diferentes convenções de chave
        const hasPermissionCompat = (needed) => {
            if (perms.includes(needed))
                return true;
            if (needed === 'access:usuarios') {
                if (perms.includes('read:user'))
                    return true;
            }
            // Formato recurso:acao (usuarios:create) → legado create:user
            if (needed.startsWith('usuarios:')) {
                const op = needed.split(':')[1];
                const legacyMap = {
                    create: 'create:user',
                    edit: 'update:user',
                    delete: 'delete:user'
                };
                const legacy = legacyMap[op];
                if (legacy && perms.includes(legacy))
                    return true;
            }
            // Formato acao:recurso (create:usuarios) → novo padrão usuarios:create
            if (needed.endsWith(':usuarios')) {
                const op = needed.split(':')[0];
                const modernMap = {
                    create: 'usuarios:create',
                    update: 'usuarios:edit',
                    delete: 'usuarios:delete',
                    access: 'access:usuarios'
                };
                const modern = modernMap[op];
                if (modern && perms.includes(modern))
                    return true;
            }
            // Mapeamento direto das permissões do frontend - BIDIRECIONAL
            const frontendMap = {
                'usuarios:create': 'create:user',
                'usuarios:edit': 'update:user',
                'usuarios:delete': 'delete:user',
                'usuarios:update': 'update:user'
            };
            // Mapeamento direto (frontend → backend)
            const mapped = frontendMap[needed];
            if (mapped && perms.includes(mapped))
                return true;
            // Mapeamento reverso (backend → frontend) - CORREÇÃO PRINCIPAL
            const reverseMap = {
                'create:user': 'usuarios:create',
                'update:user': 'usuarios:edit',
                'delete:user': 'usuarios:delete',
                'read:user': 'access:usuarios'
            };
            const reverseMapped = reverseMap[needed];
            if (reverseMapped && perms.includes(reverseMapped))
                return true;
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
                const frontendMap = {
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
            response_1.sendResponse.forbidden(res, 'Acesso negado');
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
exports.requirePermission = requirePermission;
