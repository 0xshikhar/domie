# Quick Setup Guide - XMTP Deal Rooms

## ⚡ 5-Minute Setup

### Step 1: Install Dependencies (1 min)

```bash
cd /Users/shikharsingh/Downloads/code/doma-hack/Domanzo
npm install @radix-ui/react-scroll-area date-fns
```

### Step 2: Run Database Migration (1 min)

```bash
npx prisma migrate dev --name add_xmtp_deal_rooms
npx prisma generate
```

### Step 3: Create API Endpoint (2 min)

Create file: `src/app/api/deals/[id]/xmtp-group/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { xmtpGroupId } = await request.json();
    
    const deal = await prisma.deal.update({
      where: { contractDealId: params.id },
      data: { xmtpGroupId },
    });

    return NextResponse.json({ success: true, deal });
  } catch (error) {
    console.error('Error updating deal:', error);
    return NextResponse.json(
      { error: 'Failed to update deal' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deal = await prisma.deal.findUnique({
      where: { contractDealId: params.id },
      select: { xmtpGroupId: true },
    });

    return NextResponse.json({ xmtpGroupId: deal?.xmtpGroupId });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch deal' },
      { status: 500 }
    );
  }
}
```

### Step 4: Update CreateDealModal (1 min)

Add to `src/components/deals/CreateDealModal.tsx` after deal creation:

```typescript
import { useXMTP } from '@/components/messaging/XMTPProvider';
import { createDealGroupOnCreation } from '@/lib/xmtp/dealIntegration';

// Inside the component, after successful deal creation:
const { client } = useXMTP();

// After deal is created on-chain
if (client && dealId) {
  createDealGroupOnCreation(
    client,
    dealId,
    formData.domainName,
    formData.targetPrice,
    userAddress
  ).catch(err => console.error('Failed to create XMTP group:', err));
}
```

### Step 5: Update ContributeDealModal (1 min)

Add to `src/components/deals/ContributeDealModal.tsx` after contribution:

```typescript
import { useXMTP } from '@/components/messaging/XMTPProvider';
import { addParticipantOnContribution } from '@/lib/xmtp/dealIntegration';

// After successful contribution
const { client } = useXMTP();

if (client && deal.xmtpGroupId) {
  addParticipantOnContribution(
    client,
    deal.id,
    deal.xmtpGroupId,
    userAddress,
    contributionAmount,
    newTotalAmount,
    deal.targetPrice
  ).catch(err => console.error('Failed to add to group:', err));
}
```

---

## ✅ That's It!

Now when users:
1. **Create a deal** → XMTP group is automatically created
2. **Contribute** → They're automatically added to the group chat
3. **Visit deal page** → They see the "Deal Room" tab with real-time chat

---

## 🧪 Quick Test

1. Start the app: `npm run dev`
2. Create a new community deal
3. Contribute to the deal
4. Go to deal details page
5. Click "Deal Room" tab
6. Send a message!

---

## 🐛 Troubleshooting

### XMTP not connecting?
- Check that wallet is connected via Privy
- Check browser console for XMTP errors
- Ensure you're on the correct network (dev/production)

### Group not created?
- Check that `createDealGroupOnCreation` is called after deal creation
- Verify XMTP client is initialized
- Check API endpoint is working

### Can't see Deal Room tab?
- Ensure you've contributed to the deal
- Check that `deal.xmtpGroupId` exists
- Verify `isParticipant` is true

---

## 📝 Files Created/Modified

### New Files:
- ✅ `src/lib/xmtp/groups.ts` - XMTP group utilities
- ✅ `src/lib/xmtp/dealIntegration.ts` - Deal integration helpers
- ✅ `src/components/deals/DealRoom.tsx` - Deal room UI
- ✅ `src/components/ui/scroll-area.tsx` - Scroll area component
- ✅ `XMTP_DEAL_ROOMS_IMPLEMENTATION.md` - Full documentation

### Modified Files:
- ✅ `src/components/messaging/XMTPProvider.tsx` - Added group methods
- ✅ `prisma/schema.prisma` - Added deal room models
- ✅ `src/app/(app)/deals/[id]/page.tsx` - Added Deal Room tab
- ✅ `src/hooks/useContractDeals.ts` - Added xmtpGroupId field

### To Create:
- ⏳ `src/app/api/deals/[id]/xmtp-group/route.ts` - API endpoint

### To Modify:
- ⏳ `src/components/deals/CreateDealModal.tsx` - Add group creation
- ⏳ `src/components/deals/ContributeDealModal.tsx` - Add participant

---

## 🎯 Next Steps

1. Complete the 3 pending integrations above
2. Run the app and test the flow
3. Demo the feature!

**Total setup time: ~10 minutes** ⚡
