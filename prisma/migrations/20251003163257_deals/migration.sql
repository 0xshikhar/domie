/*
  Warnings:

  - A unique constraint covering the columns `[contractDealId]` on the table `Deal` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `creatorAddress` to the `Deal` table without a default value. This is not possible if the table is not empty.
  - Added the required column `domainName` to the `Deal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Deal" ADD COLUMN     "contractDeadline" BIGINT,
ADD COLUMN     "contractDealId" TEXT,
ADD COLUMN     "creatorAddress" TEXT NOT NULL,
ADD COLUMN     "domainName" TEXT NOT NULL,
ADD COLUMN     "domainTokenId" TEXT,
ADD COLUMN     "fractionalTokenAddress" TEXT,
ADD COLUMN     "purchased" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Deal_contractDealId_key" ON "Deal"("contractDealId");

-- CreateIndex
CREATE INDEX "Deal_contractDealId_idx" ON "Deal"("contractDealId");

-- CreateIndex
CREATE INDEX "Deal_domainName_idx" ON "Deal"("domainName");
