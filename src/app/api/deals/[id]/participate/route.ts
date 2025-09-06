import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/deals/[id]/participate - Join a deal
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { userId, contribution } = body;

    if (!userId || !contribution) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if deal exists and is active
    const deal = await prisma.deal.findUnique({
      where: { id: params.id },
    });

    if (!deal) {
      return NextResponse.json(
        { error: 'Deal not found' },
        { status: 404 }
      );
    }

    if (deal.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Deal is not active' },
        { status: 400 }
      );
    }

    // Check if user already participated
    const existing = await prisma.dealParticipation.findUnique({
      where: {
        dealId_userId: {
          dealId: params.id,
          userId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Already participated in this deal' },
        { status: 400 }
      );
    }

    // Create participation
    const participation = await prisma.dealParticipation.create({
      data: {
        dealId: params.id,
        userId,
        contribution,
      },
    });

    // Update deal
    const newAmount = (parseFloat(deal.currentAmount) + parseFloat(contribution)).toString();
    const updatedDeal = await prisma.deal.update({
      where: { id: params.id },
      data: {
        currentAmount: newAmount,
        participantCount: { increment: 1 },
        status: parseFloat(newAmount) >= parseFloat(deal.targetPrice) ? 'FUNDED' : 'ACTIVE',
      },
      include: {
        domain: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    // Create activity if funded
    if (updatedDeal.status === 'FUNDED') {
      await prisma.activity.create({
        data: {
          userId,
          domainId: deal.domainId,
          type: 'DEAL_FUNDED',
          title: 'Deal fully funded!',
          description: `${deal.title} has reached its funding goal`,
        },
      });
    }

    return NextResponse.json({
      participation,
      deal: updatedDeal,
    });
  } catch (error) {
    console.error('Error participating in deal:', error);
    return NextResponse.json(
      { error: 'Failed to participate in deal' },
      { status: 500 }
    );
  }
}
