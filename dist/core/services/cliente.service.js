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
                    nome_fantasia: data.nome_fantasia,
                    cnpj: cnpjNormalizado,
                    contato: data.contato,
                    telefone: data.telefone,
                    email: data.email,
                    endereco: data.endereco,
                    cidade: data.cidade,
                    estado: data.estado,
                    cep: data.cep,
                    logo: data.logo
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
            if (data.nome !== undefined)
                updateData.nome = data.nome;
            if (data.nome_fantasia !== undefined)
                updateData.nome_fantasia = data.nome_fantasia;
            if (data.contato !== undefined)
                updateData.contato = data.contato;
            if (data.telefone !== undefined)
                updateData.telefone = data.telefone;
            if (data.email !== undefined)
                updateData.email = data.email;
            if (data.endereco !== undefined)
                updateData.endereco = data.endereco;
            if (data.cidade !== undefined)
                updateData.cidade = data.cidade;
            if (data.estado !== undefined)
                updateData.estado = data.estado;
            if (data.cep !== undefined)
                updateData.cep = data.cep;
            if (data.logo !== undefined)
                updateData.logo = data.logo;
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
