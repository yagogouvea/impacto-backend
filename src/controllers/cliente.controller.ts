import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ClienteService } from '../core/services/cliente.service';

export class ClienteController {
  private service: ClienteService;

  constructor() {
    this.service = new ClienteService(prisma);
  }

  list = async (_req: Request, res: Response): Promise<void> => {
    try {
      const clientes = await this.service.list();
      res.json(clientes);
    } catch (error: unknown) {
      console.error('Erro ao listar clientes:', error);
      res.status(500).json({ error: 'Erro ao listar clientes' });
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }
      
      const cliente = await this.service.findById(id);
      
      if (!cliente) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
      }
      
      res.json(cliente);
    } catch (error: unknown) {
      console.error('Erro ao buscar cliente:', error);
      res.status(500).json({ error: 'Erro ao buscar cliente' });
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('📝 Criando cliente com dados:', req.body);
      const cliente = await this.service.create(req.body);
      console.log('✅ Cliente criado:', cliente);
      res.status(201).json(cliente);
    } catch (error: unknown) {
      console.error('Erro ao criar cliente:', error);
      res.status(500).json({ error: 'Erro ao criar cliente' });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      console.log('📝 Atualizando cliente ID:', id, 'com dados:', req.body);
      const cliente = await this.service.update(id, req.body);
      
      if (!cliente) {
        res.status(404).json({ error: 'Cliente não encontrado' });
        return;
      }
      
      console.log('✅ Cliente atualizado:', cliente);
      res.json(cliente);
    } catch (error: unknown) {
      console.error('Erro ao atualizar cliente:', error);
      res.status(500).json({ error: 'Erro ao atualizar cliente' });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      console.log(`🗑️ [ClienteController] Tentando excluir cliente ID: ${id}`);
      await this.service.delete(id);
      
      console.log(`✅ [ClienteController] Cliente ${id} excluído com sucesso`);
      res.status(204).send();
      
    } catch (error: unknown) {
      console.error('❌ [ClienteController] Erro ao deletar cliente:', error);
      
      // Tratamento específico de erros
      if (error instanceof Error) {
        if (error.message.includes('não encontrado')) {
          res.status(404).json({ error: error.message });
          return;
        }
        
        if (error.message.includes('ocorrências relacionadas')) {
          res.status(400).json({ 
            error: error.message,
            code: 'HAS_RELATED_OCCURRENCES'
          });
          return;
        }
        
        if (error.message.includes('dependências no banco de dados')) {
          res.status(400).json({ 
            error: error.message,
            code: 'DATABASE_CONSTRAINT_VIOLATION'
          });
          return;
        }
      }
      
      res.status(500).json({ 
        error: 'Erro interno ao deletar cliente',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      });
    }
  };
} 