import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ensurePrisma } from '../../../lib/prisma';

export class FinanceiroController {
  
  /**
   * Endpoint para Controle Detalhado - Lista todas as ocorrências com dados financeiros
   */
  async controleDetalhado(req: Request, res: Response) {
    try {
      const db = await ensurePrisma();
      if (!db) {
        return res.status(500).json({ error: 'Erro de conexão com o banco de dados' });
      }

      const { 
        periodo = 'mes_atual',
        dataInicio,
        dataFim,
        cliente = 'todos',
        operador = 'todos',
        busca = ''
      } = req.query;

      console.log('🔍 [FinanceiroController] Controle Detalhado - Parâmetros:', {
        periodo, dataInicio, dataFim, cliente, operador, busca
      });

      // Construir filtros de data
      let whereClause: any = {};

      if (periodo === 'mes_atual') {
        const agora = new Date();
        const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
        const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59);
        whereClause.data_acionamento = {
          gte: inicioMes,
          lte: fimMes
        };
      } else if (periodo === '7dias') {
        const fim = new Date();
        const inicio = new Date(fim.getTime() - 7 * 24 * 60 * 60 * 1000);
        whereClause.data_acionamento = {
          gte: inicio,
          lte: fim
        };
      } else if (periodo === '30dias') {
        const fim = new Date();
        const inicio = new Date(fim.getTime() - 30 * 24 * 60 * 60 * 1000);
        whereClause.data_acionamento = {
          gte: inicio,
          lte: fim
        };
      } else if (periodo === 'personalizado' && dataInicio && dataFim) {
        whereClause.data_acionamento = {
          gte: new Date(dataInicio as string),
          lte: new Date(dataFim as string)
        };
      }

      // Filtros adicionais
      if (cliente !== 'todos') {
        whereClause.cliente = cliente;
      }

      if (operador !== 'todos') {
        whereClause.operador = operador;
      }

      // Busca por texto
      if (busca) {
        whereClause.OR = [
          { placa1: { contains: busca as string, mode: 'insensitive' } },
          { cliente: { contains: busca as string, mode: 'insensitive' } },
          { endereco: { contains: busca as string, mode: 'insensitive' } },
          { prestador: { contains: busca as string, mode: 'insensitive' } }
        ];
      }

      console.log('🔍 [FinanceiroController] Where clause:', JSON.stringify(whereClause, null, 2));

      const ocorrencias = await db.ocorrencia.findMany({
        where: whereClause,
        include: {
          fotos: true,
          checklist: {
            select: {
              id: true,
              observacao_ocorrencia: true,
              dispensado_checklist: true
            }
          },
          apoios_adicionais: {
            include: {
              prestador: {
                select: {
                  id: true,
                  nome: true,
                  cod_nome: true,
                  telefone: true,
                  valor_acionamento: true,
                  franquia_horas: true,
                  franquia_km: true,
                  valor_hora_adc: true,
                  valor_km_adc: true
                }
              }
            }
          },
          pagamentos_customizados: {
            include: {
              prestador: {
                select: {
                  id: true,
                  nome: true,
                  cod_nome: true
                }
              }
            }
          }
        },
        orderBy: {
          data_acionamento: 'desc'
        }
      });

      console.log(`✅ [FinanceiroController] Controle Detalhado - ${ocorrencias.length} ocorrências encontradas`);

      // Processar dados para incluir cálculos financeiros
      const ocorrenciasProcessadas = ocorrencias.map(ocorrencia => {
        // Calcular despesas totais
        let despesasTotal = 0;
        if (ocorrencia.despesas_detalhadas) {
          try {
            const despesas = Array.isArray(ocorrencia.despesas_detalhadas) 
              ? ocorrencia.despesas_detalhadas 
              : JSON.parse(ocorrencia.despesas_detalhadas as string);
            
            despesasTotal = despesas.reduce((acc: number, d: any) => acc + (Number(d?.valor) || 0), 0);
          } catch (error) {
            console.warn('⚠️ [FinanceiroController] Erro ao processar despesas detalhadas:', error);
          }
        }

        // Calcular km total
        const kmTotal = (ocorrencia.km_final && ocorrencia.km_inicial) 
          ? Number(ocorrencia.km_final) - Number(ocorrencia.km_inicial)
          : null;

        // Calcular tempo total (chegada até término)
        let tempoTotal = null;
        if (ocorrencia.chegada && ocorrencia.termino) {
          const chegada = new Date(ocorrencia.chegada);
          const termino = new Date(ocorrencia.termino);
          const diffMs = termino.getTime() - chegada.getTime();
          const diffHours = diffMs / (1000 * 60 * 60);
          tempoTotal = diffHours;
        }

        // Determinar o parecer (priorizar checklist, depois descrição)
        let parecer = '';
        if (ocorrencia.checklist?.observacao_ocorrencia) {
          parecer = ocorrencia.checklist.observacao_ocorrencia;
        } else if (ocorrencia.descricao) {
          parecer = ocorrencia.descricao;
        }

        return {
          ...ocorrencia,
          despesas_total: despesasTotal,
          km_total: kmTotal,
          tempo_total_horas: tempoTotal,
          parecer: parecer
        };
      });

      res.json(ocorrenciasProcessadas);

    } catch (error) {
      console.error('❌ [FinanceiroController] Erro no controle detalhado:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  /**
   * Endpoint para Controle Prestadores - Dados financeiros por prestador
   */
  async controlePrestadores(req: Request, res: Response) {
    try {
      const db = await ensurePrisma();
      if (!db) {
        return res.status(500).json({ error: 'Erro de conexão com o banco de dados' });
      }

      const { 
        periodo = 'mes_atual',
        dataInicio,
        dataFim,
        busca = ''
      } = req.query;

      console.log('🔍 [FinanceiroController] Controle Prestadores - Parâmetros:', {
        periodo, dataInicio, dataFim, busca
      });

      // Construir filtros de data
      let whereClause: any = {
        status: {
          not: 'em_andamento' // Apenas ocorrências finalizadas
        }
      };

      if (periodo === 'mes_atual') {
        const agora = new Date();
        const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
        const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59);
        whereClause.data_acionamento = {
          gte: inicioMes,
          lte: fimMes
        };
      } else if (periodo === '7dias') {
        const fim = new Date();
        const inicio = new Date(fim.getTime() - 7 * 24 * 60 * 60 * 1000);
        whereClause.data_acionamento = {
          gte: inicio,
          lte: fim
        };
      } else if (periodo === '30dias') {
        const fim = new Date();
        const inicio = new Date(fim.getTime() - 30 * 24 * 60 * 60 * 1000);
        whereClause.data_acionamento = {
          gte: inicio,
          lte: fim
        };
      } else if (periodo === 'personalizado' && dataInicio && dataFim) {
        whereClause.data_acionamento = {
          gte: new Date(dataInicio as string),
          lte: new Date(dataFim as string)
        };
      }

      // Busca por prestador
      if (busca) {
        whereClause.prestador = { contains: busca as string, mode: 'insensitive' };
      }

      console.log('🔍 [FinanceiroController] Where clause:', JSON.stringify(whereClause, null, 2));

      const ocorrencias = await db.ocorrencia.findMany({
        where: whereClause,
        include: {
          pagamentos_customizados: {
            include: {
              prestador: {
                select: {
                  id: true,
                  nome: true,
                  cod_nome: true,
                  telefone: true,
                  valor_acionamento: true,
                  franquia_horas: true,
                  franquia_km: true,
                  valor_hora_adc: true,
                  valor_km_adc: true
                }
              }
            }
          },
          apoios_adicionais: {
            include: {
              prestador: {
                select: {
                  id: true,
                  nome: true,
                  cod_nome: true,
                  telefone: true,
                  valor_acionamento: true,
                  franquia_horas: true,
                  franquia_km: true,
                  valor_hora_adc: true,
                  valor_km_adc: true
                }
              }
            }
          }
        },
        orderBy: {
          data_acionamento: 'desc'
        }
      });

      console.log(`✅ [FinanceiroController] Controle Prestadores - ${ocorrencias.length} ocorrências encontradas`);

      // Buscar todos os prestadores cadastrados
      const prestadoresCadastrados = await db.prestador.findMany({
        select: {
          id: true,
          nome: true,
          cod_nome: true,
          telefone: true,
          valor_acionamento: true,
          franquia_horas: true,
          franquia_km: true,
          valor_hora_adc: true,
          valor_km_adc: true
        }
      });

      // Agrupar dados por prestador
      const prestadoresMap = new Map();

      ocorrencias.forEach(ocorrencia => {
        // Prestador principal da ocorrência
        if (ocorrencia.prestador) {
          const nomePrestador = ocorrencia.prestador.trim();
          
          // Buscar prestador cadastrado pelo nome
          const prestadorCadastrado = prestadoresCadastrados.find((p: any) => 
            p.nome.toLowerCase().includes(nomePrestador.toLowerCase()) ||
            p.cod_nome?.toLowerCase().includes(nomePrestador.toLowerCase())
          );
          
          const isCadastrado = !!prestadorCadastrado;
          
          if (!prestadoresMap.has(nomePrestador)) {
            prestadoresMap.set(nomePrestador, {
              nome: nomePrestador,
              is_cadastrado: isCadastrado,
              prestador_data: isCadastrado ? prestadorCadastrado : null,
              ocorrencias: [],
              total_acionamentos: 0,
              total_horas_adicionais: 0,
              total_km: 0,
              total_km_adicionais: 0,
              total_despesas: 0,
              total_valor_acionamento: 0,
              total_valor_hora_adc: 0,
              total_valor_km_adc: 0,
              tem_parecer: false,
              pareceres_count: 0,
              status_cadastro: 'aguardando' // Status inicial
            });
          }

          const prestadorData = prestadoresMap.get(nomePrestador);
          prestadorData.ocorrencias.push(ocorrencia);

          // Calcular valores
          const kmTotal = (ocorrencia.km_final && ocorrencia.km_inicial) 
            ? Number(ocorrencia.km_final) - Number(ocorrencia.km_inicial)
            : 0;

          const tempoTotal = (ocorrencia.chegada && ocorrencia.termino) 
            ? (new Date(ocorrencia.termino).getTime() - new Date(ocorrencia.chegada).getTime()) / (1000 * 60 * 60)
            : 0;

          let despesasTotal = 0;
          if (ocorrencia.despesas_detalhadas) {
            try {
              const despesas = Array.isArray(ocorrencia.despesas_detalhadas) 
                ? ocorrencia.despesas_detalhadas 
                : JSON.parse(ocorrencia.despesas_detalhadas as string);
              
              despesasTotal = despesas.reduce((acc: number, d: any) => acc + (Number(d?.valor) || 0), 0);
            } catch (error) {
              console.warn('⚠️ [FinanceiroController] Erro ao processar despesas:', error);
            }
          }

          prestadorData.total_acionamentos += 1;
          prestadorData.total_km += kmTotal;
          prestadorData.total_despesas += despesasTotal;

          // Calcular valores financeiros para prestador principal
          if (isCadastrado && prestadorCadastrado) {
            const valorAcionamento = Number(prestadorCadastrado.valor_acionamento || 0);
            const valorHoraAdc = Number(prestadorCadastrado.valor_hora_adc || 0);
            const valorKmAdc = Number(prestadorCadastrado.valor_km_adc || 0);

            // Verificar se os valores estão preenchidos
            const temValoresCompletos = valorAcionamento > 0 && valorHoraAdc > 0 && valorKmAdc > 0;

            if (temValoresCompletos) {
              // Usar valores do prestador cadastrado, mas SEMPRE com franquias padrão (3h e 50km)
              const franquiaHoras = 3; // SEMPRE usar 3 horas como franquia padrão
              const franquiaKm = 50; // SEMPRE usar 50 km como franquia padrão

              // Calcular horas e km adicionais baseado nas franquias padrão
              const horasAdicionais = Math.max(0, tempoTotal - franquiaHoras);
              const kmAdicionais = Math.max(0, kmTotal - franquiaKm);

              // Se ainda não foi definido como "aguardando", calcular valores
              if (prestadorData.total_valor_acionamento !== 'aguardando cadastro') {
                prestadorData.total_valor_acionamento += valorAcionamento;
                prestadorData.total_valor_hora_adc += (horasAdicionais * valorHoraAdc);
                prestadorData.total_valor_km_adc += (kmAdicionais * valorKmAdc);
              }
              prestadorData.status_cadastro = 'cadastrado';
            } else {
              // Prestador cadastrado mas valores não preenchidos - aguardando cadastro
              prestadorData.total_valor_acionamento = 'aguardando cadastro';
              prestadorData.total_valor_hora_adc = 'aguardando cadastro';
              prestadorData.total_valor_km_adc = 'aguardando cadastro';
              prestadorData.status_cadastro = 'aguardando cadastro';
            }
          } else {
            // Prestador não cadastrado - aguardando cadastro
            prestadorData.total_valor_acionamento = 'aguardando cadastro';
            prestadorData.total_valor_hora_adc = 'aguardando cadastro';
            prestadorData.total_valor_km_adc = 'aguardando cadastro';
            prestadorData.status_cadastro = 'aguardando cadastro';
          }

          // Verificar se tem parecer
          if ((ocorrencia as any).checklist?.observacao_ocorrencia || ocorrencia.descricao) {
            prestadorData.tem_parecer = true;
            prestadorData.pareceres_count += 1;
          }
        }

        // Apoios adicionais
        ocorrencia.apoios_adicionais.forEach(apoio => {
          const nomePrestador = apoio.nome_prestador.trim();
          
          // Verificar se o prestador está realmente cadastrado
          const isCadastrado = apoio.is_prestador_cadastrado && apoio.prestador && apoio.prestador.id;
          
          if (!prestadoresMap.has(nomePrestador)) {
            prestadoresMap.set(nomePrestador, {
              nome: nomePrestador,
              is_cadastrado: isCadastrado,
              prestador_data: isCadastrado ? apoio.prestador : null,
              ocorrencias: [],
              total_acionamentos: 0,
              total_horas_adicionais: 0,
              total_km: 0,
              total_km_adicionais: 0,
              total_despesas: 0,
              total_valor_acionamento: 0,
              total_valor_hora_adc: 0,
              total_valor_km_adc: 0,
              tem_parecer: false,
              pareceres_count: 0,
              status_cadastro: 'aguardando' // Status inicial
            });
          }

          const prestadorData = prestadoresMap.get(nomePrestador);
          
          // Calcular valores para apoio adicional
          const kmTotal = (apoio.km_final && apoio.km_inicial) 
            ? Number(apoio.km_final) - Number(apoio.km_inicial)
            : 0;

          const tempoTotal = (apoio.hora_inicial && apoio.hora_final) 
            ? (new Date(apoio.hora_final).getTime() - new Date(apoio.hora_inicial).getTime()) / (1000 * 60 * 60)
            : 0;

          prestadorData.total_acionamentos += 1;
          prestadorData.total_km += kmTotal;
          prestadorData.total_horas_adicionais += tempoTotal;

          // Calcular valores financeiros
          if (isCadastrado && apoio.prestador) {
            const valorAcionamento = Number(apoio.prestador.valor_acionamento || 0);
            const valorHoraAdc = Number(apoio.prestador.valor_hora_adc || 0);
            const valorKmAdc = Number(apoio.prestador.valor_km_adc || 0);

            // Verificar se os valores estão preenchidos
            const temValoresCompletos = valorAcionamento > 0 && valorHoraAdc > 0 && valorKmAdc > 0;

            if (temValoresCompletos) {
              // Usar valores do prestador cadastrado, mas SEMPRE com franquias padrão (3h e 50km)
              const franquiaHoras = 3; // SEMPRE usar 3 horas como franquia padrão
              const franquiaKm = 50; // SEMPRE usar 50 km como franquia padrão

              // Calcular horas e km adicionais baseado nas franquias padrão
              const horasAdicionais = Math.max(0, tempoTotal - franquiaHoras);
              const kmAdicionais = Math.max(0, kmTotal - franquiaKm);

              // Se ainda não foi definido como "aguardando", calcular valores
              if (prestadorData.total_valor_acionamento !== 'aguardando cadastro') {
                prestadorData.total_valor_acionamento += valorAcionamento;
                prestadorData.total_valor_hora_adc += (horasAdicionais * valorHoraAdc);
                prestadorData.total_valor_km_adc += (kmAdicionais * valorKmAdc);
              }
              prestadorData.status_cadastro = 'cadastrado';
            } else {
              // Prestador cadastrado mas valores não preenchidos - aguardando cadastro
              prestadorData.total_valor_acionamento = 'aguardando cadastro';
              prestadorData.total_valor_hora_adc = 'aguardando cadastro';
              prestadorData.total_valor_km_adc = 'aguardando cadastro';
              prestadorData.status_cadastro = 'aguardando cadastro';
            }
          } else {
            // Prestador não cadastrado - aguardando cadastro
            prestadorData.total_valor_acionamento = 'aguardando cadastro';
            prestadorData.total_valor_hora_adc = 'aguardando cadastro';
            prestadorData.total_valor_km_adc = 'aguardando cadastro';
            prestadorData.status_cadastro = 'aguardando cadastro';
          }
        });
      });

      // Converter Map para Array e ordenar por nome
      const prestadores = Array.from(prestadoresMap.values()).sort((a, b) => 
        a.nome.localeCompare(b.nome)
      );

      console.log(`✅ [FinanceiroController] Controle Prestadores - ${prestadores.length} prestadores únicos encontrados`);

      res.json(prestadores);

    } catch (error) {
      console.error('❌ [FinanceiroController] Erro no controle prestadores:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }

  /**
   * Endpoint para buscar prestadores cadastrados (para autocomplete)
   */
  async buscarPrestadores(req: Request, res: Response) {
    try {
      const db = await ensurePrisma();
      if (!db) {
        return res.status(500).json({ error: 'Erro de conexão com o banco de dados' });
      }

      const { busca = '' } = req.query;

      const prestadores = await db.prestador.findMany({
        where: {
          OR: [
            { nome: { contains: busca as string, mode: 'insensitive' } },
            { cod_nome: { contains: busca as string, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          nome: true,
          cod_nome: true,
          telefone: true,
          valor_acionamento: true,
          franquia_horas: true,
          franquia_km: true,
          valor_hora_adc: true,
          valor_km_adc: true
        },
        orderBy: {
          nome: 'asc'
        },
        take: 50
      });

      console.log(`✅ [FinanceiroController] Buscar Prestadores - ${prestadores.length} prestadores encontrados`);

      res.json(prestadores);

    } catch (error) {
      console.error('❌ [FinanceiroController] Erro ao buscar prestadores:', error);
      res.status(500).json({ 
        error: 'Erro interno do servidor',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  }
}
