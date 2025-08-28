import { Request, Response } from 'express';
import { prisma, ensurePrisma } from '@/lib/prisma';
import { hashPassword } from '@/utils/auth';
import { validateUserData } from '@/utils/validation';
import logger from '@/infrastructure/logger';
import bcrypt from 'bcryptjs';
import { CreateUserDTO, UpdateUserDTO } from '../types/prisma';
import { Prisma } from '@prisma/client';
import { UserRole } from '@prisma/client';
import { AppError } from '@/shared/errors/AppError';

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  permissions?: string[];
  active?: boolean;
}

interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: UserRole;
  permissions?: string[];
  active?: boolean;
}

export class UserController {
  async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.sub }, // Usando sub em vez de id
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          permissions: true,
          active: true
        }
      });

      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      res.json(user);
    } catch (error: unknown) {
      logger.error('Erro ao buscar usuário atual:', error);
      res.status(500).json({ error: 'Erro ao buscar usuário atual' });
    }
  }

  async updateCurrentUser(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const { name, email } = req.body;

      const user = await prisma.user.update({
        where: { id: req.user.sub }, // Usando sub em vez de id
        data: { name, email },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          permissions: true,
          active: true
        }
      });

      res.json(user);
    } catch (error: unknown) {
      logger.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  }

  async updatePassword(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      const user = await prisma.user.findUnique({
        where: { id: req.user.sub } // Usando sub em vez de id
      });

      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      const validPassword = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!validPassword) {
        res.status(400).json({ error: 'Senha atual incorreta' });
        return;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: req.user.sub }, // Usando sub em vez de id
        data: { passwordHash: hashedPassword }
      });

      res.json({ message: 'Senha atualizada com sucesso' });
    } catch (error: unknown) {
      logger.error('Erro ao atualizar senha:', error);
      res.status(500).json({ error: 'Erro ao atualizar senha' });
    }
  }

  async list(_req: Request, res: Response): Promise<void> {
    try {
      console.log('🔄 LIST USERS - Buscando usuários...');
      
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          permissions: true,
          active: true
        }
      });

      console.log('✅ LIST USERS - Usuários encontrados:', users.length);
      console.log('✅ LIST USERS - Permissions do primeiro usuário:', users[0]?.permissions);

      res.json(users);
    } catch (error: unknown) {
      logger.error('Erro ao listar usuários:', error);
      res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body as CreateUserRequest;

      // Validação dos campos obrigatórios
      if (!data.name || !data.email || !data.password || !data.role) {
        throw new AppError('Campos obrigatórios faltando: name, email, password, role', 400);
      }

      // Validação e conversão do role
      if (!Object.values(UserRole).includes(data.role)) {
        throw new AppError('Role inválido', 400);
      }

      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          passwordHash: hashedPassword,
          role: data.role,
          permissions: data.permissions ? JSON.stringify(data.permissions) : '[]',
          active: data.active ?? true
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          permissions: true,
          active: true
        }
      });

      res.status(201).json(user);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
        return;
      }
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          permissions: true,
          active: true
        }
      });

      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      res.json(user);
    } catch (error: unknown) {
      logger.error('Erro ao buscar usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body as UpdateUserRequest;

      console.log('🔄 UPDATE USER - ID:', id);
      console.log('🔄 UPDATE USER - Data recebida:', data);
      console.log('🔄 UPDATE USER - Permissions recebidas:', data.permissions);

      const user = await prisma.user.update({
        where: { id },
        data: {
          name: data.name,
          email: data.email,
          role: data.role,
          permissions: data.permissions ? JSON.stringify(data.permissions) : undefined,
          active: data.active
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          permissions: true,
          active: true
        }
      });

      console.log('✅ UPDATE USER - Usuário atualizado:', user);
      console.log('✅ UPDATE USER - Permissions salvas:', user.permissions);

      res.json(user);
    } catch (error: unknown) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error instanceof Error ? error.message : String(error) });
        return;
      }
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.user.delete({
        where: { id }
      });

      res.status(204).send();
    } catch (error: unknown) {
      logger.error('Erro ao deletar usuário:', error);
      res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const db = await ensurePrisma();

      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          permissions: true,
          active: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      res.json(user);
    } catch (error: unknown) {
      logger.error('Erro ao buscar usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
  }

  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const db = await ensurePrisma();

      const updateData: Prisma.UserUpdateInput = {
        ...req.body,
        updatedAt: new Date()
      };

      const user = await db.user.update({
        where: { id: userId },
        data: updateData
      });

      res.json(user);
    } catch (error: unknown) {
      logger.error('Erro ao atualizar usuário:', error);
      res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  }

  async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ error: 'Usuário não autenticado' });
        return;
      }

      const db = await ensurePrisma();
      const user = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          permissions: true,
          active: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      // Atualizar último acesso
      await db.user.update({
        where: { id: userId },
        data: { updatedAt: new Date() }
      });

      res.json(user);
    } catch (error: unknown) {
      logger.error('Erro ao buscar perfil do usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar perfil do usuário' });
    }
  }

  async getAllUsers(_req: Request, res: Response): Promise<void> {
    try {
      const db = await ensurePrisma();
      const users = await db.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          permissions: true,
          active: true,
          createdAt: true,
          updatedAt: true
        }
      });

      res.json(users);
    } catch (error: unknown) {
      logger.error('Erro ao listar usuários:', error);
      res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, passwordHash, name, role, permissions } = req.body;

      // Validação dos dados
      const validationError = validateUserData({ email, passwordHash, name, role });
      if (validationError) {
        res.status(400).json({ error: validationError });
        return;
      }

      const db = await ensurePrisma();
      const userData: Prisma.UserCreateInput = {
        email,
        name,
        passwordHash: await hashPassword(passwordHash),
        role,
        permissions: permissions || '[]',
        active: true
      };

      const user = await db.user.create({
        data: userData
      });

      // Remove senha do objeto retornado
      const { passwordHash: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error: unknown) {
      logger.error('Erro ao criar usuário:', error);
      if ((error as any)?.code === 'P2002') {
        res.status(400).json({ error: 'Email já está em uso' });
      } else {
        res.status(500).json({ error: 'Erro ao criar usuário' });
      }
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 6) {
        res.status(400).json({ error: 'Nova senha deve ter pelo menos 6 caracteres' });
        return;
      }

      const db = await ensurePrisma();
      const user = await db.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      const hashedPassword = await hashPassword(newPassword);

      await db.user.update({
        where: { id: userId },
        data: {
          passwordHash: hashedPassword,
          updatedAt: new Date()
        }
      });

      res.json({ message: 'Senha atualizada com sucesso' });
    } catch (error: unknown) {
      logger.error('Erro ao resetar senha:', error);
      res.status(500).json({ error: 'Erro ao resetar senha' });
    }
  }

  async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const db = await ensurePrisma();

      await db.user.delete({
        where: { id: userId }
      });

      res.json({ message: 'Usuário excluído com sucesso' });
    } catch (error: unknown) {
      logger.error('Erro ao excluir usuário:', error);
      res.status(500).json({ error: 'Erro ao excluir usuário' });
    }
  }
} 