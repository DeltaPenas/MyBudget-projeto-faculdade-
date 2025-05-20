-- DropForeignKey
ALTER TABLE "Gasto" DROP CONSTRAINT "Gasto_usuarioId_fkey";

-- AddForeignKey
ALTER TABLE "Gasto" ADD CONSTRAINT "Gasto_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
