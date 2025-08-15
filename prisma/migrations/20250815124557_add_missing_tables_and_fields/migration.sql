-- AlterTable
ALTER TABLE "Cliente" ADD COLUMN     "cep" TEXT,
ADD COLUMN     "cidade" TEXT,
ADD COLUMN     "estado" TEXT,
ADD COLUMN     "logo" TEXT,
ADD COLUMN     "nome_fantasia" TEXT;

-- AlterTable
ALTER TABLE "Ocorrencia" ADD COLUMN     "passagem_servico" TEXT;

-- CreateTable
CREATE TABLE "ClienteAuth" (
    "id" SERIAL NOT NULL,
    "cliente_id" INTEGER NOT NULL,
    "cnpj_normalizado" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClienteAuth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioPrestador" (
    "id" SERIAL NOT NULL,
    "prestador_id" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsuarioPrestador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RastreamentoPrestador" (
    "id" SERIAL NOT NULL,
    "prestador_id" INTEGER NOT NULL,
    "ocorrencia_id" INTEGER,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "velocidade" DOUBLE PRECISION,
    "direcao" DOUBLE PRECISION,
    "altitude" DOUBLE PRECISION,
    "precisao" DOUBLE PRECISION,
    "bateria" INTEGER,
    "sinal_gps" TEXT,
    "observacoes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ativo',
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RastreamentoPrestador_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClienteAuth_cliente_id_key" ON "ClienteAuth"("cliente_id");

-- CreateIndex
CREATE UNIQUE INDEX "ClienteAuth_cnpj_normalizado_key" ON "ClienteAuth"("cnpj_normalizado");

-- CreateIndex
CREATE INDEX "ClienteAuth_cnpj_normalizado_idx" ON "ClienteAuth"("cnpj_normalizado");

-- CreateIndex
CREATE UNIQUE INDEX "UsuarioPrestador_email_key" ON "UsuarioPrestador"("email");

-- CreateIndex
CREATE INDEX "UsuarioPrestador_prestador_id_idx" ON "UsuarioPrestador"("prestador_id");

-- CreateIndex
CREATE INDEX "UsuarioPrestador_email_idx" ON "UsuarioPrestador"("email");

-- CreateIndex
CREATE INDEX "RastreamentoPrestador_prestador_id_idx" ON "RastreamentoPrestador"("prestador_id");

-- CreateIndex
CREATE INDEX "RastreamentoPrestador_ocorrencia_id_idx" ON "RastreamentoPrestador"("ocorrencia_id");

-- CreateIndex
CREATE INDEX "RastreamentoPrestador_timestamp_idx" ON "RastreamentoPrestador"("timestamp");

-- AddForeignKey
ALTER TABLE "ClienteAuth" ADD CONSTRAINT "fk_cliente_auth_cliente" FOREIGN KEY ("cliente_id") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioPrestador" ADD CONSTRAINT "fk_usuario_prestador" FOREIGN KEY ("prestador_id") REFERENCES "Prestador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RastreamentoPrestador" ADD CONSTRAINT "fk_rastreamento_prestador" FOREIGN KEY ("prestador_id") REFERENCES "Prestador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
