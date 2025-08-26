-- Script para adicionar o campo sub_resultado na tabela Ocorrencia
-- Execute este script diretamente no seu banco PostgreSQL

-- Adicionar o campo sub_resultado se ele não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Ocorrencia' 
        AND column_name = 'sub_resultado'
    ) THEN
        ALTER TABLE "Ocorrencia" ADD COLUMN "sub_resultado" TEXT;
        RAISE NOTICE 'Campo sub_resultado adicionado com sucesso!';
    ELSE
        RAISE NOTICE 'Campo sub_resultado já existe!';
    END IF;
END $$;
