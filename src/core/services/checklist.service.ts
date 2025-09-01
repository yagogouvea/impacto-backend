import { CheckList } from '@prisma/client';
import { PrismaClient } from '@prisma/client';

export class CheckListService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findByOcorrenciaId(ocorrenciaId: number): Promise<CheckList | null> {
    try {
      console.log(`🔍 [CheckListService] Buscando checklist para ocorrência ID: ${ocorrenciaId}`);
      console.log(`🔍 [CheckListService] Tipo do parâmetro: ${typeof ocorrenciaId}`);
      
      // Verificar se o Prisma está conectado
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        console.log(`✅ [CheckListService] Prisma conectado ao banco`);
      } catch (error) {
        console.error(`❌ [CheckListService] Erro na conexão do Prisma:`, error);
        throw new Error('Erro de conexão com o banco de dados');
      }
      
      // Verificar se existem checklists na tabela
      const totalChecklists = await this.prisma.checkList.count();
      console.log(`📊 [CheckListService] Total de checklists na tabela: ${totalChecklists}`);
      
      // Listar todos os checklists para debug
      const allChecklists = await this.prisma.checkList.findMany();
      console.log(`📋 [CheckListService] Todos os checklists:`, allChecklists.map(c => ({ 
        id: c.id, 
        ocorrencia_id: c.ocorrencia_id,
        nome_loja: c.nome_loja,
        endereco_loja: c.endereco_loja,
        nome_atendente: c.nome_atendente,
        matricula_atendente: c.matricula_atendente,
        dispensado_checklist: c.dispensado_checklist
      })));
      
      // Tentar buscar com findFirst como fallback
      let checklist = await this.prisma.checkList.findUnique({
        where: { ocorrencia_id: ocorrenciaId }
      });
      
      // Se não encontrar com findUnique, tentar com findFirst
      if (!checklist) {
        console.log(`🔍 [CheckListService] Tentando buscar com findFirst...`);
        checklist = await this.prisma.checkList.findFirst({
          where: { ocorrencia_id: ocorrenciaId }
        });
      }
      
      if (checklist) {
        console.log(`✅ [CheckListService] Checklist encontrado: ${checklist.id}`);
        console.log(`📋 [CheckListService] Dados do checklist:`, {
          id: checklist.id,
          ocorrencia_id: checklist.ocorrencia_id,
          nome_loja: checklist.nome_loja,
          endereco_loja: checklist.endereco_loja,
          nome_atendente: checklist.nome_atendente,
          matricula_atendente: checklist.matricula_atendente,
          dispensado_checklist: checklist.dispensado_checklist,
          loja_selecionada: checklist.loja_selecionada,
          guincho_selecionado: checklist.guincho_selecionado,
          apreensao_selecionada: checklist.apreensao_selecionada
        });
      } else {
        console.log(`⚠️ [CheckListService] Checklist não encontrado para ocorrência: ${ocorrenciaId}`);
      }
      
      return checklist;
    } catch (error) {
      console.error(`❌ [CheckListService] Erro ao buscar checklist para ocorrência ${ocorrenciaId}:`, error);
      throw error;
    }
  }

  async create(data: any): Promise<CheckList> {
    try {
      console.log('[CheckListService] Criando checklist:', data);
      
      // ✅ APLICAR LÓGICA DE LIMPEZA: Preparar dados com limpeza automática
      const cleanedData = this.applyCleanupLogic(data);
      
      const checklist = await this.prisma.checkList.create({
        data: {
          ocorrencia_id: cleanedData.ocorrencia_id,
          
          // Loja
          loja_selecionada: cleanedData.loja_selecionada,
          nome_loja: cleanedData.nome_loja,
          endereco_loja: cleanedData.endereco_loja,
          nome_atendente: cleanedData.nome_atendente,
          matricula_atendente: cleanedData.matricula_atendente,
          
          // Guincho
          guincho_selecionado: cleanedData.guincho_selecionado,
          tipo_guincho: cleanedData.tipo_guincho,
          valor_guincho: cleanedData.valor_guincho,
          telefone_guincho: cleanedData.telefone_guincho,
          nome_empresa_guincho: cleanedData.nome_empresa_guincho,
          nome_motorista_guincho: cleanedData.nome_motorista_guincho,
          destino_guincho: cleanedData.destino_guincho,
          endereco_destino_guincho: cleanedData.endereco_destino_guincho,
          
          // Apreensão
          apreensao_selecionada: cleanedData.apreensao_selecionada,
          nome_dp_batalhao: cleanedData.nome_dp_batalhao,
          endereco_apreensao: cleanedData.endereco_apreensao,
          numero_bo_noc: cleanedData.numero_bo_noc,
          
          // Recuperado com chave
          recuperado_com_chave: cleanedData.recuperado_com_chave,
          
          // Posse do veículo
          posse_veiculo: cleanedData.posse_veiculo,
          observacao_posse: cleanedData.observacao_posse,
          
          // Avarias
          avarias: cleanedData.avarias,
          detalhes_avarias: cleanedData.detalhes_avarias,
          
          // Fotos
          fotos_realizadas: cleanedData.fotos_realizadas,
          justificativa_fotos: cleanedData.justificativa_fotos,
          
          // Observação geral
          observacao_ocorrencia: cleanedData.observacao_ocorrencia,
          
          // ✅ NOVO: Controle de tratamento - dispensado o checklist
          dispensado_checklist: cleanedData.dispensado_checklist
        }
      });
      
      console.log(`✅ [CheckListService] Checklist criado: ${checklist.id}`);
      return checklist;
    } catch (error) {
      console.error('❌ [CheckListService] Erro ao criar checklist:', error);
      throw error;
    }
  }

  async update(id: number, data: any): Promise<CheckList> {
    try {
      console.log(`[CheckListService] Atualizando checklist ID: ${id}`);
      
      // ✅ APLICAR LÓGICA DE LIMPEZA: Preparar dados com limpeza automática
      const cleanedData = this.applyCleanupLogic(data);
      console.log(`🧹 [CheckListService] Dados após limpeza:`, {
        loja: cleanedData.loja_selecionada,
        guincho: cleanedData.guincho_selecionado,
        apreensao: cleanedData.apreensao_selecionada
      });
      
      const checklist = await this.prisma.checkList.update({
        where: { id },
        data: {
          
          // Loja
          loja_selecionada: cleanedData.loja_selecionada,
          nome_loja: cleanedData.nome_loja,
          endereco_loja: cleanedData.endereco_loja,
          nome_atendente: cleanedData.nome_atendente,
          matricula_atendente: cleanedData.matricula_atendente,
          
          // Guincho
          guincho_selecionado: cleanedData.guincho_selecionado,
          tipo_guincho: cleanedData.tipo_guincho,
          valor_guincho: cleanedData.valor_guincho,
          telefone_guincho: cleanedData.telefone_guincho,
          nome_empresa_guincho: cleanedData.nome_empresa_guincho,
          nome_motorista_guincho: cleanedData.nome_motorista_guincho,
          destino_guincho: cleanedData.destino_guincho,
          endereco_destino_guincho: cleanedData.endereco_destino_guincho,
          
          // Apreensão
          apreensao_selecionada: cleanedData.apreensao_selecionada,
          nome_dp_batalhao: cleanedData.nome_dp_batalhao,
          endereco_apreensao: cleanedData.endereco_apreensao,
          numero_bo_noc: cleanedData.numero_bo_noc,
          
          // Recuperado com chave
          recuperado_com_chave: cleanedData.recuperado_com_chave,
          
          // Posse do veículo
          posse_veiculo: cleanedData.posse_veiculo,
          observacao_posse: cleanedData.observacao_posse,
          
          // Avarias
          avarias: cleanedData.avarias,
          detalhes_avarias: cleanedData.detalhes_avarias,
          
          // Fotos
          fotos_realizadas: cleanedData.fotos_realizadas,
          justificativa_fotos: cleanedData.justificativa_fotos,
          
          // Observação geral
          observacao_ocorrencia: cleanedData.observacao_ocorrencia,
          
          // ✅ NOVO: Controle de tratamento - dispensado o checklist
          dispensado_checklist: cleanedData.dispensado_checklist
        }
      });
      
      console.log(`✅ [CheckListService] Checklist atualizado: ${checklist.id}`);
      return checklist;
    } catch (error) {
      console.error(`❌ [CheckListService] Erro ao atualizar checklist ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      console.log(`[CheckListService] Deletando checklist ID: ${id}`);
      
      await this.prisma.checkList.delete({
        where: { id }
      });
      
      console.log(`✅ [CheckListService] Checklist deletado: ${id}`);
    } catch (error) {
      console.error(`❌ [CheckListService] Erro ao deletar checklist ${id}:`, error);
      throw error;
    }
  }

  /**
   * ✅ LÓGICA DE LIMPEZA: Remove dados de opções não selecionadas
   * 
   * Regra: Apenas UMA das opções (Loja, Guincho, Apreensão) pode ter dados por vez.
   * Quando uma opção é selecionada, as outras são automaticamente limpas.
   * 
   * As outras informações (recuperado_com_chave, posse_veiculo, avarias, etc.) 
   * são mantidas independentemente da opção escolhida.
   */
  private applyCleanupLogic(data: any): any {
    console.log(`🧹 [CheckListService] Aplicando lógica de limpeza...`);
    console.log(`📋 [CheckListService] Opções recebidas:`, {
      loja: data.loja_selecionada,
      guincho: data.guincho_selecionado,
      apreensao: data.apreensao_selecionada
    });

    const cleanedData = { ...data };

    // Determinar qual opção foi selecionada
    const lojaSelected = data.loja_selecionada === true;
    const guinchoSelected = data.guincho_selecionado === true;
    const apreensaoSelected = data.apreensao_selecionada === true;

    // ✅ LOJA SELECIONADA: Limpar dados de Guincho e Apreensão
    if (lojaSelected) {
      console.log(`🏪 [CheckListService] LOJA selecionada - limpando dados de Guincho e Apreensão`);
      
      // Limpar Guincho
      cleanedData.guincho_selecionado = false;
      cleanedData.tipo_guincho = null;
      cleanedData.valor_guincho = null;
      cleanedData.telefone_guincho = null;
      cleanedData.nome_empresa_guincho = null;
      cleanedData.nome_motorista_guincho = null;
      cleanedData.destino_guincho = null;
      cleanedData.endereco_destino_guincho = null;
      
      // Limpar Apreensão
      cleanedData.apreensao_selecionada = false;
      cleanedData.nome_dp_batalhao = null;
      cleanedData.endereco_apreensao = null;
      cleanedData.numero_bo_noc = null;
    }
    
    // ✅ GUINCHO SELECIONADO: Limpar dados de Loja e Apreensão
    else if (guinchoSelected) {
      console.log(`🚛 [CheckListService] GUINCHO selecionado - limpando dados de Loja e Apreensão`);
      
      // Limpar Loja
      cleanedData.loja_selecionada = false;
      cleanedData.nome_loja = null;
      cleanedData.endereco_loja = null;
      cleanedData.nome_atendente = null;
      cleanedData.matricula_atendente = null;
      
      // Limpar Apreensão
      cleanedData.apreensao_selecionada = false;
      cleanedData.nome_dp_batalhao = null;
      cleanedData.endereco_apreensao = null;
      cleanedData.numero_bo_noc = null;
    }
    
    // ✅ APREENSÃO SELECIONADA: Limpar dados de Loja e Guincho
    else if (apreensaoSelected) {
      console.log(`🚨 [CheckListService] APREENSÃO selecionada - limpando dados de Loja e Guincho`);
      
      // Limpar Loja
      cleanedData.loja_selecionada = false;
      cleanedData.nome_loja = null;
      cleanedData.endereco_loja = null;
      cleanedData.nome_atendente = null;
      cleanedData.matricula_atendente = null;
      
      // Limpar Guincho
      cleanedData.guincho_selecionado = false;
      cleanedData.tipo_guincho = null;
      cleanedData.valor_guincho = null;
      cleanedData.telefone_guincho = null;
      cleanedData.nome_empresa_guincho = null;
      cleanedData.nome_motorista_guincho = null;
      cleanedData.destino_guincho = null;
      cleanedData.endereco_destino_guincho = null;
    }
    
    // ✅ NENHUMA OPÇÃO SELECIONADA: Limpar todos os dados específicos
    else {
      console.log(`❌ [CheckListService] NENHUMA opção selecionada - limpando todos os dados específicos`);
      
      // Limpar Loja
      cleanedData.loja_selecionada = false;
      cleanedData.nome_loja = null;
      cleanedData.endereco_loja = null;
      cleanedData.nome_atendente = null;
      cleanedData.matricula_atendente = null;
      
      // Limpar Guincho
      cleanedData.guincho_selecionado = false;
      cleanedData.tipo_guincho = null;
      cleanedData.valor_guincho = null;
      cleanedData.telefone_guincho = null;
      cleanedData.nome_empresa_guincho = null;
      cleanedData.nome_motorista_guincho = null;
      cleanedData.destino_guincho = null;
      cleanedData.endereco_destino_guincho = null;
      
      // Limpar Apreensão
      cleanedData.apreensao_selecionada = false;
      cleanedData.nome_dp_batalhao = null;
      cleanedData.endereco_apreensao = null;
      cleanedData.numero_bo_noc = null;
    }

    console.log(`✅ [CheckListService] Limpeza concluída. Resultado:`, {
      loja: cleanedData.loja_selecionada,
      guincho: cleanedData.guincho_selecionado,
      apreensao: cleanedData.apreensao_selecionada
    });

    return cleanedData;
  }
}
