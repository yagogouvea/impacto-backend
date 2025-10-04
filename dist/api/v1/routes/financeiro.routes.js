"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.financeiroRoutes = void 0;
const express_1 = require("express");
const financeiro_controller_1 = require("../controllers/financeiro.controller");
const auth_middleware_1 = require("../../../infrastructure/middleware/auth.middleware");
const router = (0, express_1.Router)();
exports.financeiroRoutes = router;
const financeiroController = new financeiro_controller_1.FinanceiroController();
// Todas as rotas requerem autenticação
router.use(auth_middleware_1.authenticateToken);
// Endpoint para Controle Detalhado
router.get('/controle-detalhado', financeiroController.controleDetalhado.bind(financeiroController));
// Endpoint para Controle Prestadores (agrupado)
router.get('/controle-prestadores', financeiroController.controlePrestadores.bind(financeiroController));
// Endpoint para Controle Prestadores Individual (cada acionamento em uma linha)
router.get('/controle-prestadores-individual', financeiroController.controlePrestadoresIndividual.bind(financeiroController));
// Endpoint para buscar prestadores (autocomplete)
router.get('/prestadores', financeiroController.buscarPrestadores.bind(financeiroController));
