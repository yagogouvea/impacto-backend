import { Router } from 'express';
import { authenticateToken } from '@/infrastructure/middleware/auth.middleware';
import { PrestadorController } from '../../../controllers/prestador.controller';
import { ensurePrisma } from '../../../lib/prisma';

import prestadoresRouter from './prestadores.routes';
import clientesRouter from './clientes.routes';
import veiculosRouter from './veiculos.routes';
import fotosRouter from './fotos.routes';
import relatoriosRouter from './relatorios.routes';
import userRouter from './user.routes';
import monitoramentoRouter from './monitoramento.routes';
import ocorrenciasRouter from './ocorrencias.routes';
import { checkListRoutes } from './checklist.routes';
import apoiosAdicionaisRouter from './apoios-adicionais.routes';
import { financeiroRoutes } from './financeiro.routes';

const v1Router = Router();
const prestadorController = new PrestadorController();

// Rotas públicas (sem autenticação)
v1Router.use('/prestadores', prestadoresRouter); // Rotas públicas e protegidas estão no próprio router
v1Router.use('/ocorrencias', ocorrenciasRouter); // Rotas públicas e protegidas estão no próprio router
v1Router.use('/apoios-adicionais', apoiosAdicionaisRouter); // Rotas para apoios adicionais

// ✅ ROTA - Criar prestador não cadastrado - PÚBLICA
v1Router.post('/prestadores-nao-cadastrados', async (req, res) => {
  try {
    const { nome, telefone, ocorrencia_id } = req.body;

    // Validação dos campos obrigatórios
    if (!nome || !nome.trim()) {
      return res.status(400).json({ 
        error: 'Nome do prestador é obrigatório' 
      });
    }

    if (!ocorrencia_id) {
      return res.status(400).json({ 
        error: 'ID da ocorrência é obrigatório' 
      });
    }

    const db = await ensurePrisma();
    if (!db) {
      return res.status(500).json({ 
        error: 'Erro de conexão com o banco de dados' 
      });
    }

    // Verificar se a ocorrência existe
    const ocorrencia = await db.ocorrencia.findUnique({
      where: { id: Number(ocorrencia_id) }
    });

    if (!ocorrencia) {
      return res.status(404).json({ 
        error: 'Ocorrência não encontrada' 
      });
    }

    // SOLUÇÃO TEMPORÁRIA: Atualizar o campo 'prestador' na ocorrência
    const ocorrenciaAtualizada = await db.ocorrencia.update({
      where: { id: Number(ocorrencia_id) },
      data: {
        prestador: nome.trim()
      }
    });

    console.log(`✅ Prestador não cadastrado adicionado à ocorrência ${ocorrencia_id}: ${nome.trim()}`);

    res.status(201).json({
      message: 'Prestador não cadastrado adicionado com sucesso',
      prestador: {
        nome: nome.trim(),
        telefone: telefone ? telefone.trim() : null,
        ocorrencia_id: Number(ocorrencia_id)
      },
      ocorrencia: {
        id: ocorrenciaAtualizada.id,
        prestador: ocorrenciaAtualizada.prestador
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar prestador não cadastrado:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Rotas protegidas (com autenticação)
v1Router.use('/clientes', authenticateToken, clientesRouter);
v1Router.use('/veiculos', authenticateToken, veiculosRouter);
// v1Router.use('/fotos', authenticateToken, fotosRouter); // TEMPORARIAMENTE COMENTADO PARA TESTE
v1Router.use('/fotos', fotosRouter); // SEM AUTENTICAÇÃO TEMPORARIAMENTE
v1Router.use('/relatorios', authenticateToken, relatoriosRouter);
v1Router.use('/users', authenticateToken, userRouter);
v1Router.use('/monitoramento', authenticateToken, monitoramentoRouter);
v1Router.use('/checklist', checkListRoutes);
v1Router.use('/financeiro', financeiroRoutes);

export default v1Router; 