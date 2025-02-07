-- AlterTable
ALTER TABLE "Diagram" ADD COLUMN     "anonymousId" TEXT;

-- CreateIndex
CREATE INDEX "Diagram_anonymousId_idx" ON "Diagram"("anonymousId");
