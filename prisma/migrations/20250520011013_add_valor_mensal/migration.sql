/*
  Warnings:

  - Made the column `valorMensal` on table `Usuario` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Usuario" ALTER COLUMN "valorMensal" SET NOT NULL,
ALTER COLUMN "valorMensal" SET DEFAULT 0;
