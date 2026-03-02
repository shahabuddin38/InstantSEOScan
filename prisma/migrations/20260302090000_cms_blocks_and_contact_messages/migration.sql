-- AlterTable
ALTER TABLE "public"."BlogPost"
ADD COLUMN IF NOT EXISTS "excerpt" TEXT,
ADD COLUMN IF NOT EXISTS "blocks" JSONB,
ADD COLUMN IF NOT EXISTS "coverImage" TEXT,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE "public"."BlogPost"
ALTER COLUMN "author" SET DEFAULT 'Admin';

-- CreateTable
CREATE TABLE IF NOT EXISTS "public"."ContactMessage" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'new',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ContactMessage_status_createdAt_idx"
ON "public"."ContactMessage"("status", "createdAt" DESC);
