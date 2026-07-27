/*
  Warnings:

  - You are about to drop the column `totale` on the `Preventivo` table. All the data in the column will be lost.
  - You are about to alter the column `prezzo` on the `Prodotto` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - Added the required column `prezzo` to the `ProdottoSezione` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Preventivo" DROP COLUMN "totale";

-- AlterTable
ALTER TABLE "Prodotto" ALTER COLUMN "prezzo" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "ProdottoSezione" ADD COLUMN     "prezzo" DECIMAL(10,2) NOT NULL;
