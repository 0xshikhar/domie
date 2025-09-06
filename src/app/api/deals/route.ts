import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/deals - Fetch deals
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const domainId = searchParams.get('domainId');

    const where: any = {};
    
    if (status) where.status = status;
    if (domainId) where.domainId = domainId;

    const deals = await prisma.deal.findMany({
      where,
      include: {
        domain: true,
        participants: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(deals);
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deals' },
      { status: 500 }
    );
  }
}

// POST /api/deals - Create deal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      domainId,
      creatorId,
      title,
      description,
      targetPrice,
      minContribution,
      maxParticipants,
      duration,
    } = body;

    // Validation
    if (!domainId || !creatorId || !title || !targetPrice || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(duration));

    const deal = await prisma.deal.create({
      data: {
        domainId,
        creatorId,
        title,
        description,
        targetPrice,
        minContribution: minContribution || '0.1',
        maxParticipants: maxParticipants || 10,
        endDate,
      },
      include: {
        domain: true,
      },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        userId: creatorId,
        domainId,
        type: 'DEAL_CREATED',
        title: 'New community deal created',
        description: title,
      },
    });

    return NextResponse.json(deal);
  } catch (error) {
    console.error('Error creating deal:', error);
    return NextResponse.json(
      { error: 'Failed to create deal' },
      { status: 500 }
    );
  }
}
