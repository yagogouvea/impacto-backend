-- AlterTable
ALTER TABLE "Ocorrencia" ADD COLUMN     "chegada_qth" TEXT,
ADD COLUMN     "data_chamado" TIMESTAMP(3),
ADD COLUMN     "data_recuperacao" TIMESTAMP(3),
ADD COLUMN     "destino" TEXT,
ADD COLUMN     "endereco_loja" TEXT,
ADD COLUMN     "hora_chamado" TEXT,
ADD COLUMN     "local_abordagem" TEXT,
ADD COLUMN     "nome_guincho" TEXT,
ADD COLUMN     "tipo_remocao" TEXT;
