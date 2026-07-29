-- AddForeignKey
ALTER TABLE "OrdiniMagazzino" ADD CONSTRAINT "OrdiniMagazzino_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
