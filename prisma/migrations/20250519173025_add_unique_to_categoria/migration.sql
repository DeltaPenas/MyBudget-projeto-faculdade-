/*
  Warnings:

  - A unique constraint covering the columns `[titulo]` on the table `Categoria` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Categoria_titulo_key" ON "Categoria"("titulo");
