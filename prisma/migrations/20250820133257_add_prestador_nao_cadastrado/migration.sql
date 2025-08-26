-- CreateTable
CREATE TABLE "PrestadorNaoCadastrado" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "telefone" TEXT,
    "ocorrencia_id" INTEGER NOT NULL,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrestadorNaoCadastrado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PrestadorNaoCadastrado_ocorrencia_id_idx" ON "PrestadorNaoCadastrado"("ocorrencia_id");

-- AddForeignKey
ALTER TABLE "PrestadorNaoCadastrado" ADD CONSTRAINT "fk_prestador_nao_cadastrado_ocorrencia" FOREIGN KEY ("ocorrencia_id") REFERENCES "Ocorrencia"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
