"use strict";
// TODO: Implementar modelo CheckList no schema.prisma
// Este arquivo está temporariamente comentado para evitar erros de build
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckListController = void 0;
const checklist_service_1 = require("../../../core/services/checklist.service");
class CheckListController {
    constructor() {
        this.service = new checklist_service_1.CheckListService();
    }
    // Métodos temporários que retornam erro
    async getByOcorrenciaId(req, res) {
        res.status(501).json({
            error: 'Funcionalidade temporariamente indisponível - modelo CheckList não implementado'
        });
    }
    async create(req, res) {
        res.status(501).json({
            error: 'Funcionalidade temporariamente indisponível - modelo CheckList não implementado'
        });
    }
    async update(req, res) {
        res.status(501).json({
            error: 'Funcionalidade temporariamente indisponível - modelo CheckList não implementado'
        });
    }
    async delete(req, res) {
        res.status(501).json({
            error: 'Funcionalidade temporariamente indisponível - modelo CheckList não implementado'
        });
    }
}
exports.CheckListController = CheckListController;
