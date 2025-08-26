import { Request, Response } from 'express';
import { CheckListService } from '@/core/services/checklist.service';
import { AppError } from '@/shared/errors/AppError';
import { sendResponse } from '../../../utils/response';

export class CheckListController {
  private service: CheckListService;

  constructor() {
    this.service = new CheckListService();
  }

  async findByOcorrenciaId(req: Request, res: Response) {
    try {
      const { ocorrenciaId } = req.params;
      console.log('[CheckListController] Buscando checklist para ocorrência:', ocorrenciaId);
      const checklist = await this.service.findByOcorrenciaId(parseInt(ocorrenciaId));
      console.log('[CheckListController] Checklist encontrado:', !!checklist);
      return res.json(checklist);
    } catch (error: unknown) {
      console.error('[CheckListController] Erro ao buscar checklist:', error);
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async create(req: Request, res: Response) {
    try {
      console.log('[CheckListController] Dados recebidos:', req.body);
      const checklist = await this.service.create(req.body);
      return res.status(201).json(checklist);
    } catch (error: unknown) {
      console.error('[CheckListController] Erro ao criar checklist:', error);
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
      }
      return res.status(500).json({ error: 'Erro interno do servidor', details: error instanceof Error ? error.message : String(error) });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const checklist = await this.service.update(parseInt(id), req.body);
      return res.json(checklist);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await this.service.delete(parseInt(id));
      return res.status(204).send();
    } catch (error: unknown) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
      }
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
