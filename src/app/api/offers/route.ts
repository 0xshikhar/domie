import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/offers - Fetch offers
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const domainId = searchParams.get('domainId');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    const where: any = {};
    
    if (domainId) where.domainId = domainId;
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const offers = await prisma.offer.findMany({
      where,
      include: {
        domain: true,
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(offers);
  } catch (error) {
    console.error('Error fetching offers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offers' },
      { status: 500 }
    );
  }
}

// POST /api/offers - Create offer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      externalId,
      domainId,
      offerer,
      userId,
      amount,
      currency,
      expiryDate,
    } = body;

    // Validation
    if (!externalId || !domainId || !offerer || !amount || !expiryDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const offer = await prisma.offer.create({
      data: {
        externalId,
        domainId,
        offerer,
        userId,
        amount,
        currency: currency || 'ETH',
        expiryDate: new Date(expiryDate),
      },
      include: {
        domain: true,
      },
    });

    // Update domain offer count
    await prisma.domain.update({
      where: { id: domainId },
      data: { offerCount: { increment: 1 } },
    });

    // Create activity
    await prisma.activity.create({
      data: {
        userId,
        domainId,
        type: 'OFFER_MADE',
        title: 'New offer made',
        description: `Offer of ${amount} ${currency} made for domain`,
      },
    });

    return NextResponse.json(offer);
  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json(
      { error: 'Failed to create offer' },
      { status: 500 }
    );
  }
}
