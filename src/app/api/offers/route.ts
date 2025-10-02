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
      domainName,
      domainOwner,
      domainPrice,
    } = body;

    // Validation
    if (!externalId || !domainId || !offerer || !amount || !expiryDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create or update domain in database first to satisfy foreign key
    // First try to find by tokenId or name
    let domain = await prisma.domain.findFirst({
      where: {
        OR: [
          { id: domainId },
          { tokenId: domainId },
          { name: domainName || domainId },
        ],
      },
    });

    if (domain) {
      // Update existing domain
      await prisma.domain.update({
        where: { id: domain.id },
        data: {
          owner: domainOwner || domain.owner,
          price: domainPrice?.toString() || domain.price,
          isListed: domainPrice ? true : domain.isListed,
        },
      });
    } else {
      // Create new domain
      domain = await prisma.domain.create({
        data: {
          id: domainId,
          name: domainName || domainId,
          tld: domainName?.split('.').pop() || 'doma',
          tokenId: domainId,
          owner: domainOwner || offerer,
          price: domainPrice?.toString(),
          currency: currency || 'ETH',
          isListed: !!domainPrice,
        },
      });
    }

    // Create or update user in database if userId provided
    if (userId) {
      await prisma.user.upsert({
        where: { walletAddress: userId },
        update: {
          lastLoginAt: new Date(),
        },
        create: {
          walletAddress: userId,
          createdAt: new Date(),
        },
      });
    }

    // Now create the offer
    // If userId was provided, find the user record to use its ID
    let userRecord = null;
    if (userId) {
      userRecord = await prisma.user.findUnique({
        where: { walletAddress: userId },
      });
    }

    const offer = await prisma.offer.create({
      data: {
        externalId,
        domainId: domain.id, // Use the actual domain ID from database
        offerer,
        userId: userRecord?.id || null, // Use user.id, not walletAddress
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
      where: { id: domain.id },
      data: { offerCount: { increment: 1 } },
    });

    // Create activity if userRecord exists
    if (userRecord) {
      try {
        await prisma.activity.create({
          data: {
            userId: userRecord.id,
            domainId: domain.id,
            type: 'OFFER_MADE',
            title: 'New offer made',
            description: `Offer of ${amount} ${currency} made for domain`,
          },
        });
      } catch (activityError) {
        // Activity creation is optional, don't fail the offer
        console.warn('Failed to create activity:', activityError);
      }
    }

    return NextResponse.json(offer);
  } catch (error) {
    console.error('Error creating offer:', error);
    return NextResponse.json(
      { error: 'Failed to create offer' },
      { status: 500 }
    );
  }
}
