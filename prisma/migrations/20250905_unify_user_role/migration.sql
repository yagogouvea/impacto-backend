-- Passo Único (commit isolado): adicionar valor 'usuario' ao enum existente
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'usuario';

