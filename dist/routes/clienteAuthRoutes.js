"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clienteAuthController_simple_1 = require("../controllers/clienteAuthController.simple");
const auth_middleware_1 = require("../infrastructure/middleware/auth.middleware");
const router = (0, express_1.Router)();
// Rotas simplificadas para autenticação de clientes (sem modelo ClienteAuth)
router.post('/login', clienteAuthController_simple_1.loginClienteAuth);
router.post('/cadastro', clienteAuthController_simple_1.cadastrarClienteAuth);
// Rotas protegidas (requer autenticação)
router.put('/alterar-senha', auth_middleware_1.authenticateToken, clienteAuthController_simple_1.alterarSenhaCliente);
router.get('/perfil', auth_middleware_1.authenticateToken, clienteAuthController_simple_1.obterPerfilCliente);
exports.default = router;
