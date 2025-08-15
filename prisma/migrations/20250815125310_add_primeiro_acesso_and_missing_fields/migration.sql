-- AlterTable
ALTER TABLE "Ocorrencia" ADD COLUMN     "cidade_destino" TEXT,
ADD COLUMN     "hashRastreamento" TEXT,
ADD COLUMN     "km_acl" DOUBLE PRECISION,
ADD COLUMN     "operacao" TEXT,
ADD COLUMN     "planta_origem" TEXT;

-- AlterTable
ALTER TABLE "UsuarioPrestador" ADD COLUMN     "primeiro_acesso" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "RastreamentoPrestador" ADD CONSTRAINT "fk_rastreamento_ocorrencia" FOREIGN KEY ("ocorrencia_id") REFERENCES "Ocorrencia"("id") ON DELETE SET NULL ON UPDATE CASCADE;
