-- CreateTable
CREATE TABLE "DomainLandingPage" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL DEFAULT '#3b82f6',
    "secondaryColor" TEXT NOT NULL DEFAULT '#1e293b',
    "accentColor" TEXT NOT NULL DEFAULT '#8b5cf6',
    "logoUrl" TEXT,
    "heroImageUrl" TEXT,
    "heroVideoUrl" TEXT,
    "fontFamily" TEXT NOT NULL DEFAULT 'Inter',
    "customTitle" TEXT,
    "customDescription" TEXT,
    "customOgImage" TEXT,
    "customKeywords" TEXT[],
    "sections" JSONB NOT NULL DEFAULT '[]',
    "template" TEXT NOT NULL DEFAULT 'default',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "showOrderbook" BOOLEAN NOT NULL DEFAULT true,
    "showAnalytics" BOOLEAN NOT NULL DEFAULT true,
    "showOffers" BOOLEAN NOT NULL DEFAULT true,
    "primaryCTA" TEXT NOT NULL DEFAULT 'Buy Now',
    "secondaryCTA" TEXT NOT NULL DEFAULT 'Make Offer',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DomainLandingPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DomainLandingPage_domainId_key" ON "DomainLandingPage"("domainId");

-- CreateIndex
CREATE INDEX "DomainLandingPage_domainId_idx" ON "DomainLandingPage"("domainId");

-- CreateIndex
CREATE INDEX "DomainLandingPage_ownerId_idx" ON "DomainLandingPage"("ownerId");

-- CreateIndex
CREATE INDEX "DomainLandingPage_isPublished_idx" ON "DomainLandingPage"("isPublished");

-- AddForeignKey
ALTER TABLE "DomainLandingPage" ADD CONSTRAINT "DomainLandingPage_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "Domain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DomainLandingPage" ADD CONSTRAINT "DomainLandingPage_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
