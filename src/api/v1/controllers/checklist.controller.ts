// TODO: Implementar modelo CheckList no schema.prisma
// Este arquivo está temporariamente comentado para evitar erros de build

import { Request, Response } from 'express';
import { CheckListService } from '../../../core/services/checklist.service';

export class CheckListController {
  private service: CheckListService;

  constructor() {
    this.service = new CheckListService();
  }

  // Métodos temporários que retornam erro
  async getByOcorrenciaId(req: Request, res: Response) {
    res.status(501).json({
      error: 'Funcionalidade temporariamente indisponível - modelo CheckList não implementado'
    });
  }

  async create(req: Request, res: Response) {
    res.status(501).json({
      error: 'Funcionalidade temporariamente indisponível - modelo CheckList não implementado'
    });
  }

  async update(req: Request, res: Response) {
    res.status(501).json({
      error: 'Funcionalidade temporariamente indisponível - modelo CheckList não implementado'
    });
  }

  async delete(req: Request, res: Response) {
    res.status(501).json({
      error: 'Funcionalidade temporariamente indisponível - modelo CheckList não implementado'
    });
  }
}