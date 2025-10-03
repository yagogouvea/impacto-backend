import { Request, Response } from 'express';
import { ensurePrisma } from '../../../lib/prisma';

export class CheckListController {
  
  async getByOcorrenciaId(req: Request, res: Response) {
    try {
      const { ocorrenciaId } = req.params;
      
      const db = await ensurePrisma();
      if (!db) {
        return res.status(500).json({ 
          error: 'Erro de conexão com o banco de dados' 
        });
      }

      const checklist = await db.checkList.findUnique({
        where: { 
          ocorrencia_id: Number(ocorrenciaId) 
        }
      });

      if (!checklist) {
        return res.status(404).json({ 
          error: 'Checklist não encontrado para esta ocorrência' 
        });
      }

      res.json(checklist);
    } catch (error) {
      console.error('❌ Erro ao buscar checklist:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor' 
      });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const checklistData = req.body;
      
      const db = await ensurePrisma();
      if (!db) {
        return res.status(500).json({ 
          error: 'Erro de conexão com o banco de dados' 
        });
      }

      // Verificar se já existe checklist para esta ocorrência
      const existingChecklist = await db.checkList.findUnique({
        where: { 
          ocorrencia_id: Number(checklistData.ocorrencia_id) 
        }
      });

      if (existingChecklist) {
        return res.status(409).json({ 
          error: 'Já existe um checklist para esta ocorrência. Use PUT para atualizar.' 
        });
      }

      // Criar novo checklist
      const checklist = await db.checkList.create({
        data: {
          ocorrencia_id: Number(checklistData.ocorrencia_id),
          loja_selecionada: checklistData.loja_selecionada || false,
          nome_loja: checklistData.nome_loja,
          endereco_loja: checklistData.endereco_loja,
          nome_atendente: checklistData.nome_atendente,
          matricula_atendente: checklistData.matricula_atendente,
          guincho_selecionado: checklistData.guincho_selecionado || false,
          tipo_guincho: checklistData.tipo_guincho,
          valor_guincho: checklistData.valor_guincho,
          telefone_guincho: checklistData.telefone_guincho,
          nome_empresa_guincho: checklistData.nome_empresa_guincho,
          nome_motorista_guincho: checklistData.nome_motorista_guincho,
          destino_guincho: checklistData.destino_guincho,
          endereco_destino_guincho: checklistData.endereco_destino_guincho,
          apreensao_selecionada: checklistData.apreensao_selecionada || false,
          nome_dp_batalhao: checklistData.nome_dp_batalhao,
          endereco_apreensao: checklistData.endereco_apreensao,
          numero_bo_noc: checklistData.numero_bo_noc,
          liberado_local_selecionado: checklistData.liberado_local_selecionado || false,
          liberado_nome_responsavel: checklistData.liberado_nome_responsavel,
          liberado_numero_referencia: checklistData.liberado_numero_referencia,
          recuperado_com_chave: checklistData.recuperado_com_chave,
          posse_veiculo: checklistData.posse_veiculo,
          observacao_posse: checklistData.observacao_posse,
          avarias: checklistData.avarias,
          detalhes_avarias: checklistData.detalhes_avarias,
          fotos_realizadas: checklistData.fotos_realizadas,
          justificativa_fotos: checklistData.justificativa_fotos,
          observacao_ocorrencia: checklistData.observacao_ocorrencia,
          dispensado_checklist: checklistData.dispensado_checklist || false
        }
      });

      console.log(`✅ Checklist criado para ocorrência ${checklistData.ocorrencia_id}`);
      res.status(201).json(checklist);
    } catch (error) {
      console.error('❌ Erro ao criar checklist:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor' 
      });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const checklistData = req.body;
      
      const db = await ensurePrisma();
      if (!db) {
        return res.status(500).json({ 
          error: 'Erro de conexão com o banco de dados' 
        });
      }

      const checklist = await db.checkList.update({
        where: { id: Number(id) },
        data: {
          loja_selecionada: checklistData.loja_selecionada,
          nome_loja: checklistData.nome_loja,
          endereco_loja: checklistData.endereco_loja,
          nome_atendente: checklistData.nome_atendente,
          matricula_atendente: checklistData.matricula_atendente,
          guincho_selecionado: checklistData.guincho_selecionado,
          tipo_guincho: checklistData.tipo_guincho,
          valor_guincho: checklistData.valor_guincho,
          telefone_guincho: checklistData.telefone_guincho,
          nome_empresa_guincho: checklistData.nome_empresa_guincho,
          nome_motorista_guincho: checklistData.nome_motorista_guincho,
          destino_guincho: checklistData.destino_guincho,
          endereco_destino_guincho: checklistData.endereco_destino_guincho,
          apreensao_selecionada: checklistData.apreensao_selecionada,
          nome_dp_batalhao: checklistData.nome_dp_batalhao,
          endereco_apreensao: checklistData.endereco_apreensao,
          numero_bo_noc: checklistData.numero_bo_noc,
          liberado_local_selecionado: checklistData.liberado_local_selecionado,
          liberado_nome_responsavel: checklistData.liberado_nome_responsavel,
          liberado_numero_referencia: checklistData.liberado_numero_referencia,
          recuperado_com_chave: checklistData.recuperado_com_chave,
          posse_veiculo: checklistData.posse_veiculo,
          observacao_posse: checklistData.observacao_posse,
          avarias: checklistData.avarias,
          detalhes_avarias: checklistData.detalhes_avarias,
          fotos_realizadas: checklistData.fotos_realizadas,
          justificativa_fotos: checklistData.justificativa_fotos,
          observacao_ocorrencia: checklistData.observacao_ocorrencia,
          dispensado_checklist: checklistData.dispensado_checklist
        }
      });

      console.log(`✅ Checklist ${id} atualizado`);
      res.json(checklist);
    } catch (error) {
      console.error('❌ Erro ao atualizar checklist:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor' 
      });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const db = await ensurePrisma();
      if (!db) {
        return res.status(500).json({ 
          error: 'Erro de conexão com o banco de dados' 
        });
      }

      await db.checkList.delete({
        where: { id: Number(id) }
      });

      console.log(`✅ Checklist ${id} removido`);
      res.status(204).send();
    } catch (error) {
      console.error('❌ Erro ao remover checklist:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor' 
      });
    }
  }
}