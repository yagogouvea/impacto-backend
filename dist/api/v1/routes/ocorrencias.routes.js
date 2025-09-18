"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../../infrastructure/middleware/auth.middleware");
const ocorrencia_controller_1 = require("../controllers/ocorrencia.controller");
const multer_1 = __importDefault(require("multer"));
const upload_config_1 = require("../../../config/upload.config");
const prisma_1 = require("../../../lib/prisma");
const router = (0, express_1.Router)();
const controller = new ocorrencia_controller_1.OcorrenciaController();
const upload = (0, multer_1.default)(upload_config_1.uploadConfig);
// Temporarily comment out auth for debugging
// router.use(authenticateToken);
// Listagem e busca
router.get('/', controller.list);
router.get('/dashboard', async (req, res) => {
    try {
        console.log('[ocorrencias.routes] Listando ocorrências para dashboard...');
        // ✅ USAR SERVICE DIRETAMENTE para evitar problemas de binding
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        // ✅ OTIMIZAÇÃO: Incluir apenas dados essenciais e status dos popups
        const ocorrencias = await prisma.ocorrencia.findMany({
            select: {
                id: true,
                placa1: true,
                placa2: true,
                placa3: true,
                modelo1: true,
                cor1: true,
                cliente: true,
                tipo: true, // ✅ ADICIONAR CAMPO TIPO
                tipo_veiculo: true, // ✅ ADICIONAR CAMPO TIPO_VEICULO
                sub_cliente: true, // ✅ ADICIONAR CAMPO SUB_CLIENTE
                operador: true,
                prestador: true,
                status: true,
                resultado: true,
                sub_resultado: true, // ✅ ADICIONAR CAMPO SUB_RESULTADO
                data_acionamento: true,
                inicio: true,
                chegada: true,
                termino: true,
                km_inicial: true,
                km_final: true,
                criado_em: true,
                cep: true,
                descricao: true, // ✅ ADICIONAR CAMPO DESCRIÇÃO
                despesas: true, // ✅ ADICIONAR CAMPO DESPESAS
                despesas_detalhadas: true, // ✅ ADICIONAR CAMPO DESPESAS_DETALHADAS
                passagem_servico: true, // ✅ ADICIONAR CAMPO PASSAGEM_SERVICO
                endereco: true, // ✅ ADICIONAR CAMPO ENDERECO
                bairro: true, // ✅ ADICIONAR CAMPO BAIRRO
                cidade: true, // ✅ ADICIONAR CAMPO CIDADE
                estado: true, // ✅ ADICIONAR CAMPO ESTADO
                coordenadas: true, // ✅ ADICIONAR CAMPO COORDENADAS
                checklist: {
                    select: {
                        loja_selecionada: true,
                        nome_loja: true,
                        endereco_loja: true,
                        nome_atendente: true,
                        matricula_atendente: true,
                        guincho_selecionado: true,
                        tipo_guincho: true,
                        nome_empresa_guincho: true,
                        nome_motorista_guincho: true,
                        valor_guincho: true,
                        telefone_guincho: true,
                        apreensao_selecionada: true,
                        nome_dp_batalhao: true,
                        endereco_apreensao: true,
                        numero_bo_noc: true,
                        recuperado_com_chave: true,
                        posse_veiculo: true,
                        avarias: true,
                        fotos_realizadas: true,
                        observacao_ocorrencia: true
                    }
                },
                _count: {
                    select: {
                        fotos: true
                    }
                }
            },
            orderBy: {
                criado_em: 'desc'
            }
        });
        // ✅ PROCESSAR STATUS DOS POPUPS NO BACKEND (evita múltiplas requisições)
        const ocorrenciasComStatus = ocorrencias.map((ocorrencia) => {
            var _a;
            const checklist = ocorrencia.checklist;
            const temFotos = ((_a = ocorrencia._count) === null || _a === void 0 ? void 0 : _a.fotos) > 0;
            // Verificar se checklist está completo
            const checklistCompleto = checklist && ((checklist.loja_selecionada && (checklist.nome_loja ||
                checklist.endereco_loja ||
                checklist.nome_atendente ||
                checklist.matricula_atendente)) ||
                (checklist.guincho_selecionado && (checklist.tipo_guincho ||
                    checklist.nome_empresa_guincho ||
                    checklist.nome_motorista_guincho ||
                    checklist.valor_guincho ||
                    checklist.telefone_guincho)) ||
                (checklist.apreensao_selecionada && (checklist.nome_dp_batalhao ||
                    checklist.endereco_apreensao ||
                    checklist.numero_bo_noc)) ||
                checklist.recuperado_com_chave ||
                checklist.posse_veiculo ||
                checklist.avarias ||
                checklist.fotos_realizadas ||
                checklist.observacao_ocorrencia);
            return Object.assign(Object.assign({}, ocorrencia), { _count: undefined, checklistStatus: {
                    completo: checklistCompleto,
                    temFotos: temFotos
                } });
        });
        console.log(`[ocorrencias.routes] ✅ ${ocorrenciasComStatus.length} ocorrências processadas com status`);
        await prisma.$disconnect();
        return res.json(ocorrenciasComStatus);
    }
    catch (error) {
        console.error('[ocorrencias.routes] Erro ao listar ocorrências para dashboard:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
}); // ✅ NOVA ROTA OTIMIZADA
router.get('/:id', controller.findById);
// Buscar ocorrências por prestador
router.get('/prestador/:prestadorId', auth_middleware_1.authenticateToken, async (req, res) => {
    try {
        const { prestadorId } = req.params;
        console.log(`[ocorrencias.routes] Buscando ocorrências para prestador: ${prestadorId}`);
        console.log(`[ocorrencias.routes] Usuário autenticado:`, req.user);
        const db = await (0, prisma_1.ensurePrisma)();
        if (!db) {
            console.error('[ocorrencias.routes] Erro: Instância do Prisma não disponível');
            return res.status(500).json({ error: 'Erro de conexão com o banco de dados' });
        }
        // Buscar prestador primeiro para validar
        const prestador = await db.prestador.findFirst({
            where: {
                OR: [
                    { id: Number(prestadorId) },
                    { nome: prestadorId }
                ]
            }
        });
        if (!prestador) {
            console.log(`[ocorrencias.routes] Prestador não encontrado: ${prestadorId}`);
            return res.status(404).json({ error: 'Prestador não encontrado' });
        }
        console.log(`[ocorrencias.routes] Prestador encontrado: ${prestador.nome} (ID: ${prestador.id})`);
        // Buscar ocorrências vinculadas ao prestador
        const ocorrencias = await db.ocorrencia.findMany({
            where: {
                prestador: prestador.nome,
                status: {
                    in: ['em_andamento', 'aguardando']
                }
            },
            include: {
                fotos: true
            },
            orderBy: {
                criado_em: 'desc'
            }
        });
        console.log(`[ocorrencias.routes] Ocorrências encontradas: ${ocorrencias.length}`);
        res.json({
            prestador: {
                id: prestador.id,
                nome: prestador.nome,
                email: prestador.email
            },
            ocorrencias: ocorrencias,
            total: ocorrencias.length
        });
    }
    catch (error) {
        console.error('[ocorrencias.routes] Erro ao buscar ocorrências do prestador:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Criação e atualização
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
// Upload de fotos
router.post('/:id/fotos', upload.array('fotos'), controller.addFotos);
// Rotas específicas
router.get('/status/:status', controller.findByStatus);
router.get('/placa/:placa', controller.findByPlaca);
exports.default = router;
