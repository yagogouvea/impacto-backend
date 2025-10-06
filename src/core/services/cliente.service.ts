import { PrismaClient } from '@prisma/client';

import { TipoContrato, RegiaoContrato } from '@prisma/client';

interface ContratoData {
  nome_interno?: string;
  tipo?: TipoContrato | string;
  regiao?: RegiaoContrato | string;
  valor_acionamento?: number;
  valor_nao_recuperado?: number;
  valor_hora_extra?: number;
  valor_km_extra?: number;
  franquia_horas?: string;
  franquia_km?: number;
  valor_km?: number;
  valor_base?: number;
  permite_negociacao?: boolean;
}

interface ClienteData {
  nome: string;
  nome_fantasia?: string;
  cnpj: string;
  contato?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  logo?: string;
  contratos?: ContratoData[];
}

// Função para normalizar CNPJ (remover pontos, traços e barras)
const normalizarCNPJ = (cnpj: string): string => {
  return cnpj.replace(/[.\-\/]/g, '');
};

export class ClienteService {
  constructor(private prisma: PrismaClient) {}

  async list() {
    try {
      console.log('🔍 [ClienteService] Listando clientes...');
      
      const clientes = await this.prisma.cliente.findMany({
        include: {
          contratos: true
        },
        orderBy: { nome: 'asc' }
      });
      
      console.log(`✅ [ClienteService] ${clientes.length} clientes encontrados`);
      return clientes;
    } catch (error) {
      console.error('❌ [ClienteService] Erro ao listar clientes:', error);
      throw error;
    }
  }

  async findById(id: number) {
    try {
      console.log(`🔍 [ClienteService] Buscando cliente ID: ${id}`);
      
      const cliente = await this.prisma.cliente.findUnique({
        where: { id },
        include: {
          contratos: true
        }
      });
      
      if (cliente) {
        console.log(`✅ [ClienteService] Cliente encontrado: ${cliente.nome}`);
      } else {
        console.log(`⚠️ [ClienteService] Cliente não encontrado: ${id}`);
      }
      
      return cliente;
    } catch (error) {
      console.error(`❌ [ClienteService] Erro ao buscar cliente ${id}:`, error);
      throw error;
    }
  }

  async create(data: ClienteData) {
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
          logo: data.logo,
          contratos: data.contratos && data.contratos.length > 0 ? {
            create: data.contratos.map(contrato => ({
              ...contrato,
              tipo: contrato.tipo as TipoContrato || null,
              regiao: contrato.regiao as RegiaoContrato || null
            }))
          } : undefined
        },
        include: {
          contratos: true
        }
      });
      
      console.log(`✅ [ClienteService] Cliente criado: ${cliente.nome} (ID: ${cliente.id})`);
      return cliente;
    } catch (error) {
      console.error('❌ [ClienteService] Erro ao criar cliente:', error);
      throw error;
    }
  }

  async update(id: number, data: Partial<ClienteData>) {
    try {
      console.log(`🔍 [ClienteService] Atualizando cliente ID: ${id}`);
      
      // Preparar dados para atualização
      const updateData: any = {};
      
      if (data.nome !== undefined) updateData.nome = data.nome;
      if (data.nome_fantasia !== undefined) updateData.nome_fantasia = data.nome_fantasia;
      if (data.contato !== undefined) updateData.contato = data.contato;
      if (data.telefone !== undefined) updateData.telefone = data.telefone;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.endereco !== undefined) updateData.endereco = data.endereco;
      if (data.cidade !== undefined) updateData.cidade = data.cidade;
      if (data.estado !== undefined) updateData.estado = data.estado;
      if (data.cep !== undefined) updateData.cep = data.cep;
      if (data.logo !== undefined) updateData.logo = data.logo;
      
      // Normalizar CNPJ se fornecido
      if (data.cnpj) {
        updateData.cnpj = normalizarCNPJ(data.cnpj);
      }

      // Processar contratos se fornecidos
      if (data.contratos !== undefined) {
        // Primeiro, deletar contratos existentes
        await this.prisma.contrato.deleteMany({
          where: { clienteId: id }
        });

        // Depois, criar novos contratos se houver
        if (Array.isArray(data.contratos) && data.contratos.length > 0) {
          await this.prisma.contrato.createMany({
            data: data.contratos.map(contrato => ({
              ...contrato,
              clienteId: id,
              tipo: contrato.tipo as TipoContrato || null,
              regiao: contrato.regiao as RegiaoContrato || null
            }))
          });
        }
      }

      const cliente = await this.prisma.cliente.update({
        where: { id },
        data: updateData,
        include: {
          contratos: true
        }
      });
      
      console.log(`✅ [ClienteService] Cliente atualizado: ${cliente.nome}`);
      return cliente;
    } catch (error) {
      console.error(`❌ [ClienteService] Erro ao atualizar cliente ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number) {
    try {
      console.log(`🔍 [ClienteService] Deletando cliente ID: ${id}`);
      
      // Primeiro, verificar se o cliente existe
      const cliente = await this.prisma.cliente.findUnique({
        where: { id },
        include: {
          contratos: true,
          camposAdicionais: true,
          auth: true
        }
      });
      
      if (!cliente) {
        throw new Error('Cliente não encontrado');
      }
      
      console.log(`📋 [ClienteService] Cliente encontrado: ${cliente.nome}`);
      console.log(`📊 [ClienteService] Dependências:`, {
        contratos: cliente.contratos.length,
        camposAdicionais: cliente.camposAdicionais.length,
        temAuth: !!cliente.auth
      });
      
      // Verificar se há ocorrências relacionadas
      const ocorrencias = await this.prisma.ocorrencia.findMany({
        where: {
          cliente: cliente.nome
        },
        select: {
          id: true,
          cliente: true,
          tipo: true,
          status: true
        }
      });
      
      if (ocorrencias.length > 0) {
        console.log(`⚠️ [ClienteService] Cliente possui ${ocorrencias.length} ocorrências relacionadas`);
        throw new Error(`Não é possível excluir o cliente pois existem ${ocorrencias.length} ocorrências relacionadas. Transfira ou exclua as ocorrências primeiro.`);
      }
      
      // Excluir dependências em ordem
      console.log(`🗑️ [ClienteService] Excluindo dependências...`);
      
      // 1. Excluir autenticação se existir
      if (cliente.auth) {
        await this.prisma.clienteAuth.delete({
          where: { cliente_id: id }
        });
        console.log(`✅ [ClienteService] Autenticação excluída`);
      }
      
      // 2. Excluir campos adicionais
      if (cliente.camposAdicionais.length > 0) {
        await this.prisma.campoAdicionalCliente.deleteMany({
          where: { clienteId: id }
        });
        console.log(`✅ [ClienteService] ${cliente.camposAdicionais.length} campos adicionais excluídos`);
      }
      
      // 3. Excluir contratos
      if (cliente.contratos.length > 0) {
        await this.prisma.contrato.deleteMany({
          where: { clienteId: id }
        });
        console.log(`✅ [ClienteService] ${cliente.contratos.length} contratos excluídos`);
      }
      
      // 4. Excluir o cliente
      const clienteExcluido = await this.prisma.cliente.delete({
        where: { id }
      });
      
      console.log(`✅ [ClienteService] Cliente deletado: ${clienteExcluido.nome}`);
      return clienteExcluido;
      
    } catch (error: any) {
      console.error(`❌ [ClienteService] Erro ao deletar cliente ${id}:`, error);
      
      // Melhorar mensagem de erro para foreign key constraints
      if (error?.code === 'P2003') {
        const constraint = error?.meta?.field_name;
        if (constraint) {
          throw new Error(`Não é possível excluir o cliente devido a dependências no banco de dados. Constraint: ${constraint}`);
        }
      }
      
      throw error;
    }
  }
} 