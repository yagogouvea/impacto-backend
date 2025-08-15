"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClienteService = void 0;
// Função para normalizar CNPJ (remover pontos, traços e barras)
const normalizarCNPJ = (cnpj) => {
    return cnpj.replace(/[.\-\/]/g, '');
};
class ClienteService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
        try {
            console.log('🔍 [ClienteService] Listando clientes...');
            const clientes = await this.prisma.cliente.findMany({
                orderBy: { nome: 'asc' }
            });
            console.log(`✅ [ClienteService] ${clientes.length} clientes encontrados`);
            return clientes;
        }
        catch (error) {
            console.error('❌ [ClienteService] Erro ao listar clientes:', error);
            throw error;
        }
    }
    async findById(id) {
        try {
            console.log(`🔍 [ClienteService] Buscando cliente ID: ${id}`);
            const cliente = await this.prisma.cliente.findUnique({
                where: { id }
            });
            if (cliente) {
                console.log(`✅ [ClienteService] Cliente encontrado: ${cliente.nome}`);
            }
            else {
                console.log(`⚠️ [ClienteService] Cliente não encontrado: ${id}`);
            }
            return cliente;
        }
        catch (error) {
            console.error(`❌ [ClienteService] Erro ao buscar cliente ${id}:`, error);
            throw error;
        }
    }
    async create(data) {
        try {
            console.log('🔍 [ClienteService] Criando cliente:', data.nome);
            // Normalizar CNPJ antes de salvar
            const cnpjNormalizado = normalizarCNPJ(data.cnpj);
            const cliente = await this.prisma.cliente.create({
                data: {
                    nome: data.nome,
                    cnpj: cnpjNormalizado,
                    contato: data.contato,
                    telefone: data.telefone,
                    email: data.email,
                    endereco: data.endereco
                }
            });
            console.log(`✅ [ClienteService] Cliente criado: ${cliente.nome} (ID: ${cliente.id})`);
            return cliente;
        }
        catch (error) {
            console.error('❌ [ClienteService] Erro ao criar cliente:', error);
            throw error;
        }
    }
    async update(id, data) {
        try {
            console.log(`🔍 [ClienteService] Atualizando cliente ID: ${id}`);
            // Preparar dados para atualização
            const updateData = {};
            if (data.nome)
                updateData.nome = data.nome;
            if (data.contato)
                updateData.contato = data.contato;
            if (data.telefone)
                updateData.telefone = data.telefone;
            if (data.email)
                updateData.email = data.email;
            if (data.endereco)
                updateData.endereco = data.endereco;
            // Normalizar CNPJ se fornecido
            if (data.cnpj) {
                updateData.cnpj = normalizarCNPJ(data.cnpj);
            }
            const cliente = await this.prisma.cliente.update({
                where: { id },
                data: updateData
            });
            console.log(`✅ [ClienteService] Cliente atualizado: ${cliente.nome}`);
            return cliente;
        }
        catch (error) {
            console.error(`❌ [ClienteService] Erro ao atualizar cliente ${id}:`, error);
            throw error;
        }
    }
    async delete(id) {
        try {
            console.log(`🔍 [ClienteService] Deletando cliente ID: ${id}`);
            const cliente = await this.prisma.cliente.delete({
                where: { id }
            });
            console.log(`✅ [ClienteService] Cliente deletado: ${cliente.nome}`);
            return cliente;
        }
        catch (error) {
            console.error(`❌ [ClienteService] Erro ao deletar cliente ${id}:`, error);
            throw error;
        }
    }
}
exports.ClienteService = ClienteService;
