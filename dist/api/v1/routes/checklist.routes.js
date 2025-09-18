"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkListRoutes = void 0;
const express_1 = require("express");
const checklist_controller_1 = require("../controllers/checklist.controller");
const auth_middleware_1 = require("../../../infrastructure/middleware/auth.middleware");
const router = (0, express_1.Router)();
exports.checkListRoutes = router;
const checkListController = new checklist_controller_1.CheckListController();
// Aplicar middleware de autenticação em todas as rotas
router.use(auth_middleware_1.authenticateToken);
// Rotas do checklist
router.get('/ocorrencia/:ocorrenciaId', checkListController.getByOcorrenciaId.bind(checkListController));
router.post('/', checkListController.create.bind(checkListController));
router.put('/:id', checkListController.update.bind(checkListController));
router.delete('/:id', checkListController.delete.bind(checkListController));
