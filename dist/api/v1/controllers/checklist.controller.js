"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckListController = void 0;
const checklist_service_1 = require("../../../core/services/checklist.service");
const AppError_1 = require("../../../shared/errors/AppError");
class CheckListController {
    constructor() {
        this.service = new checklist_service_1.CheckListService();
    }
    async findByOcorrenciaId(req, res) {
        try {
            const { ocorrenciaId } = req.params;
            console.log('[CheckListController] Buscando checklist para ocorrência:', ocorrenciaId);
            const checklist = await this.service.findByOcorrenciaId(parseInt(ocorrenciaId));
            console.log('[CheckListController] Checklist encontrado:', !!checklist);
            return res.json(checklist);
        }
        catch (error) {
            console.error('[CheckListController] Erro ao buscar checklist:', error);
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
            }
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async create(req, res) {
        try {
            console.log('[CheckListController] Dados recebidos:', req.body);
            const checklist = await this.service.create(req.body);
            return res.status(201).json(checklist);
        }
        catch (error) {
            console.error('[CheckListController] Erro ao criar checklist:', error);
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
            }
            return res.status(500).json({ error: 'Erro interno do servidor', details: error instanceof Error ? error.message : String(error) });
        }
    }
    async update(req, res) {
        try {
            const { id } = req.params;
            const checklist = await this.service.update(parseInt(id), req.body);
            return res.json(checklist);
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
            }
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
    async delete(req, res) {
        try {
            const { id } = req.params;
            await this.service.delete(parseInt(id));
            return res.status(204).send();
        }
        catch (error) {
            if (error instanceof AppError_1.AppError) {
                return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
            }
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
}
exports.CheckListController = CheckListController;
