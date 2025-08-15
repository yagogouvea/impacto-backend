import { Router } from 'express';
import { loginClienteAuth, cadastrarClienteAuth, alterarSenhaCliente, obterPerfilCliente } from '../controllers/clienteAuthController.simple';
import { authenticateToken } from '../infrastructure/middleware/auth.middleware';

const router = Router();

// Rotas simplificadas para autenticação de clientes (sem modelo ClienteAuth)
router.post('/login', loginClienteAuth);
router.post('/cadastro', cadastrarClienteAuth);

// Rotas protegidas (requer autenticação)
router.put('/alterar-senha', authenticateToken, alterarSenhaCliente);
router.get('/perfil', authenticateToken, obterPerfilCliente);

export default router; 