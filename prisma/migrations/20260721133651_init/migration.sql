-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "pIva" TEXT,
    "cFiscale" TEXT NOT NULL,
    "comuneResidenza" TEXT NOT NULL,
    "cap" TEXT NOT NULL,
    "via" TEXT,
    "numeroCivico" TEXT,
    "tipoClienteId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipologiaCliente" (
    "id" TEXT NOT NULL,
    "tipoCliente" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipologiaCliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Preventivo" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "dataScadenza" TIMESTAMP(3) NOT NULL,
    "totale" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Preventivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SezionePreventivo" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "preventivoId" TEXT NOT NULL,

    CONSTRAINT "SezionePreventivo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProdottoSezione" (
    "sezioneId" TEXT NOT NULL,
    "prodottoId" TEXT NOT NULL,
    "quantità" INTEGER NOT NULL,

    CONSTRAINT "ProdottoSezione_pkey" PRIMARY KEY ("sezioneId","prodottoId")
);

-- CreateTable
CREATE TABLE "Prodotto" (
    "id" TEXT NOT NULL,
    "codiceProdotto" TEXT NOT NULL,
    "codiceColore" TEXT NOT NULL,
    "descrizione" TEXT NOT NULL,
    "tipoProdottoId" TEXT NOT NULL,
    "produttoreId" TEXT NOT NULL,
    "dimensione" TEXT NOT NULL,
    "unitàPerScatola" INTEGER NOT NULL,
    "prezzo" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prodotto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produttore" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "sitoweb" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Produttore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipologiaProdotto" (
    "id" TEXT NOT NULL,
    "tipoProdotto" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipologiaProdotto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrdiniMagazzino" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT,
    "nome" TEXT NOT NULL,
    "tipologia" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrdiniMagazzino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProdottoOrdine" (
    "movimentoId" TEXT NOT NULL,
    "prodottoId" TEXT NOT NULL,
    "quantità" TEXT NOT NULL,

    CONSTRAINT "ProdottoOrdine_pkey" PRIMARY KEY ("movimentoId","prodottoId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_pIva_key" ON "Customer"("pIva");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_cFiscale_key" ON "Customer"("cFiscale");

-- CreateIndex
CREATE UNIQUE INDEX "TipologiaCliente_tipoCliente_key" ON "TipologiaCliente"("tipoCliente");

-- CreateIndex
CREATE UNIQUE INDEX "TipologiaProdotto_tipoProdotto_key" ON "TipologiaProdotto"("tipoProdotto");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_tipoClienteId_fkey" FOREIGN KEY ("tipoClienteId") REFERENCES "TipologiaCliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preventivo" ADD CONSTRAINT "Preventivo_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SezionePreventivo" ADD CONSTRAINT "SezionePreventivo_preventivoId_fkey" FOREIGN KEY ("preventivoId") REFERENCES "Preventivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdottoSezione" ADD CONSTRAINT "ProdottoSezione_sezioneId_fkey" FOREIGN KEY ("sezioneId") REFERENCES "SezionePreventivo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdottoSezione" ADD CONSTRAINT "ProdottoSezione_prodottoId_fkey" FOREIGN KEY ("prodottoId") REFERENCES "Prodotto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prodotto" ADD CONSTRAINT "Prodotto_tipoProdottoId_fkey" FOREIGN KEY ("tipoProdottoId") REFERENCES "TipologiaProdotto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prodotto" ADD CONSTRAINT "Prodotto_produttoreId_fkey" FOREIGN KEY ("produttoreId") REFERENCES "Produttore"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdottoOrdine" ADD CONSTRAINT "ProdottoOrdine_movimentoId_fkey" FOREIGN KEY ("movimentoId") REFERENCES "OrdiniMagazzino"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdottoOrdine" ADD CONSTRAINT "ProdottoOrdine_prodottoId_fkey" FOREIGN KEY ("prodottoId") REFERENCES "Prodotto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
