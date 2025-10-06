"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserPassword = exports.updateUser = exports.createUser = exports.getUser = exports.getUsers = void 0;
const prisma_1 = require("../lib/prisma");
const bcrypt_1 = __importDefault(require("bcrypt"));
const zod_1 = require("zod");
// Schema para validação de usuário
const userSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
    role: zod_1.z.enum(['admin', 'manager', 'operator', 'client', 'usuario']),
    permissions: zod_1.z.array(zod_1.z.string()).or(zod_1.z.string()),
    active: zod_1.z.boolean().default(true)
});
// Schema para validação de atualização de usuário
const userUpdateSchema = userSchema.partial().omit({ password: true });
// Schema para validação de senha
const passwordUpdateSchema = zod_1.z.object({
    password: zod_1.z.string().min(6),
    confirmPassword: zod_1.z.string().min(6)
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"]
});
// GET /api/users
const getUsers = async (_req, res) => {
    try {
        const db = await (0, prisma_1.ensurePrisma)();
        const users = await db.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                permissions: true,
                active: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.json(users);
    }
    catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
};
exports.getUsers = getUsers;
// Buscar usuário específico
const getUser = async (req, res) => {
    const { id } = req.params;
    try {
        const db = await (0, prisma_1.ensurePrisma)();
        const user = await db.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                permissions: true,
                active: true,
                createdAt: true,
                updatedAt: true
            }
        });
        if (!user) {
            res.status(404).json({ error: 'Usuário não encontrado' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        console.error('Erro ao buscar usuário:', error);
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
};
exports.getUser = getUser;
// POST /api/users
const createUser = async (req, res) => {
    try {
        console.log('[createUser] Iniciando criação de usuário...');
        console.log('[createUser] Request body:', req.body);
        const data = userSchema.parse(req.body);
        console.log('[createUser] Dados validados:', data);
        const db = await (0, prisma_1.ensurePrisma)();
        console.log('[createUser] Prisma conectado');
        // Verificar se o email já existe
        const existingUser = await db.user.findUnique({
            where: { email: data.email }
        });
        if (existingUser) {
            res.status(400).json({ error: 'Email já cadastrado' });
            return;
        }
        // Garantir que permissions seja uma string JSON válida
        let permissionsString;
        if (Array.isArray(data.permissions)) {
            permissionsString = JSON.stringify(data.permissions);
        }
        else if (typeof data.permissions === 'string') {
            // Verificar se já é um JSON válido
            try {
                JSON.parse(data.permissions);
                permissionsString = data.permissions;
            }
            catch (_a) {
                // Se não for JSON válido, converter para array e depois para JSON
                permissionsString = JSON.stringify([data.permissions]);
            }
        }
        else {
            permissionsString = '[]';
        }
        const user = await db.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash: await bcrypt_1.default.hash(data.password, 10),
                role: data.role,
                permissions: permissionsString,
                active: data.active
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                permissions: true,
                active: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.status(201).json(user);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: 'Dados inválidos', details: error.errors });
            return;
        }
        console.error('Erro ao criar usuário:', error);
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
};
exports.createUser = createUser;
// PUT /api/users/:id
const updateUser = async (req, res) => {
    const { id } = req.params;
    try {
        const data = userUpdateSchema.parse(req.body);
        const db = await (0, prisma_1.ensurePrisma)();
        // Se email foi fornecido, verificar se já existe
        if (data.email) {
            const existingUser = await db.user.findFirst({
                where: {
                    email: data.email,
                    NOT: { id }
                }
            });
            if (existingUser) {
                res.status(400).json({ error: 'Email já cadastrado por outro usuário' });
                return;
            }
        }
        // Buscar usuário atual para manter as permissões existentes
        const currentUser = await db.user.findUnique({
            where: { id },
            select: { permissions: true }
        });
        if (!currentUser) {
            res.status(404).json({ error: 'Usuário não encontrado' });
            return;
        }
        // Determinar as novas permissões
        const newPermissions = Array.isArray(data.permissions) ?
            data.permissions :
            JSON.parse(data.permissions);
        // Preparar campos obrigatórios para atualização
        const requiredFields = {
            permissions: JSON.stringify(newPermissions)
        };
        // Preparar campos opcionais para atualização
        const optionalFields = {};
        if (data.name)
            optionalFields.name = data.name;
        if (data.email)
            optionalFields.email = data.email;
        if (data.role)
            optionalFields.role = data.role;
        if (typeof data.active === 'boolean')
            optionalFields.active = data.active;
        // Atualizar usuário
        const updatedUser = await db.user.update({
            where: { id },
            data: Object.assign(Object.assign(Object.assign({}, optionalFields), requiredFields), { updatedAt: new Date() }),
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                permissions: true,
                active: true,
                createdAt: true,
                updatedAt: true
            }
        });
        res.json(updatedUser);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            res.status(400).json({ error: 'Dados inválidos', details: error.errors });
            return;
        }
        console.error('Erro ao atualizar usuário:', error);
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
};
exports.updateUser = updateUser;
// PATCH /api/users/:id/password
const updateUserPassword = async (req, res) => {
    const { id } = req.params;
    console.log('🔐 [UPDATE PASSWORD] Iniciando alteração de senha para usuário:', id);
    console.log('🔐 [UPDATE PASSWORD] Request body:', req.body);
    console.log('🔐 [UPDATE PASSWORD] User from token:', req.user);
    try {
        const data = passwordUpdateSchema.parse(req.body);
        console.log('🔐 [UPDATE PASSWORD] Dados validados:', data);
        const db = await (0, prisma_1.ensurePrisma)();
        console.log('🔐 [UPDATE PASSWORD] Conexão com banco estabelecida');
        const hashedPassword = await bcrypt_1.default.hash(data.password, 10);
        console.log('🔐 [UPDATE PASSWORD] Senha hash gerada');
        const updatedUser = await db.user.update({
            where: { id },
            data: {
                passwordHash: hashedPassword,
                updatedAt: new Date()
            }
        });
        console.log('🔐 [UPDATE PASSWORD] Usuário atualizado com sucesso:', updatedUser.id);
        res.json({ message: 'Senha atualizada com sucesso' });
    }
    catch (error) {
        console.error('🔐 [UPDATE PASSWORD] Erro capturado:', error);
        if (error instanceof zod_1.z.ZodError) {
            console.error('🔐 [UPDATE PASSWORD] Erro de validação:', error.errors);
            res.status(400).json({ error: 'Dados inválidos', details: error.errors });
            return;
        }
        console.error('🔐 [UPDATE PASSWORD] Erro ao atualizar senha:', error);
        res.status(500).json({ error: 'Erro ao atualizar senha' });
    }
};
exports.updateUserPassword = updateUserPassword;
// DELETE /api/users/:id
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const db = await (0, prisma_1.ensurePrisma)();
        await db.user.delete({
            where: { id }
        });
        res.json({ message: 'Usuário excluído com sucesso' });
    }
    catch (error) {
        console.error('Erro ao excluir usuário:', error);
        res.status(500).json({ error: 'Erro ao excluir usuário' });
    }
};
exports.deleteUser = deleteUser;
