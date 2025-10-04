import { Router } from 'express';
import { FinanceiroController } from '../controllers/financeiro.controller';
import { authenticateToken } from '../../../infrastructure/middleware/auth.middleware';

const router = Router();
const financeiroController = new FinanceiroController();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Endpoint para Controle Detalhado
router.get('/controle-detalhado', financeiroController.controleDetalhado.bind(financeiroController));

// Endpoint para Controle Prestadores (agrupado)
router.get('/controle-prestadores', financeiroController.controlePrestadores.bind(financeiroController));

// Endpoint para Controle Prestadores Individual (cada acionamento em uma linha)
router.get('/controle-prestadores-individual', financeiroController.controlePrestadoresIndividual.bind(financeiroController));

// Endpoint para buscar prestadores (autocomplete)
router.get('/prestadores', financeiroController.buscarPrestadores.bind(financeiroController));

export { router as financeiroRoutes };
