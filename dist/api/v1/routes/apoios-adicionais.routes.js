"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../../../lib/prisma");
const apoiosAdicionaisRouter = (0, express_1.Router)();
// ✅ GET - Listar apoios adicionais de uma ocorrência
apoiosAdicionaisRouter.get('/:ocorrenciaId', async (req, res) => {
    try {
        const { ocorrenciaId } = req.params;
        const db = await (0, prisma_1.ensurePrisma)();
        if (!db) {
            return res.status(500).json({
                error: 'Erro de conexão com o banco de dados'
            });
        }
        const apoios = await db.apoioAdicional.findMany({
            where: { ocorrencia_id: Number(ocorrenciaId) },
            include: {
                prestador: {
                    select: {
                        id: true,
                        nome: true,
                        cod_nome: true,
                        telefone: true
                    }
                }
            },
            orderBy: { ordem: 'asc' }
        });
        console.log(`✅ Apoios adicionais carregados para ocorrência ${ocorrenciaId}: ${apoios.length}`);
        res.json(apoios);
    }
    catch (error) {
        console.error('❌ Erro ao listar apoios adicionais:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
// ✅ POST - Criar novo apoio adicional
apoiosAdicionaisRouter.post('/', async (req, res) => {
    try {
        const { ocorrencia_id, nome_prestador, is_prestador_cadastrado, prestador_id, telefone, hora_inicial, hora_inicial_local, hora_final, km_inicial, km_final, franquia_km, observacoes, ordem } = req.body;
        // Validação dos campos obrigatórios
        if (!ocorrencia_id) {
            return res.status(400).json({
                error: 'ID da ocorrência é obrigatório'
            });
        }
        if (!nome_prestador || !nome_prestador.trim()) {
            return res.status(400).json({
                error: 'Nome do prestador é obrigatório'
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
        // Verificar se o prestador existe (se for prestador cadastrado)
        if (is_prestador_cadastrado && prestador_id) {
            const prestador = await db.prestador.findUnique({
                where: { id: Number(prestador_id) }
            });
            if (!prestador) {
                return res.status(404).json({
                    error: 'Prestador não encontrado'
                });
            }
        }
        // Criar apoio adicional
        const apoioAdicional = await db.apoioAdicional.create({
            data: {
                ocorrencia_id: Number(ocorrencia_id),
                nome_prestador: nome_prestador.trim(),
                is_prestador_cadastrado: Boolean(is_prestador_cadastrado),
                prestador_id: prestador_id ? Number(prestador_id) : null,
                telefone: telefone ? telefone.trim() : null,
                hora_inicial: hora_inicial ? new Date(hora_inicial) : null,
                hora_inicial_local: hora_inicial_local ? new Date(hora_inicial_local) : null,
                hora_final: hora_final ? new Date(hora_final) : null,
                km_inicial: km_inicial !== undefined ? Number(km_inicial) : null,
                km_final: km_final !== undefined ? Number(km_final) : null,
                franquia_km: Boolean(franquia_km),
                observacoes: observacoes ? observacoes.trim() : null,
                ordem: Number(ordem)
            }
        });
        console.log(`✅ Apoio adicional criado: ${apoioAdicional.nome_prestador} para ocorrência ${ocorrencia_id}`);
        res.status(201).json({
            message: 'Apoio adicional criado com sucesso',
            apoio: apoioAdicional
        });
    }
    catch (error) {
        console.error('❌ Erro ao criar apoio adicional:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
// ✅ PUT - Atualizar apoio adicional
apoiosAdicionaisRouter.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome_prestador, is_prestador_cadastrado, prestador_id, telefone, hora_inicial, hora_inicial_local, hora_final, km_inicial, km_final, franquia_km, observacoes, ordem } = req.body;
        const db = await (0, prisma_1.ensurePrisma)();
        if (!db) {
            return res.status(500).json({
                error: 'Erro de conexão com o banco de dados'
            });
        }
        // Verificar se o apoio existe
        const apoioExistente = await db.apoioAdicional.findUnique({
            where: { id: Number(id) }
        });
        if (!apoioExistente) {
            return res.status(404).json({
                error: 'Apoio adicional não encontrado'
            });
        }
        // Verificar se o prestador existe (se for prestador cadastrado)
        if (is_prestador_cadastrado && prestador_id) {
            const prestador = await db.prestador.findUnique({
                where: { id: Number(prestador_id) }
            });
            if (!prestador) {
                return res.status(404).json({
                    error: 'Prestador não encontrado'
                });
            }
        }
        // Atualizar apoio adicional
        const apoioAtualizado = await db.apoioAdicional.update({
            where: { id: Number(id) },
            data: {
                nome_prestador: nome_prestador ? nome_prestador.trim() : undefined,
                is_prestador_cadastrado: is_prestador_cadastrado !== undefined ? Boolean(is_prestador_cadastrado) : undefined,
                prestador_id: prestador_id !== undefined ? (prestador_id ? Number(prestador_id) : null) : undefined,
                telefone: telefone !== undefined ? (telefone ? telefone.trim() : null) : undefined,
                hora_inicial: hora_inicial !== undefined ? (hora_inicial ? new Date(hora_inicial) : null) : undefined,
                hora_inicial_local: hora_inicial_local !== undefined ? (hora_inicial_local ? new Date(hora_inicial_local) : null) : undefined,
                hora_final: hora_final !== undefined ? (hora_final ? new Date(hora_final) : null) : undefined,
                km_inicial: km_inicial !== undefined ? (km_inicial !== null ? Number(km_inicial) : null) : undefined,
                km_final: km_final !== undefined ? (km_final !== null ? Number(km_final) : null) : undefined,
                franquia_km: franquia_km !== undefined ? Boolean(franquia_km) : undefined,
                observacoes: observacoes !== undefined ? (observacoes ? observacoes.trim() : null) : undefined,
                ordem: ordem !== undefined ? Number(ordem) : undefined
            }
        });
        console.log(`✅ Apoio adicional atualizado: ${apoioAtualizado.nome_prestador}`);
        res.json({
            message: 'Apoio adicional atualizado com sucesso',
            apoio: apoioAtualizado
        });
    }
    catch (error) {
        console.error('❌ Erro ao atualizar apoio adicional:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
// ✅ DELETE - Excluir apoio adicional
apoiosAdicionaisRouter.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await (0, prisma_1.ensurePrisma)();
        if (!db) {
            return res.status(500).json({
                error: 'Erro de conexão com o banco de dados'
            });
        }
        // Verificar se o apoio existe
        const apoioExistente = await db.apoioAdicional.findUnique({
            where: { id: Number(id) }
        });
        if (!apoioExistente) {
            return res.status(404).json({
                error: 'Apoio adicional não encontrado'
            });
        }
        // Excluir apoio adicional
        await db.apoioAdicional.delete({
            where: { id: Number(id) }
        });
        console.log(`✅ Apoio adicional excluído: ${apoioExistente.nome_prestador}`);
        res.json({
            message: 'Apoio adicional excluído com sucesso'
        });
    }
    catch (error) {
        console.error('❌ Erro ao excluir apoio adicional:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
});
exports.default = apoiosAdicionaisRouter;
