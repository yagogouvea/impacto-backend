import { Request, Response } from 'express';
import { prisma } from '../../../lib/prisma';

export class OcorrenciaController {
  constructor() {
    try {
      console.log('[OcorrenciaController] Inicializando controller...');
      console.log('[OcorrenciaController] Prisma disponível:', !!prisma);
      console.log('[OcorrenciaController] Controller inicializado com sucesso');
    } catch (error) {
      console.error('[OcorrenciaController] Erro ao inicializar controller:', error);
      throw error;
    }
  }

  async list(req: Request, res: Response) {
    try {
      console.log('[OcorrenciaController] Iniciando listagem...');
      
      const ocorrencias = await prisma.ocorrencia.findMany({
        include: {
          fotos: true
        },
        orderBy: {
          criado_em: 'desc'
        }
      });
      
      console.log('[OcorrenciaController] Ocorrências encontradas:', ocorrencias.length);
      return res.json(ocorrencias);
    } catch (error: unknown) {
      console.error('[OcorrenciaController] Erro na listagem:', error);
      console.error('[OcorrenciaController] Detalhes do erro:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      console.log('[OcorrenciaController] Create request received');
      console.log('[OcorrenciaController] Request body:', JSON.stringify(req.body, null, 2));
      console.log('[OcorrenciaController] Prisma disponível no create:', !!prisma);
      
      const ocorrencia = await prisma.ocorrencia.create({
        data: {
          placa1: req.body.placa1,
          placa2: req.body.placa2,
          placa3: req.body.placa3,
          modelo1: req.body.modelo1,
          cor1: req.body.cor1,
          cliente: req.body.cliente,
          tipo: req.body.tipo,
          tipo_veiculo: req.body.tipo_veiculo,
          coordenadas: req.body.coordenadas,
          endereco: req.body.endereco,
          bairro: req.body.bairro,
          cidade: req.body.cidade,
          estado: req.body.estado,
          cpf_condutor: req.body.cpf_condutor,
          nome_condutor: req.body.nome_condutor,
          transportadora: req.body.transportadora,
          valor_carga: req.body.valor_carga,
          notas_fiscais: req.body.notas_fiscais,
          os: req.body.os,
          origem_bairro: req.body.origem_bairro,
          origem_cidade: req.body.origem_cidade,
          origem_estado: req.body.origem_estado,
          prestador: req.body.prestador,
          inicio: req.body.inicio,
          chegada: req.body.chegada,
          termino: req.body.termino,
          km: req.body.km,
          despesas: req.body.despesas,
          descricao: req.body.descricao,
          resultado: req.body.resultado,
          // sub_resultado: req.body.sub_resultado, // Campo não existe no schema
          status: req.body.status || 'em_andamento',
          encerrada_em: req.body.encerrada_em,
          data_acionamento: req.body.data_acionamento,
          km_final: req.body.km_final,
          km_inicial: req.body.km_inicial,
          despesas_detalhadas: req.body.despesas_detalhadas,
          operador: req.body.operador,
          // data_chamado: req.body.data_chamado, // Campo não existe no schema
          // hora_chamado: req.body.hora_chamado, // Campo não existe no schema
          // Campos que não existem no schema atual:
          // data_recuperacao: req.body.data_recuperacao,
          // chegada_qth: req.body.chegada_qth,
          // local_abordagem: req.body.local_abordagem,
          // destino: req.body.destino,
          // tipo_remocao: req.body.tipo_remocao,
          // endereco_loja: req.body.endereco_loja,
          // nome_loja: req.body.nome_loja,
          // nome_guincho: req.body.nome_guincho,
          // endereco_base: req.body.endereco_base,
          // detalhes_local: req.body.detalhes_local
        },
        include: {
          fotos: true
        }
      });
      
      console.log('[OcorrenciaController] Ocorrência created successfully:', ocorrencia.id);
      return res.status(201).json(ocorrencia);
    } catch (error: unknown) {
      console.error('[OcorrenciaController] Error in create:', error);
      console.error('[OcorrenciaController] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      console.log('[OcorrenciaController] Buscando ocorrência por ID:', req.params.id);
      const { id } = req.params;
      
      const ocorrencia = await prisma.ocorrencia.findUnique({
        where: { id: Number(id) },
        include: {
          fotos: true
        }
      });
      
      console.log('[OcorrenciaController] Ocorrência encontrada:', ocorrencia?.id);
      return res.json(ocorrencia);
    } catch (error: unknown) {
      console.error('[OcorrenciaController] Erro ao buscar por ID:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      console.log('🔍 [OcorrenciaController] Update request for ID:', id);
      console.log('🔍 [OcorrenciaController] Request body:', JSON.stringify(req.body, null, 2));
      console.log('🔍 [OcorrenciaController] Prisma disponível:', !!prisma);
      
      // Verificar conexão do Prisma
      try {
        await prisma.$connect();
        console.log('✅ [OcorrenciaController] Prisma conectado');
      } catch (error) {
        console.error('❌ [OcorrenciaController] Erro ao conectar Prisma:', error);
        return res.status(500).json({ error: 'Erro de conexão com banco de dados' });
      }
      console.log('🔍 [OcorrenciaController] User:', req.user);
      
      // Verificar se a ocorrência existe antes de atualizar
      console.log('🔍 [OcorrenciaController] Buscando ocorrência existente...');
      const ocorrenciaExistente = await prisma.ocorrencia.findUnique({
        where: { id: Number(id) }
      });
      
      if (!ocorrenciaExistente) {
        console.log('❌ [OcorrenciaController] Ocorrência não encontrada:', id);
        return res.status(404).json({ error: 'Ocorrência não encontrada' });
      }
      
      console.log('✅ [OcorrenciaController] Ocorrência encontrada:', ocorrenciaExistente.id);
      console.log('🔍 [OcorrenciaController] Descrição atual:', ocorrenciaExistente.descricao);
      console.log('🔍 [OcorrenciaController] Dados para atualização:', req.body);
      
      // Verificar se há dados para atualizar
      if (!req.body || Object.keys(req.body).length === 0) {
        console.log('❌ [OcorrenciaController] Nenhum dado para atualizar');
        return res.status(400).json({ error: 'Nenhum dado para atualizar' });
      }
      
      // Verificar especificamente o campo descrição
      if (req.body.descricao !== undefined) {
        console.log('🔍 [OcorrenciaController] Campo descrição encontrado:', req.body.descricao);
        console.log('🔍 [OcorrenciaController] Tipo da descrição:', typeof req.body.descricao);
        console.log('🔍 [OcorrenciaController] Tamanho da descrição:', req.body.descricao?.length);
      } else {
        console.log('⚠️ [OcorrenciaController] Campo descrição não encontrado no body');
      }
      
      console.log('🔄 [OcorrenciaController] Executando update no banco...');
      
      // Forçar commit explícito
      const ocorrencia = await prisma.$transaction(async (tx) => {
        const updated = await tx.ocorrencia.update({
          where: { id: Number(id) },
          data: req.body,
          include: {
            // checklist: true, // Modelo não existe no schema
            fotos: true
          }
        });
        
        console.log('🔄 [OcorrenciaController] Update executado na transação');
        return updated;
      });
      
      console.log('✅ [OcorrenciaController] Ocorrência atualizada com sucesso:', ocorrencia.id);
      console.log('✅ [OcorrenciaController] Descrição após atualização:', ocorrencia.descricao);
      console.log('✅ [OcorrenciaController] Dados retornados:', JSON.stringify(ocorrencia, null, 2));
      
      return res.json(ocorrencia);
    } catch (error: unknown) {
      console.error('❌ [OcorrenciaController] Error in update:', error);
      console.error('❌ [OcorrenciaController] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.ocorrencia.delete({
        where: { id: Number(id) }
      });
      return res.status(204).send();
    } catch (error: unknown) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async findByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;
      const ocorrencias = await prisma.ocorrencia.findMany({
        where: { status: status as any },
        include: {
          fotos: true
        },
        orderBy: {
          criado_em: 'desc'
        }
      });
      return res.json(ocorrencias);
    } catch (error: unknown) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async findByPlaca(req: Request, res: Response) {
    try {
      const { placa } = req.params;
      const ocorrencias = await prisma.ocorrencia.findMany({
        where: {
          OR: [
            { placa1: { contains: placa, mode: 'insensitive' } },
            { placa2: { contains: placa, mode: 'insensitive' } },
            { placa3: { contains: placa, mode: 'insensitive' } }
          ]
        },
        include: {
          fotos: true
        },
        orderBy: {
          criado_em: 'desc'
        }
      });
      return res.json(ocorrencias);
    } catch (error: unknown) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async addFotos(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const fotos = req.files as Express.Multer.File[];
      
      if (!fotos || fotos.length === 0) {
        return res.status(400).json({ error: 'Nenhuma foto enviada' });
      }

      // Implementar lógica de upload de fotos
      return res.status(201).json({ message: 'Fotos adicionadas com sucesso' });
    } catch (error: unknown) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
} 