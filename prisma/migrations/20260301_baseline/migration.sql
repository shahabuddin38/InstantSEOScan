-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "public"."ScanReport" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "normalizedUrl" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "results" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScanReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScanReport_userId_createdAt_idx" ON "public"."ScanReport"("userId" ASC, "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ScanReport_userId_normalizedUrl_createdAt_idx" ON "public"."ScanReport"("userId" ASC, "normalizedUrl" ASC, "createdAt" DESC);

