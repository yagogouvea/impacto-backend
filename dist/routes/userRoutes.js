"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../infrastructure/middleware/auth.middleware");
const user_controller_1 = require("../controllers/user.controller");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
const controller = new user_controller_1.UserController();
// Protege todas as rotas abaixo com autenticação
router.use(auth_middleware_1.authenticateToken);
// Rotas que requerem autenticação
router.get('/me', controller.getCurrentUser);
router.put('/me', controller.updateCurrentUser);
router.put('/me/password', controller.updatePassword);
// Rotas administrativas
router.get('/', (0, auth_middleware_1.requirePermission)('access:usuarios'), controller.list);
router.post('/', (0, auth_middleware_1.requirePermission)('create:user'), controller.create);
router.get('/:id', (0, auth_middleware_1.requirePermission)('access:usuarios'), controller.getById);
router.put('/:id', (0, auth_middleware_1.requirePermission)('update:user'), controller.update);
router.patch('/:id/password', (req, res, next) => {
    console.log('🔐 [PASSWORD ROUTE] Iniciando verificação de permissão para alteração de senha');
    console.log('🔐 [PASSWORD ROUTE] User ID:', req.params.id);
    console.log('🔐 [PASSWORD ROUTE] User from token:', req.user);
    (0, auth_middleware_1.requirePermission)('update:user')(req, res, next);
}, userController_1.updateUserPassword);
router.delete('/:id', (0, auth_middleware_1.requirePermission)('delete:user'), controller.delete);
exports.default = router;
