-- CreateTable
CREATE TABLE "ApoioAdicional" (
    "id" SERIAL NOT NULL,
    "ocorrencia_id" INTEGER NOT NULL,
    "nome_prestador" TEXT NOT NULL,
    "is_prestador_cadastrado" BOOLEAN NOT NULL DEFAULT false,
    "prestador_id" INTEGER,
    "telefone" TEXT,
    "hora_inicial" TIMESTAMP(3),
    "hora_inicial_local" TIMESTAMP(3),
    "hora_final" TIMESTAMP(3),
    "km_inicial" DOUBLE PRECISION,
    "km_final" DOUBLE PRECISION,
    "franquia_km" BOOLEAN NOT NULL DEFAULT false,
    "observacoes" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 1,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApoioAdicional_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ApoioAdicional_ocorrencia_id_idx" ON "ApoioAdicional"("ocorrencia_id");

-- CreateIndex
CREATE INDEX "ApoioAdicional_prestador_id_idx" ON "ApoioAdicional"("prestador_id");

-- CreateIndex
CREATE INDEX "ApoioAdicional_criado_em_idx" ON "ApoioAdicional"("criado_em");

-- AddForeignKey
ALTER TABLE "ApoioAdicional" ADD CONSTRAINT "ApoioAdicional_ocorrencia_id_fkey" FOREIGN KEY ("ocorrencia_id") REFERENCES "Ocorrencia"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApoioAdicional" ADD CONSTRAINT "ApoioAdicional_prestador_id_fkey" FOREIGN KEY ("prestador_id") REFERENCES "Prestador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
