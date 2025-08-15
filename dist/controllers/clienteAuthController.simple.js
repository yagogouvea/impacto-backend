"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.obterPerfilCliente = exports.alterarSenhaCliente = exports.cadastrarClienteAuth = exports.loginClienteAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
// TODO: Controller simplificado para autenticação de clientes
// O modelo ClienteAuth não existe no schema atual, então implementamos uma versão básica
const loginClienteAuth = async (req, res) => {
    try {
        const { cnpj, senha } = req.body;
        if (!cnpj || !senha) {
            res.status(400).json({ message: 'CNPJ e senha são obrigatórios' });
            return;
        }
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET não está definido no ambiente');
            res.status(500).json({ message: 'Erro de configuração do servidor' });
            return;
        }
        // Normalizar CNPJ (remover pontos, traços e barras)
        const cnpjNormalizado = cnpj.replace(/[.\-\/]/g, '');
        console.log('Tentativa de login de cliente (auth) para CNPJ:', cnpjNormalizado);
        const db = await (0, prisma_1.ensurePrisma)();
        // Buscar cliente pelo CNPJ
        const cliente = await db.cliente.findFirst({
            where: { cnpj: cnpjNormalizado },
            select: {
                id: true,
                nome: true,
                cnpj: true,
                email: true,
                telefone: true,
                endereco: true
            }
        });
        if (!cliente) {
            res.status(401).json({ message: 'Cliente não encontrado' });
            return;
        }
        // Por enquanto, usar CNPJ como senha (versão simplificada)
        if (senha !== cnpjNormalizado) {
            res.status(401).json({ message: 'CNPJ ou senha incorretos' });
            return;
        }
        // Gerar token JWT para cliente
        const token = jsonwebtoken_1.default.sign({
            sub: cliente.id.toString(),
            razaoSocial: cliente.nome,
            cnpj: cliente.cnpj,
            tipo: 'cliente'
        }, process.env.JWT_SECRET, { expiresIn: '7d' });
        console.log('Token de cliente gerado com sucesso');
        res.json({
            token,
            cliente: {
                id: cliente.id,
                razaoSocial: cliente.nome,
                cnpj: cliente.cnpj,
                email: cliente.email,
                telefone: cliente.telefone
            }
        });
    }
    catch (error) {
        console.error('Erro no login de cliente:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
exports.loginClienteAuth = loginClienteAuth;
const cadastrarClienteAuth = async (req, res) => {
    res.status(501).json({
        message: 'Cadastro de cliente não implementado',
        details: 'Modelo ClienteAuth não existe no schema atual. Use a rota de cadastro principal.'
    });
};
exports.cadastrarClienteAuth = cadastrarClienteAuth;
const alterarSenhaCliente = async (req, res) => {
    res.status(501).json({
        message: 'Alteração de senha não implementada',
        details: 'Modelo ClienteAuth não existe no schema atual'
    });
};
exports.alterarSenhaCliente = alterarSenhaCliente;
const obterPerfilCliente = async (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: 'Usuário não autenticado' });
            return;
        }
        const db = await (0, prisma_1.ensurePrisma)();
        const clienteId = parseInt(req.user.sub || req.user.id || '0');
        const cliente = await db.cliente.findUnique({
            where: { id: clienteId },
            select: {
                id: true,
                nome: true,
                cnpj: true,
                email: true,
                telefone: true,
                endereco: true
            }
        });
        if (!cliente) {
            res.status(404).json({ message: 'Cliente não encontrado' });
            return;
        }
        res.json({
            cliente: {
                id: cliente.id,
                razaoSocial: cliente.nome,
                cnpj: cliente.cnpj,
                email: cliente.email,
                telefone: cliente.telefone,
                endereco: cliente.endereco
            }
        });
    }
    catch (error) {
        console.error('Erro ao obter perfil do cliente:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
exports.obterPerfilCliente = obterPerfilCliente;
