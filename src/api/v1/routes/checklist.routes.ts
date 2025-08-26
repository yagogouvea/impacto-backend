import { Router } from 'express';
import { CheckListController } from '../controllers/checklist.controller';
import { authenticateToken } from '../../../infrastructure/middleware/auth.middleware';

const router = Router();
const checkListController = new CheckListController();

// Aplicar middleware de autenticação em todas as rotas
router.use(authenticateToken);

// Rotas do checklist
router.get('/ocorrencia/:ocorrenciaId', checkListController.findByOcorrenciaId.bind(checkListController));
router.post('/', checkListController.create.bind(checkListController));
router.put('/:id', checkListController.update.bind(checkListController));
router.delete('/:id', checkListController.delete.bind(checkListController));

export { router as checkListRoutes };
