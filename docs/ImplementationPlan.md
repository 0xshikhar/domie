# Domanzo Implementation Plan
## Track 5: Landing Pages & Messaging Interfaces - Complete Development Guide

**Target**: Win $10,000 USDC + Doma Forge Fast-Track Eligibility  
**Timeline**: 14 Days  
**Tech Stack**: Next.js 14, Prisma, Privy, Wagmi, XMTP, DOMA Protocol

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Current Setup Analysis](#2-current-setup-analysis)
3. [Technical Architecture](#3-technical-architecture)
4. [Database Schema (Prisma)](#4-database-schema-prisma)
5. [Dependencies & Installation](#5-dependencies--installation)
6. [Project Structure](#6-project-structure)
7. [Implementation Phases](#7-implementation-phases)
8. [Component Specifications](#8-component-specifications)
9. [API Routes](#9-api-routes)
10. [Integration Guides](#10-integration-guides)
11. [Testing Strategy](#11-testing-strategy)
12. [Deployment Guide](#12-deployment-guide)
13. [Success Metrics](#13-success-metrics)

---

## 1. Project Overview

### What is Domanzo?

Domanzo is a next-generation domain marketplace combining the best features from existing solutions with unique innovations to win Track 5.

**Core Features**:
- ✅ SEO-optimized landing pages for every domain (SSR)
- ✅ XMTP messaging with smart trade cards
- ✅ Community deals & fractionalization
- ✅ Advanced analytics dashboard
- ✅ Social features & activity feed
- ✅ Orderbook integration for trading
- ✅ On-chain transaction tracking

**Winning Differentiators**:
1. **Best SEO**: 95+ Lighthouse score on every domain page
2. **Smartest XMTP**: Trade cards with embedded actions
3. **Unique Fractionalization**: Community-driven group buying
4. **Comprehensive Analytics**: Track everything
5. **Friction Reduction**: <3 clicks to purchase
6. **Professional Polish**: Beautiful, accessible UI

### Track 5 Requirements

- ✅ Custom landing pages for domain sales
- ✅ SEO optimization with analytics/offers
- ✅ XMTP messaging for trade negotiations
- ✅ Doma orderbook integration
- ✅ On-chain links for transactions
- ✅ Combined interface for community deals
- ✅ Fractionalization support (bonus)
- ✅ Reduce friction, enhance visibility, drive transactions

---

## 2. Current Setup Analysis

### ✅ Already Configured

```typescript
// Existing Stack
- Next.js 14.2.24 with App Router
- TypeScript 5.4.5
- Privy 2.24.0 (Wallet Auth)
- Wagmi 2.14.12 + Viem 2.x
- Prisma 6.4.1 + PostgreSQL
- Shadcn/ui + Tailwind CSS
- React Query 5.67.1
- React Hook Form + Zod
```

**Existing Files**:
- ✅ `src/lib/prisma.ts` - Prisma client
- ✅ `src/app/providers.tsx` - Privy + Wagmi
- ✅ `src/components/ui/*` - Shadcn components
- ✅ `prisma/schema.prisma` - Basic User model
- ✅ Authentication working

### ❌ Missing Components

```typescript
// Need to Add
- @xmtp/browser-sdk (Messaging)
- @doma-protocol/orderbook-sdk (Trading)
- GraphQL client (Domain data)
- next-seo + @vercel/og (SEO)
- @vercel/analytics (Analytics)
- recharts (Charts)
- Additional Radix UI components
```

---

## 3. Technical Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────┐
│              DOMANZO PLATFORM                        │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │      Next.js 14 App Router (SSR/SSG)           │ │
│  │                                                 │ │
│  │  Landing Pages → Discover → Deals → Messages   │ │
│  │     (SEO)                                       │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │         State Management                        │ │
│  │  React Query (Server) + Context (Client)       │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │         External Services                       │ │
│  │  DOMA API | XMTP | Privy | Prisma DB          │ │
│  └────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

### Technology Decisions

| Component | Technology | Reason |
|-----------|------------|--------|
| Framework | Next.js 14 | SSR for SEO |
| Auth | Privy | Best Web3 auth |
| Web3 | Wagmi + Viem | Type-safe |
| Database | PostgreSQL + Prisma | Type-safe ORM |
| Messaging | XMTP Browser SDK | Decentralized |
| Domain Data | DOMA GraphQL API | Official |
| Trading | Doma Orderbook SDK | Seamless |
| Styling | Tailwind + Shadcn | Beautiful |
| Deployment | Vercel | Easy |

---

## 4. Database Schema (Prisma)

### Complete Enhanced Schema

**Replace your `prisma/schema.prisma` with this:**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// USER MODELS
model User {
  id            String    @id @default(cuid())
  walletAddress String    @unique
  createdAt     DateTime  @default(now())
  lastLoginAt   DateTime? @updatedAt
  username      String?   @unique
  avatar        String?
  bio           String?
  NFTid         String?
  isVerified    Boolean   @default(false)
  
  watchlist     Watchlist[]
  offers        Offer[]
  analytics     DomainAnalytics[]
  dealParticipations DealParticipation[]
  notifications Notification[]
  activities    Activity[]
  
  @@index([walletAddress])
  @@index([username])
}

// DOMAIN MODELS
model Domain {
  id              String   @id @default(cuid())
  name            String   @unique
  tld             String
  tokenId         String   @unique
  owner           String
  registrationDate DateTime?
  expiryDate      DateTime?
  isListed        Boolean  @default(false)
  price           String?
  currency        String   @default("ETH")
  description     String?  @db.Text
  keywords        String[]
  ogImage         String?
  views           Int      @default(0)
  watchCount      Int      @default(0)
  offerCount      Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  watchlist       Watchlist[]
  offers          Offer[]
  analytics       DomainAnalytics[]
  activities      Activity[]
  deals           Deal[]
  
  @@index([name])
  @@index([tokenId])
  @@index([owner])
  @@index([isListed])
}

model Watchlist {
  id        String   @id @default(cuid())
  userId    String
  domainId  String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  domain    Domain   @relation(fields: [domainId], references: [id], onDelete: Cascade)
  
  @@unique([userId, domainId])
}

// TRADING MODELS
model Offer {
  id          String   @id @default(cuid())
  externalId  String   @unique
  domainId    String
  offerer     String
  userId      String?
  amount      String
  currency    String   @default("ETH")
  status      OfferStatus @default(ACTIVE)
  expiryDate  DateTime
  createdAt   DateTime @default(now())
  
  domain      Domain   @relation(fields: [domainId], references: [id], onDelete: Cascade)
  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  @@index([domainId])
  @@index([status])
}

enum OfferStatus {
  ACTIVE
  ACCEPTED
  REJECTED
  EXPIRED
  CANCELLED
}

// COMMUNITY DEALS
model Deal {
  id              String   @id @default(cuid())
  domainId        String
  creatorId       String
  title           String
  description     String?  @db.Text
  targetPrice     String
  minContribution String
  maxParticipants Int      @default(10)
  status          DealStatus @default(ACTIVE)
  currentAmount   String   @default("0")
  participantCount Int     @default(0)
  startDate       DateTime @default(now())
  endDate         DateTime
  createdAt       DateTime @default(now())
  
  domain          Domain   @relation(fields: [domainId], references: [id], onDelete: Cascade)
  participants    DealParticipation[]
  
  @@index([domainId])
  @@index([status])
}

enum DealStatus {
  ACTIVE
  FUNDED
  COMPLETED
  CANCELLED
  EXPIRED
}

model DealParticipation {
  id              String   @id @default(cuid())
  dealId          String
  userId          String
  contribution    String
  createdAt       DateTime @default(now())
  
  deal            Deal     @relation(fields: [dealId], references: [id], onDelete: Cascade)
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([dealId, userId])
}

// ANALYTICS
model DomainAnalytics {
  id        String   @id @default(cuid())
  domainId  String
  userId    String?
  event     AnalyticsEvent
  metadata  Json?
  timestamp DateTime @default(now())
  
  domain    Domain   @relation(fields: [domainId], references: [id], onDelete: Cascade)
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  @@index([domainId])
  @@index([event])
}

enum AnalyticsEvent {
  PAGE_VIEW
  DOMAIN_CLICK
  OFFER_MADE
  BUY_CLICK
  MESSAGE_SENT
  WATCHLIST_ADD
  DEAL_CREATED
}

// ACTIVITY FEED
model Activity {
  id          String   @id @default(cuid())
  userId      String?
  domainId    String?
  type        ActivityType
  title       String
  description String?
  createdAt   DateTime @default(now())
  
  user        User?    @relation(fields: [userId], references: [id], onDelete: SetNull)
  domain      Domain?  @relation(fields: [domainId], references: [id], onDelete: SetNull)
  
  @@index([type])
  @@index([createdAt])
}

enum ActivityType {
  DOMAIN_LISTED
  DOMAIN_SOLD
  OFFER_MADE
  DEAL_CREATED
  DEAL_FUNDED
}

// NOTIFICATIONS
model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([isRead])
}

enum NotificationType {
  OFFER_RECEIVED
  OFFER_ACCEPTED
  DOMAIN_SOLD
  DEAL_FUNDED
  MESSAGE_RECEIVED
}
```

### Migration Commands

```bash
npx prisma migrate dev --name init_domanzo
npx prisma generate
npx prisma studio
```

---

## 5. Dependencies & Installation

### Install All Required Packages

```bash
# XMTP Integration
bun add @xmtp/browser-sdk@^4.1.0 @xmtp/content-type-reaction@^2.0.2 @xmtp/content-type-reply@^2.0.2 @xmtp/content-type-text@^2.0.2

# DOMA Protocol
bun add @doma-protocol/orderbook-sdk@^0.1.3 graphql@^16.8.1 graphql-request@^6.1.0

# SEO & Analytics
bun add next-seo@^6.5.0 @vercel/analytics@^1.1.1 @vercel/og@^0.6.2

# UI Enhancements
bun add @radix-ui/react-dialog@^1.0.5 @radix-ui/react-avatar@^1.0.4 @radix-ui/react-progress@^1.0.3 @radix-ui/react-scroll-area@^1.0.5

# Charts
bun add recharts@^2.10.3 date-fns@^3.0.0

# Utilities
bun add nanoid@^5.0.4 copy-to-clipboard@^3.3.3
```

### Environment Variables

Create `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/domanzo"

# Privy
NEXT_PUBLIC_PRIVY_APP_ID="your_privy_app_id"
PRIVY_APP_SECRET="your_privy_secret"

# DOMA Protocol
NEXT_PUBLIC_DOMA_API_URL="https://api.doma.dev"
NEXT_PUBLIC_DOMA_GRAPHQL_URL="https://api.doma.dev/graphql"
DOMA_API_KEY="your_doma_api_key"

# XMTP
NEXT_PUBLIC_XMTP_ENV="dev"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
JWT_SECRET="your_jwt_secret"
```

---

## 6. Project Structure

```
Domanzo/
├── prisma/
│   └── schema.prisma (✅ Enhanced)
├── src/
│   ├── app/
│   │   ├── (app)/
│   │   │   ├── discover/page.tsx
│   │   │   ├── deals/page.tsx
│   │   │   ├── messages/page.tsx
│   │   │   └── portfolio/page.tsx
│   │   ├── domain/
│   │   │   └── [name]/page.tsx (SEO!)
│   │   └── api/
│   │       ├── domains/route.ts
│   │       ├── offers/route.ts
│   │       ├── deals/route.ts
│   │       └── og/[domain]/route.tsx
│   ├── components/
│   │   ├── domain/
│   │   ├── trading/
│   │   ├── messaging/
│   │   └── deals/
│   ├── lib/
│   │   ├── doma/
│   │   ├── xmtp/
│   │   └── analytics/
│   └── hooks/
└── ImplementationPlan.md
```

---

## 7. Implementation Phases

### Phase 1: Foundation (Days 1-2)
- Install dependencies
- Update Prisma schema
- Setup DOMA client
- Setup XMTP provider
- Create base hooks

### Phase 2: Core Features (Days 3-5)
- Domain discovery page
- **SEO landing pages (CRITICAL!)**
- OG image generation
- Trading modals (Buy/Offer)

### Phase 3: XMTP Messaging (Days 6-7)
- XMTP provider
- Chat interface
- Smart trade cards
- In-chat trading

### Phase 4: Community Deals (Days 8-9)
- Deal creation
- Deal participation
- Progress tracking
- Completion flow

### Phase 5: Analytics & SEO (Days 10-11)
- Analytics dashboard
- Event tracking
- SEO optimization
- 95+ Lighthouse score

### Phase 6: Polish & Testing (Days 12-14)
- UI/UX polish
- Testing all features
- Bug fixes
- Deployment

---

## 8. Key Files to Create

### Priority 1 (Critical)
1. `prisma/schema.prisma` - Enhanced schema
2. `src/app/domain/[name]/page.tsx` - SEO landing pages
3. `src/app/api/og/[domain]/route.tsx` - OG images
4. `src/components/messaging/XMTPProvider.tsx` - XMTP
5. `src/lib/doma/orderbook.ts` - Trading

### Priority 2 (High)
6. `src/app/(app)/discover/page.tsx` - Domain browser
7. `src/components/domain/DomainCard.tsx` - Cards
8. `src/components/trading/BuyNowModal.tsx` - Buy flow
9. `src/app/(app)/deals/page.tsx` - Community deals
10. `src/components/analytics/Dashboard.tsx` - Analytics

---

## 9. Integration Examples

### DOMA GraphQL Client

```typescript
// src/lib/doma/client.ts
import { GraphQLClient } from 'graphql-request';

export const domaClient = new GraphQLClient(
  process.env.NEXT_PUBLIC_DOMA_GRAPHQL_URL!,
  {
    headers: {
      'x-api-key': process.env.DOMA_API_KEY!,
    },
  }
);
```

### XMTP Provider

```typescript
// src/components/messaging/XMTPProvider.tsx
'use client';

import { Client } from '@xmtp/browser-sdk';
import { createContext, useEffect, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

export function XMTPProvider({ children }) {
  const { user, signMessage } = usePrivy();
  const [client, setClient] = useState(null);

  useEffect(() => {
    if (!user?.wallet?.address) return;
    
    const initXMTP = async () => {
      const identifier = {
        identifier: user.wallet.address,
        identifierKind: 'Ethereum',
      };
      
      const xmtpClient = await Client.build(identifier, {
        env: process.env.NEXT_PUBLIC_XMTP_ENV,
      });
      
      setClient(xmtpClient);
    };
    
    initXMTP();
  }, [user]);

  return (
    <XMTPContext.Provider value={{ client }}>
      {children}
    </XMTPContext.Provider>
  );
}
```

### Orderbook SDK

```typescript
// src/lib/doma/orderbook.ts
import { OrderbookSDK } from '@doma-protocol/orderbook-sdk';

export const orderbook = new OrderbookSDK({
  apiUrl: process.env.NEXT_PUBLIC_DOMA_API_URL!,
  apiKey: process.env.DOMA_API_KEY!,
});

export async function buyNow(listingId: string) {
  return orderbook.fulfillListing(listingId);
}

export async function createOffer(tokenId: string, amount: bigint) {
  return orderbook.createOffer({
    tokenId,
    amount,
    duration: 7 * 24 * 60 * 60, // 7 days
    currency: 'ETH',
  });
}
```

---

## 10. Testing Checklist

```
✅ Wallet connection (Privy)
✅ Domain discovery
✅ Domain search & filters
✅ Domain landing pages (SEO)
✅ OG image generation
✅ Buy now flow
✅ Make offer flow
✅ XMTP messaging
✅ Trade cards in chat
✅ Community deals
✅ Deal participation
✅ Analytics tracking
✅ Mobile responsiveness
✅ Lighthouse scores (95+)
```

---

## 11. Deployment

### Vercel Deployment

```bash
# 1. Push to GitHub
git push origin main

# 2. Connect to Vercel
vercel link

# 3. Add environment variables in Vercel

# 4. Deploy
vercel --prod
```

---

## 12. Success Metrics

### Technical
- ✅ Lighthouse SEO: 95+
- ✅ Page Load: <1s
- ✅ Mobile Score: 95+
- ✅ Accessibility: 100

### Features
- ✅ SEO landing pages
- ✅ XMTP messaging
- ✅ Orderbook integration
- ✅ Community deals
- ✅ Analytics

### UX
- ✅ <3 clicks to purchase
- ✅ Smooth animations
- ✅ Fast interactions

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
bun install

# 2. Setup database
npx prisma migrate dev
npx prisma generate

# 3. Start development
bun dev
```

---

## 📞 Next Steps

1. ✅ Review this plan
2. ✅ Setup environment variables
3. ✅ Run database migrations
4. ✅ Start Phase 1

**Ready to build the winning Track 5 submission! 🏆**