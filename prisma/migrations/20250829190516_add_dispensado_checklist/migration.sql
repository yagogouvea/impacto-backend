/*
  Warnings:

  - You are about to drop the column `dispensar_checklist` on the `CheckList` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CheckList" DROP COLUMN "dispensar_checklist",
ADD COLUMN     "dispensado_checklist" BOOLEAN DEFAULT false;
