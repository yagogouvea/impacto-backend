"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OcorrenciaService = void 0;
const client_1 = require("@prisma/client");
class OcorrenciaService {
    constructor() {
        this.prisma = new client_1.PrismaClient();
    }
    async list(filters = {}) {
        try {
            console.log('[OcorrenciaService] Iniciando listagem com filtros:', filters);
            const where = {};
            if (filters.id) {
                where.id = filters.id;
            }
            if (filters.status) {
                where.status = filters.status;
            }
            if (filters.placa) {
                where.OR = [
                    { placa1: { contains: filters.placa, mode: 'insensitive' } },
                    { placa2: { contains: filters.placa, mode: 'insensitive' } },
                    { placa3: { contains: filters.placa, mode: 'insensitive' } }
                ];
            }
            if (filters.cliente) {
                where.cliente = {
                    contains: filters.cliente
                };
            }
            if (filters.prestador) {
                where.prestador = {
                    contains: filters.prestador
                };
            }
            if (filters.data_inicio || filters.data_fim) {
                where.data_acionamento = {};
                if (filters.data_inicio) {
                    where.data_acionamento.gte = filters.data_inicio;
                }
                if (filters.data_fim) {
                    const dataFim = new Date(filters.data_fim);
                    dataFim.setDate(dataFim.getDate() + 1);
                    where.data_acionamento.lt = dataFim;
                }
            }
            console.log('[OcorrenciaService] Query where:', where);
            const ocorrencias = await this.prisma.ocorrencia.findMany({
                where,
                include: {
                    fotos: true
                },
                orderBy: {
                    criado_em: 'desc'
                }
            });
            console.log('[OcorrenciaService] Ocorrências encontradas:', ocorrencias.length);
            return ocorrencias;
        }
        catch (error) {
            console.error('[OcorrenciaService] Erro ao listar ocorrências:', error);
            throw error;
        }
    }
    async findById(id) {
        try {
            console.log(`[OcorrenciaService] Buscando ocorrência ID: ${id}`);
            const ocorrencia = await this.prisma.ocorrencia.findUnique({
                where: { id },
                include: {
                    fotos: true
                }
            });
            if (ocorrencia) {
                console.log(`✅ [OcorrenciaService] Ocorrência encontrada: ${ocorrencia.id}`);
            }
            else {
                console.log(`⚠️ [OcorrenciaService] Ocorrência não encontrada: ${id}`);
            }
            return ocorrencia;
        }
        catch (error) {
            console.error(`❌ [OcorrenciaService] Erro ao buscar ocorrência ${id}:`, error);
            throw error;
        }
    }
    async create(data) {
        try {
            console.log('[OcorrenciaService] Criando ocorrência:', data);
            // ✅ DEBUG: Log detalhado dos dados de localização recebidos
            console.log('🔍 [OcorrenciaService] Dados de localização recebidos:', {
                coordenadas: data.coordenadas,
                endereco: data.endereco,
                bairro: data.bairro,
                cidade: data.cidade,
                estado: data.estado
            });
            // ✅ DEBUG: Verificar se o Prisma está disponível
            if (!this.prisma) {
                console.error('❌ [OcorrenciaService] Prisma não está disponível');
                throw new Error('Prisma não está disponível');
            }
            // ✅ DEBUG: Testar conexão com o banco
            try {
                await this.prisma.$queryRaw `SELECT 1`;
                console.log('✅ [OcorrenciaService] Conexão com banco OK');
            }
            catch (dbError) {
                console.error('❌ [OcorrenciaService] Erro na conexão com banco:', dbError);
                throw new Error('Erro na conexão com banco de dados');
            }
            const dataToCreate = {
                placa1: data.placa1,
                placa2: data.placa2,
                placa3: data.placa3,
                modelo1: data.modelo1,
                cor1: data.cor1,
                cliente: data.cliente,
                sub_cliente: data.sub_cliente,
                tipo: data.tipo,
                tipo_veiculo: data.tipo_veiculo,
                coordenadas: data.coordenadas,
                cep: data.cep,
                endereco: data.endereco,
                bairro: data.bairro,
                cidade: data.cidade,
                estado: data.estado,
                cpf_condutor: data.cpf_condutor,
                nome_condutor: data.nome_condutor,
                transportadora: data.transportadora,
                valor_carga: data.valor_carga,
                notas_fiscais: data.notas_fiscais,
                os: data.os,
                origem_bairro: data.origem_bairro,
                origem_cidade: data.origem_cidade,
                origem_estado: data.origem_estado,
                prestador: data.prestador,
                inicio: data.inicio,
                chegada: data.chegada,
                termino: data.termino,
                km: data.km,
                despesas: data.despesas,
                descricao: data.descricao,
                resultado: data.resultado,
                sub_resultado: data.sub_resultado,
                status: data.status || 'em_andamento',
                encerrada_em: data.encerrada_em,
                data_acionamento: data.data_acionamento,
                km_final: data.km_final,
                km_inicial: data.km_inicial,
                despesas_detalhadas: data.despesas_detalhadas,
                operador: data.operador,
                // Novos campos para horários
                data_chamado: data.data_chamado,
                hora_chamado: data.hora_chamado,
                data_recuperacao: data.data_recuperacao,
                chegada_qth: data.chegada_qth,
                local_abordagem: data.local_abordagem,
                destino: data.destino,
                tipo_remocao: data.tipo_remocao,
                endereco_loja: data.endereco_loja,
                nome_loja: data.nome_loja,
                nome_guincho: data.nome_guincho,
                endereco_base: data.endereco_base,
                detalhes_local: data.detalhes_local
            };
            const ocorrencia = await this.prisma.ocorrencia.create({
                include: {
                    fotos: true
                },
                data: dataToCreate
            });
            console.log(`✅ [OcorrenciaService] Ocorrência criada: ${ocorrencia.id}`);
            // ✅ DEBUG: Log detalhado dos dados de localização retornados
            console.log('🔍 [OcorrenciaService] Dados de localização retornados:', {
                coordenadas: ocorrencia.coordenadas,
                endereco: ocorrencia.endereco,
                bairro: ocorrencia.bairro,
                cidade: ocorrencia.cidade,
                estado: ocorrencia.estado
            });
            return ocorrencia;
        }
        catch (error) {
            console.error('❌ [OcorrenciaService] Erro ao criar ocorrência:', error);
            throw error;
        }
    }
    async update(id, data) {
        try {
            console.log(`[OcorrenciaService] Atualizando ocorrência ID: ${id}`);
            const dataToUpdate = {
                placa1: data.placa1,
                placa2: data.placa2,
                placa3: data.placa3,
                modelo1: data.modelo1,
                cor1: data.cor1,
                cliente: data.cliente,
                sub_cliente: data.sub_cliente,
                tipo: data.tipo,
                tipo_veiculo: data.tipo_veiculo,
                coordenadas: data.coordenadas,
                cep: data.cep,
                endereco: data.endereco,
                bairro: data.bairro,
                cidade: data.cidade,
                estado: data.estado,
                cpf_condutor: data.cpf_condutor,
                nome_condutor: data.nome_condutor,
                transportadora: data.transportadora,
                valor_carga: data.valor_carga,
                notas_fiscais: data.notas_fiscais,
                os: data.os,
                origem_bairro: data.origem_bairro,
                origem_cidade: data.origem_cidade,
                origem_estado: data.origem_estado,
                prestador: data.prestador,
                inicio: data.inicio,
                chegada: data.chegada,
                termino: data.termino,
                km: data.km,
                despesas: data.despesas,
                descricao: data.descricao,
                resultado: data.resultado,
                sub_resultado: data.sub_resultado,
                status: data.status,
                encerrada_em: data.encerrada_em,
                data_acionamento: data.data_acionamento,
                km_final: data.km_final,
                km_inicial: data.km_inicial,
                despesas_detalhadas: data.despesas_detalhadas,
                operador: data.operador,
                // Novos campos para horários
                data_chamado: data.data_chamado,
                hora_chamado: data.hora_chamado,
                data_recuperacao: data.data_recuperacao,
                chegada_qth: data.chegada_qth,
                local_abordagem: data.local_abordagem,
                destino: data.destino,
                tipo_remocao: data.tipo_remocao,
                endereco_loja: data.endereco_loja,
                nome_loja: data.nome_loja,
                nome_guincho: data.nome_guincho,
                endereco_base: data.endereco_base,
                detalhes_local: data.detalhes_local
            };
            const ocorrencia = await this.prisma.ocorrencia.update({
                where: { id },
                include: {
                    fotos: true
                },
                data: dataToUpdate
            });
            console.log(`✅ [OcorrenciaService] Ocorrência atualizada: ${ocorrencia.id}`);
            return ocorrencia;
        }
        catch (error) {
            console.error(`❌ [OcorrenciaService] Erro ao atualizar ocorrência ${id}:`, error);
            throw error;
        }
    }
    async delete(id) {
        try {
            console.log(`[OcorrenciaService] Deletando ocorrência ID: ${id}`);
            const ocorrencia = await this.prisma.ocorrencia.delete({
                where: { id }
            });
            console.log(`✅ [OcorrenciaService] Ocorrência deletada: ${ocorrencia.id}`);
            return ocorrencia;
        }
        catch (error) {
            console.error(`❌ [OcorrenciaService] Erro ao deletar ocorrência ${id}:`, error);
            throw error;
        }
    }
    async findByStatus(status) {
        try {
            console.log(`[OcorrenciaService] Buscando ocorrências com status: ${status}`);
            const ocorrencias = await this.prisma.ocorrencia.findMany({
                where: {
                    status: status
                },
                include: {
                    fotos: true
                },
                orderBy: {
                    criado_em: 'desc'
                }
            });
            console.log(`✅ [OcorrenciaService] Encontradas ${ocorrencias.length} ocorrências com status ${status}`);
            return ocorrencias;
        }
        catch (error) {
            console.error(`❌ [OcorrenciaService] Erro ao buscar ocorrências por status ${status}:`, error);
            throw error;
        }
    }
    async findByPlaca(placa) {
        try {
            console.log(`[OcorrenciaService] Buscando ocorrências com placa: ${placa}`);
            const ocorrencias = await this.prisma.ocorrencia.findMany({
                where: {
                    OR: [
                        { placa1: { contains: placa, mode: 'insensitive' } },
                        { placa2: { contains: placa, mode: 'insensitive' } },
                        { placa3: { contains: placa, mode: 'insensitive' } }
                    ]
                },
                orderBy: {
                    criado_em: 'desc'
                }
            });
            console.log(`✅ [OcorrenciaService] Encontradas ${ocorrencias.length} ocorrências com placa ${placa}`);
            return ocorrencias;
        }
        catch (error) {
            console.error(`❌ [OcorrenciaService] Erro ao buscar ocorrências por placa ${placa}:`, error);
            throw error;
        }
    }
    async addFotos(id, urls) {
        try {
            console.log(`[OcorrenciaService] Adicionando ${urls.length} fotos à ocorrência ID: ${id}`);
            // Verificar se a ocorrência existe
            const ocorrencia = await this.findById(id);
            if (!ocorrencia) {
                throw new Error(`Ocorrência com ID ${id} não encontrada`);
            }
            // Criar as fotos associadas à ocorrência
            await this.prisma.foto.createMany({
                data: urls.map(url => ({
                    url,
                    legenda: 'Foto adicionada via API',
                    ocorrenciaId: id
                }))
            });
            // Retornar a ocorrência atualizada com as fotos
            const ocorrenciaAtualizada = await this.prisma.ocorrencia.findUnique({
                where: { id },
                include: { fotos: true }
            });
            console.log(`✅ [OcorrenciaService] ${urls.length} fotos adicionadas à ocorrência ${id}`);
            return ocorrenciaAtualizada;
        }
        catch (error) {
            console.error(`❌ [OcorrenciaService] Erro ao adicionar fotos à ocorrência ${id}:`, error);
            throw error;
        }
    }
    // ✅ NOVO MÉTODO OTIMIZADO PARA DASHBOARD
    async listForDashboard() {
        try {
            console.log('[OcorrenciaService] Iniciando listagem otimizada para dashboard...');
            // ✅ OTIMIZAÇÃO: Incluir apenas dados essenciais e status dos popups
            const ocorrencias = await this.prisma.ocorrencia.findMany({
                select: {
                    id: true,
                    placa1: true,
                    placa2: true,
                    placa3: true,
                    modelo1: true,
                    cor1: true,
                    cliente: true,
                    operador: true,
                    prestador: true,
                    status: true,
                    resultado: true,
                    data_acionamento: true,
                    inicio: true,
                    chegada: true,
                    termino: true,
                    km_inicial: true,
                    km_final: true,
                    despesas: true,
                    criado_em: true,
                    atualizado_em: true,
                    // ✅ DADOS ESSENCIAIS DOS POPUPS (sem carregar tudo)
                    // TODO: Implementar modelo CheckList no schema
                    // ✅ APENAS CONTAGEM DE FOTOS (não as fotos em si)
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
            console.log('[OcorrenciaService] ✅ Dashboard: Ocorrências encontradas:', ocorrencias.length);
            return ocorrencias;
        }
        catch (error) {
            console.error('[OcorrenciaService] ❌ Erro ao listar ocorrências para dashboard:', error);
            throw error;
        }
    }
}
exports.OcorrenciaService = OcorrenciaService;
