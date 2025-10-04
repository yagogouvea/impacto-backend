"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("@/infrastructure/middleware/auth.middleware");
const prestador_controller_1 = require("../../../controllers/prestador.controller");
const prisma_1 = require("../../../lib/prisma");
const prestadores_routes_1 = __importDefault(require("./prestadores.routes"));
const clientes_routes_1 = __importDefault(require("./clientes.routes"));
const veiculos_routes_1 = __importDefault(require("./veiculos.routes"));
const fotos_routes_1 = __importDefault(require("./fotos.routes"));
const relatorios_routes_1 = __importDefault(require("./relatorios.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const monitoramento_routes_1 = __importDefault(require("./monitoramento.routes"));
const ocorrencias_routes_1 = __importDefault(require("./ocorrencias.routes"));
const checklist_routes_1 = require("./checklist.routes");
const apoios_adicionais_routes_1 = __importDefault(require("./apoios-adicionais.routes"));
const financeiro_routes_1 = require("./financeiro.routes");
const v1Router = (0, express_1.Router)();
const prestadorController = new prestador_controller_1.PrestadorController();
// Rotas públicas (sem autenticação)
v1Router.use('/prestadores', prestadores_routes_1.default); // Rotas públicas e protegidas estão no próprio router
v1Router.use('/ocorrencias', ocorrencias_routes_1.default); // Rotas públicas e protegidas estão no próprio router
v1Router.use('/apoios-adicionais', apoios_adicionais_routes_1.default); // Rotas para apoios adicionais
// ✅ ROTA - Criar prestador não cadastrado - PÚBLICA
v1Router.post('/prestadores-nao-cadastrados', async (req, res) => {
    try {
        const { nome, telefone, ocorrencia_id } = req.body;
        // Validação dos campos obrigatórios
        if (!nome || !nome.trim()) {
            return res.status(400).json({
                error: 'Nome do prestador é obrigatório'
            });
        }
        if (!ocorrencia_id) {
            return res.status(400).json({
                error: 'ID da ocorrência é obrigatório'
            });
        }
        const db = await (0, prisma_1.ensurePrisma)();
        if (!db) {
            return res.status(500).json({
                error: 'Erro de conexão com o banco de dados'
            });
        }
        // Verificar se a ocorrência existe
        const ocorrencia = await db.ocorrencia.findUnique({
            where: { id: Number(ocorrencia_id) }
        });
        if (!ocorrencia) {
            return res.status(404).json({
                error: 'Ocorrência não encontrada'
            });
        }
        // SOLUÇÃO TEMPORÁRIA: Atualizar o campo 'prestador' na ocorrência
        const ocorrenciaAtualizada = await db.ocorrencia.update({
            where: { id: Number(ocorrencia_id) },
            data: {
                prestador: nome.trim()
            }
        });
        console.log(`✅ Prestador não cadastrado adicionado à ocorrência ${ocorrencia_id}: ${nome.trim()}`);
        res.status(201).json({
            message: 'Prestador não cadastrado adicionado com sucesso',
            prestador: {
                nome: nome.trim(),
                telefone: telefone ? telefone.trim() : null,
                ocorrencia_id: Number(ocorrencia_id)
            },
            ocorrencia: {
                id: ocorrenciaAtualizada.id,
                prestador: ocorrenciaAtualizada.prestador
            }
        });
    }
    catch (error) {
        console.error('❌ Erro ao criar prestador não cadastrado:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
// Rotas protegidas (com autenticação)
v1Router.use('/clientes', auth_middleware_1.authenticateToken, clientes_routes_1.default);
v1Router.use('/veiculos', auth_middleware_1.authenticateToken, veiculos_routes_1.default);
// v1Router.use('/fotos', authenticateToken, fotosRouter); // TEMPORARIAMENTE COMENTADO PARA TESTE
v1Router.use('/fotos', fotos_routes_1.default); // SEM AUTENTICAÇÃO TEMPORARIAMENTE
v1Router.use('/relatorios', auth_middleware_1.authenticateToken, relatorios_routes_1.default);
v1Router.use('/users', auth_middleware_1.authenticateToken, user_routes_1.default);
v1Router.use('/monitoramento', auth_middleware_1.authenticateToken, monitoramento_routes_1.default);
v1Router.use('/checklist', checklist_routes_1.checkListRoutes);
v1Router.use('/financeiro', financeiro_routes_1.financeiroRoutes);
exports.default = v1Router;
