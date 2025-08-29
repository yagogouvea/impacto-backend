import { Prisma, Ocorrencia } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

interface ListOcorrenciaFilters {
  status?: string;
  placa?: string;
  cliente?: string;
  data_inicio?: Date;
  data_fim?: Date;
}

export class OcorrenciaService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async list(filters: ListOcorrenciaFilters & { id?: number, prestador?: string } = {}): Promise<Ocorrencia[]> {
    try {
      console.log('[OcorrenciaService] Iniciando listagem com filtros:', filters);
      
      const where: Prisma.OcorrenciaWhereInput = {};

      if (filters.id) {
        where.id = filters.id;
      }

      if (filters.status) {
        where.status = filters.status as any;
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
          checklist: true,
          fotos: true
        },
        orderBy: {
          criado_em: 'desc'
        }
      });

      console.log('[OcorrenciaService] Ocorrências encontradas:', ocorrencias.length);
      return ocorrencias;
      
    } catch (error) {
      console.error('[OcorrenciaService] Erro ao listar ocorrências:', error);
      throw error;
    }
  }

  async findById(id: number): Promise<Ocorrencia | null> {
    try {
      console.log(`[OcorrenciaService] Buscando ocorrência ID: ${id}`);
      
      const ocorrencia = await this.prisma.ocorrencia.findUnique({
        where: { id },
        include: {
          checklist: true,
          fotos: true
        }
      });
      
      if (ocorrencia) {
        console.log(`✅ [OcorrenciaService] Ocorrência encontrada: ${ocorrencia.id}`);
      } else {
        console.log(`⚠️ [OcorrenciaService] Ocorrência não encontrada: ${id}`);
      }
      
      return ocorrencia;
    } catch (error) {
      console.error(`❌ [OcorrenciaService] Erro ao buscar ocorrência ${id}:`, error);
      throw error;
    }
  }

  async create(data: any): Promise<Ocorrencia> {
    try {
      console.log('[OcorrenciaService] Criando ocorrência:', data);
      
      const ocorrencia = await this.prisma.ocorrencia.create({
        include: {
          checklist: true,
          fotos: true
        },
        data: {
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
        }
      });
      
      console.log(`✅ [OcorrenciaService] Ocorrência criada: ${ocorrencia.id}`);
      return ocorrencia;
    } catch (error) {
      console.error('❌ [OcorrenciaService] Erro ao criar ocorrência:', error);
      throw error;
    }
  }

  async update(id: number, data: any): Promise<Ocorrencia> {
    try {
      console.log(`[OcorrenciaService] Atualizando ocorrência ID: ${id}`);
      
      const ocorrencia = await this.prisma.ocorrencia.update({
        where: { id },
        include: {
          checklist: true,
          fotos: true
        },
        data: {
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
        }
      });
      
      console.log(`✅ [OcorrenciaService] Ocorrência atualizada: ${ocorrencia.id}`);
      return ocorrencia;
    } catch (error) {
      console.error(`❌ [OcorrenciaService] Erro ao atualizar ocorrência ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<Ocorrencia> {
    try {
      console.log(`[OcorrenciaService] Deletando ocorrência ID: ${id}`);
      
      const ocorrencia = await this.prisma.ocorrencia.delete({
        where: { id }
      });
      
      console.log(`✅ [OcorrenciaService] Ocorrência deletada: ${ocorrencia.id}`);
      return ocorrencia;
    } catch (error) {
      console.error(`❌ [OcorrenciaService] Erro ao deletar ocorrência ${id}:`, error);
      throw error;
    }
  }

  async findByStatus(status: string): Promise<Ocorrencia[]> {
    try {
      console.log(`[OcorrenciaService] Buscando ocorrências com status: ${status}`);
      
      const ocorrencias = await this.prisma.ocorrencia.findMany({
        where: { 
          status: status as any 
        },
        include: {
          checklist: true,
          fotos: true
        },
        orderBy: {
          criado_em: 'desc'
        }
      });
      
      console.log(`✅ [OcorrenciaService] Encontradas ${ocorrencias.length} ocorrências com status ${status}`);
      return ocorrencias;
    } catch (error) {
      console.error(`❌ [OcorrenciaService] Erro ao buscar ocorrências por status ${status}:`, error);
      throw error;
    }
  }

  async findByPlaca(placa: string): Promise<Ocorrencia[]> {
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
    } catch (error) {
      console.error(`❌ [OcorrenciaService] Erro ao buscar ocorrências por placa ${placa}:`, error);
      throw error;
    }
  }

  async addFotos(id: number, urls: string[]): Promise<Ocorrencia> {
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
      return ocorrenciaAtualizada as Ocorrencia;
    } catch (error) {
      console.error(`❌ [OcorrenciaService] Erro ao adicionar fotos à ocorrência ${id}:`, error);
      throw error;
    }
  }

  // ✅ NOVO MÉTODO OTIMIZADO PARA DASHBOARD
  async listForDashboard(): Promise<any[]> {
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
          checklist: {
            select: {
              id: true,
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
      
    } catch (error) {
      console.error('[OcorrenciaService] ❌ Erro ao listar ocorrências para dashboard:', error);
      throw error;
    }
  }
} 