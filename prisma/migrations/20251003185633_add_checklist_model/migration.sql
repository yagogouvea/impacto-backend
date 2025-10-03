-- CreateTable
CREATE TABLE "CheckList" (
    "id" SERIAL NOT NULL,
    "ocorrencia_id" INTEGER NOT NULL,
    "loja_selecionada" BOOLEAN DEFAULT false,
    "nome_loja" TEXT,
    "endereco_loja" TEXT,
    "nome_atendente" TEXT,
    "matricula_atendente" TEXT,
    "guincho_selecionado" BOOLEAN DEFAULT false,
    "tipo_guincho" TEXT,
    "valor_guincho" TEXT,
    "telefone_guincho" TEXT,
    "nome_empresa_guincho" TEXT,
    "nome_motorista_guincho" TEXT,
    "destino_guincho" TEXT,
    "endereco_destino_guincho" TEXT,
    "apreensao_selecionada" BOOLEAN DEFAULT false,
    "nome_dp_batalhao" TEXT,
    "endereco_apreensao" TEXT,
    "numero_bo_noc" TEXT,
    "liberado_local_selecionado" BOOLEAN DEFAULT false,
    "liberado_nome_responsavel" TEXT,
    "liberado_numero_referencia" TEXT,
    "recuperado_com_chave" TEXT,
    "posse_veiculo" TEXT,
    "observacao_posse" TEXT,
    "avarias" TEXT,
    "detalhes_avarias" TEXT,
    "fotos_realizadas" TEXT,
    "justificativa_fotos" TEXT,
    "observacao_ocorrencia" TEXT,
    "dispensado_checklist" BOOLEAN DEFAULT false,
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CheckList_ocorrencia_id_idx" ON "CheckList"("ocorrencia_id");

-- CreateIndex
CREATE INDEX "CheckList_criado_em_idx" ON "CheckList"("criado_em");

-- CreateIndex
CREATE UNIQUE INDEX "CheckList_ocorrencia_id_key" ON "CheckList"("ocorrencia_id");

-- AddForeignKey
ALTER TABLE "CheckList" ADD CONSTRAINT "CheckList_ocorrencia_id_fkey" FOREIGN KEY ("ocorrencia_id") REFERENCES "Ocorrencia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
