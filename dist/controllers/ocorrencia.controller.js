"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcorrenciaController = void 0;
const ocorrencia_service_1 = require("../core/services/ocorrencia.service");
const AppError_1 = require("../shared/errors/AppError");
class OcorrenciaController {
    constructor() {
        this.service = new ocorrencia_service_1.OcorrenciaService();
    }
    async list(req, res) {
        try {
            console.log('[OcorrenciaController] Iniciando listagem de ocorrências');
            console.log('[OcorrenciaController] Query params:', req.query);
            console.log('[OcorrenciaController] User:', req.user);
            const { id, status, placa, cliente, prestador, data_inicio, data_fim } = req.query;
            // Validar parâmetros de entrada
            if (id && isNaN(Number(id))) {
                console.error('[OcorrenciaController] ID inválido:', id);
                return res.status(400).json({
                    error: 'Parâmetro inválido',
                    message: 'ID deve ser um número válido'
                });
            }
            // Validar datas se fornecidas
            if (data_inicio && isNaN(Date.parse(data_inicio))) {
                console.error('[OcorrenciaController] Data de início inválida:', data_inicio);
                return res.status(400).json({
                    error: 'Parâmetro inválido',
                    message: 'Data de início deve ser uma data válida'
                });
            }
            if (data_fim && isNaN(Date.parse(data_fim))) {
                console.error('[OcorrenciaController] Data de fim inválida:', data_fim);
                return res.status(400).json({
                    error: 'Parâmetro inválido',
                    message: 'Data de fim deve ser uma data válida'
                });
            }
            const filters = {
                id: id ? Number(id) : undefined,
                status: status,
                placa: placa,
                cliente: cliente,
                prestador: prestador,
                data_inicio: data_inicio ? new Date(data_inicio) : undefined,
                data_fim: data_fim ? new Date(data_fim) : undefined
            };
            console.log('[OcorrenciaController] Filtros aplicados:', filters);
            const ocorrencias = await this.service.list(filters);
            console.log('[OcorrenciaController] Ocorrências encontradas:', ocorrencias.length);
            return res.json(ocorrencias);
        }
        catch (error) {
            console.error('[OcorrenciaController] Erro ao listar ocorrências:', {
                error,
                message: error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Erro desconhecido',
                stack: error instanceof Error ? error instanceof Error ? error.stack : undefined : undefined,
                name: error instanceof Error ? error instanceof Error ? error.name : undefined : undefined
            });
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({
                    error: error instanceof Error ? error.message : String(error),
                    code: error === null || error === void 0 ? void 0 : error.code,
                    details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.stack : undefined : undefined
                });
            }
            return res.status(500).json({
                error: 'Erro interno do servidor',
                details: process.env.NODE_ENV === 'development' ? String(error) : undefined,
                message: error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Erro desconhecido'
            });
        }
    }
    async create(req, res) {
        try {
            console.log('🔍 Controller - Dados recebidos:', req.body);
            const operador = req.body.operador;
            const ocorrencia = await this.service.create(req.body);
            return res.status(201).json(ocorrencia);
        }
        catch (error) {
            console.error('❌ Erro no controller de ocorrência:', error);
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
            }
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async findById(req, res) {
        try {
            const { id } = req.params;
            const ocorrencia = await this.service.findById(Number(id));
            return res.json(ocorrencia);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
            }
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async update(req, res) {
        try {
            console.log('[OcorrenciaController] Iniciando atualização de ocorrência');
            console.log('[OcorrenciaController] ID:', req.params.id);
            console.log('[OcorrenciaController] Body recebido:', JSON.stringify(req.body, null, 2));
            console.log('[OcorrenciaController] Headers:', req.headers);
            console.log('[OcorrenciaController] Content-Type:', req.headers['content-type']);
            console.log('[OcorrenciaController] User:', req.user);
            const { id } = req.params;
            const operador = req.body.operador;
            // Para atualizações parciais (como horários), não exigir campos obrigatórios
            // Apenas validar se a ocorrência existe
            const existingOcorrencia = await this.service.findById(Number(id));
            if (!existingOcorrencia) {
                return res.status(404).json({
                    error: 'Ocorrência não encontrada'
                });
            }
            const ocorrencia = await this.service.update(Number(id), req.body);
            console.log('[OcorrenciaController] Ocorrência atualizada com sucesso:', ocorrencia.id);
            return res.json(ocorrencia);
        }
        catch (error) {
            console.error('[OcorrenciaController] Erro ao atualizar ocorrência:', {
                error,
                message: error instanceof Error ? error instanceof Error ? error.message : String(error) : 'Erro desconhecido',
                stack: error instanceof Error ? error instanceof Error ? error.stack : undefined : undefined,
                name: error instanceof Error ? error instanceof Error ? error.name : undefined : undefined
            });
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
            }
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            await this.service.delete(Number(id));
            return res.status(204).send();
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
            }
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    // TODO: Métodos não implementados no service atual
    async findByStatus(req, res) {
        res.status(501).json({
            error: 'Método não implementado',
            message: 'findByStatus não existe no OcorrenciaService atual'
        });
    }
    async findByPlaca(req, res) {
        res.status(501).json({
            error: 'Método não implementado',
            message: 'findByPlaca não existe no OcorrenciaService atual'
        });
    }
    async addFotos(req, res) {
        res.status(501).json({
            error: 'Método não implementado',
            message: 'addFotos não existe no OcorrenciaService atual'
        });
    }
    async findResultado(req, res) {
        try {
            const { id } = req.params;
            const ocorrencia = await this.service.findById(Number(id));
            if (!ocorrencia) {
                return res.status(404).json({ error: 'Ocorrência não encontrada' });
            }
            return res.json({
                resultado: ocorrencia.resultado,
                status: ocorrencia.status
            });
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
            }
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}
exports.OcorrenciaController = OcorrenciaController;
