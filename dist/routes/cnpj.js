"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const auth_middleware_1 = require("../infrastructure/middleware/auth.middleware");
const router = express_1.default.Router();
// Aplicar middleware de autenticação
router.use(auth_middleware_1.authenticateToken);
router.get('/:cnpj', async (req, res) => {
    var _a, _b, _c;
    const { cnpj } = req.params;
    // Limpar CNPJ (remover caracteres não numéricos)
    const cnpjLimpo = cnpj.replace(/\D/g, '');
    // Validar formato do CNPJ
    if (cnpjLimpo.length !== 14) {
        return res.status(400).json({ error: 'CNPJ inválido. Deve conter 14 dígitos.' });
    }
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cnpjLimpo)) {
        return res.status(400).json({ error: 'CNPJ inválido.' });
    }
    try {
        console.log('🔍 [Costa] Consultando CNPJ:', cnpjLimpo);
        // Usar BrasilAPI como principal (mais confiável e gratuita)
        const response = await axios_1.default.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Costa-Segtrack/1.0'
            }
        });
        const dados = response.data;
        console.log('✅ [Costa] Dados recebidos da BrasilAPI:', dados);
        if (!(dados === null || dados === void 0 ? void 0 : dados.razao_social)) {
            console.log('⚠️ [Costa] CNPJ não encontrado na BrasilAPI');
            return res.status(404).json({ error: 'CNPJ não encontrado' });
        }
        // Formatar endereço completo
        const enderecoCompleto = [
            dados.logradouro,
            dados.numero,
            dados.complemento
        ].filter(Boolean).join(', ');
        // Formatar telefone
        const telefone = dados.ddd_telefone_1 && dados.telefone_1
            ? `(${dados.ddd_telefone_1}) ${dados.telefone_1}`
            : undefined;
        // Formatar resposta conforme interface CNPJResponse
        const formattedResponse = {
            company: {
                name: dados.razao_social || '',
                fantasy_name: dados.nome_fantasia || '',
                legal_nature: dados.natureza_juridica || '',
                cnae_main: dados.cnae_principal || '',
                situation: dados.descricao_situacao_cadastral || '',
                registration_date: dados.data_inicio_atividade || ''
            },
            address: {
                street: enderecoCompleto || dados.logradouro || '',
                number: dados.numero || '',
                complement: dados.complemento || '',
                district: dados.bairro || '',
                city: dados.municipio || '',
                state: dados.uf || '',
                zip: dados.cep || ''
            },
            contact: {
                phone: telefone,
                email: dados.email || ''
            }
        };
        // Log para debug
        console.log('📋 [Costa] Resposta formatada:', JSON.stringify(formattedResponse, null, 2));
        return res.json(formattedResponse);
    }
    catch (err) {
        console.error('❌ [Costa] Erro ao consultar CNPJ:', {
            cnpj: cnpjLimpo,
            error: ((_a = err.response) === null || _a === void 0 ? void 0 : _a.data) || err.message,
            status: (_b = err.response) === null || _b === void 0 ? void 0 : _b.status
        });
        if (((_c = err.response) === null || _c === void 0 ? void 0 : _c.status) === 404) {
            return res.status(404).json({ error: 'CNPJ não encontrado' });
        }
        return res.status(500).json({
            error: 'Erro interno ao consultar CNPJ',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});
exports.default = router;
