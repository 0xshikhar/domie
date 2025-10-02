/*
  Warnings:

  - A unique constraint covering the columns `[xmtpGroupId]` on the table `Deal` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `walletAddress` to the `DealParticipation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'TRADE_CARD', 'VOTE', 'SYSTEM', 'MILESTONE');

-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('ACCEPT_OFFER', 'CHANGE_STRATEGY', 'DISTRIBUTE_FUNDS', 'DOMAIN_USAGE', 'GENERAL');

-- AlterTable
ALTER TABLE "Deal" ADD COLUMN     "xmtpGroupId" TEXT;

-- AlterTable
ALTER TABLE "DealParticipation" ADD COLUMN     "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "sharePercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "walletAddress" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "DealMessage" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "senderAddress" TEXT NOT NULL,
    "senderInboxId" TEXT,
    "content" TEXT NOT NULL,
    "messageType" "MessageType" NOT NULL DEFAULT 'TEXT',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DealVote" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "proposalHash" TEXT NOT NULL,
    "proposalTitle" TEXT NOT NULL,
    "proposalText" TEXT NOT NULL,
    "proposalType" "VoteType" NOT NULL,
    "voterAddress" TEXT NOT NULL,
    "vote" BOOLEAN NOT NULL,
    "votingPower" DOUBLE PRECISION NOT NULL,
    "votedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DealVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DealMessage_dealId_idx" ON "DealMessage"("dealId");

-- CreateIndex
CREATE INDEX "DealMessage_senderAddress_idx" ON "DealMessage"("senderAddress");

-- CreateIndex
CREATE INDEX "DealMessage_createdAt_idx" ON "DealMessage"("createdAt");

-- CreateIndex
CREATE INDEX "DealVote_dealId_idx" ON "DealVote"("dealId");

-- CreateIndex
CREATE INDEX "DealVote_proposalHash_idx" ON "DealVote"("proposalHash");

-- CreateIndex
CREATE UNIQUE INDEX "DealVote_dealId_proposalHash_voterAddress_key" ON "DealVote"("dealId", "proposalHash", "voterAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Deal_xmtpGroupId_key" ON "Deal"("xmtpGroupId");

-- CreateIndex
CREATE INDEX "Deal_xmtpGroupId_idx" ON "Deal"("xmtpGroupId");

-- CreateIndex
CREATE INDEX "DealParticipation_walletAddress_idx" ON "DealParticipation"("walletAddress");

-- AddForeignKey
ALTER TABLE "DealMessage" ADD CONSTRAINT "DealMessage_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DealVote" ADD CONSTRAINT "DealVote_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
