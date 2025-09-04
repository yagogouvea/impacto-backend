-- AlterTable
ALTER TABLE "CheckList" ADD COLUMN     "liberado_local_selecionado" BOOLEAN DEFAULT false,
ADD COLUMN     "liberado_nome_responsavel" TEXT,
ADD COLUMN     "liberado_numero_referencia" TEXT;
