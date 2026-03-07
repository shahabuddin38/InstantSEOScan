-- Growth Engine Tables Migration
-- Adds: Lead, SEOReport, EmailTemplate, EmailCampaign, EmailLog, AutomationSetting

-- CreateTable Lead
CREATE TABLE IF NOT EXISTS "public"."Lead" (
  "id"          TEXT NOT NULL,
  "companyName" TEXT,
  "website"     TEXT NOT NULL,
  "email"       TEXT,
  "phone"       TEXT,
  "linkedinUrl" TEXT,
  "industry"    TEXT,
  "location"    TEXT,
  "seoScore"    INTEGER,
  "issues"      JSONB,
  "status"      TEXT NOT NULL DEFAULT 'new',
  "tags"        TEXT[],
  "leadSource"  TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable SEOReport
CREATE TABLE IF NOT EXISTS "public"."SEOReport" (
  "id"         TEXT NOT NULL,
  "leadId"     TEXT NOT NULL,
  "score"      INTEGER NOT NULL,
  "issues"     JSONB NOT NULL,
  "pdfUrl"     TEXT,
  "aiSummary"  TEXT,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SEOReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable EmailTemplate
CREATE TABLE IF NOT EXISTS "public"."EmailTemplate" (
  "id"        TEXT NOT NULL,
  "name"      TEXT NOT NULL,
  "subject"   TEXT NOT NULL,
  "body"      TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable EmailCampaign
CREATE TABLE IF NOT EXISTS "public"."EmailCampaign" (
  "id"         TEXT NOT NULL,
  "name"       TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "status"     TEXT NOT NULL DEFAULT 'draft',
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable EmailLog
CREATE TABLE IF NOT EXISTS "public"."EmailLog" (
  "id"         TEXT NOT NULL,
  "campaignId" TEXT,
  "leadId"     TEXT NOT NULL,
  "subject"    TEXT NOT NULL,
  "body"       TEXT NOT NULL,
  "status"     TEXT NOT NULL DEFAULT 'sent',
  "openedAt"   TIMESTAMP(3),
  "clickedAt"  TIMESTAMP(3),
  "sentAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable AutomationSetting
CREATE TABLE IF NOT EXISTS "public"."AutomationSetting" (
  "id"               TEXT NOT NULL,
  "module"           TEXT NOT NULL,
  "enabled"          BOOLEAN NOT NULL DEFAULT false,
  "scheduleInterval" TEXT NOT NULL DEFAULT 'daily',
  "config"           JSONB,
  "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AutomationSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Lead_status_createdAt_idx" ON "public"."Lead"("status", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Lead_email_idx" ON "public"."Lead"("email");
CREATE INDEX IF NOT EXISTS "SEOReport_leadId_idx" ON "public"."SEOReport"("leadId");
CREATE INDEX IF NOT EXISTS "EmailLog_campaignId_idx" ON "public"."EmailLog"("campaignId");
CREATE INDEX IF NOT EXISTS "EmailLog_leadId_idx" ON "public"."EmailLog"("leadId");

-- Unique constraint on AutomationSetting.module
CREATE UNIQUE INDEX IF NOT EXISTS "AutomationSetting_module_key" ON "public"."AutomationSetting"("module");

-- AddForeignKey SEOReport -> Lead (with CASCADE delete)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'SEOReport_leadId_fkey'
  ) THEN
    ALTER TABLE "public"."SEOReport"
      ADD CONSTRAINT "SEOReport_leadId_fkey"
      FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE CASCADE;
  END IF;
END $$;

-- AddForeignKey EmailCampaign -> EmailTemplate
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'EmailCampaign_templateId_fkey'
  ) THEN
    ALTER TABLE "public"."EmailCampaign"
      ADD CONSTRAINT "EmailCampaign_templateId_fkey"
      FOREIGN KEY ("templateId") REFERENCES "public"."EmailTemplate"("id");
  END IF;
END $$;

-- AddForeignKey EmailLog -> EmailCampaign (SET NULL on delete)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'EmailLog_campaignId_fkey'
  ) THEN
    ALTER TABLE "public"."EmailLog"
      ADD CONSTRAINT "EmailLog_campaignId_fkey"
      FOREIGN KEY ("campaignId") REFERENCES "public"."EmailCampaign"("id") ON DELETE SET NULL;
  END IF;
END $$;

-- AddForeignKey EmailLog -> Lead (CASCADE delete)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'EmailLog_leadId_fkey'
  ) THEN
    ALTER TABLE "public"."EmailLog"
      ADD CONSTRAINT "EmailLog_leadId_fkey"
      FOREIGN KEY ("leadId") REFERENCES "public"."Lead"("id") ON DELETE CASCADE;
  END IF;
END $$;
