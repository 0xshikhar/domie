import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const walletAddress = searchParams.get('userId'); // Actually wallet address from frontend
    const domainId = searchParams.get('domainId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    
    // If wallet address provided, find user and filter by user ID
    if (walletAddress) {
      const user = await prisma.user.findFirst({
        where: {
          walletAddress: {
            equals: walletAddress,
            mode: 'insensitive',
          },
        },
      });
      if (user) {
        where.userId = user.id;
      } else {
        // No user found, return empty activities
        return NextResponse.json({ activities: [] });
      }
    }
    
    if (domainId) where.domainId = domainId;
    if (type && type !== 'all') where.type = type;

    const activities = await prisma.activity.findMany({
      where,
      include: {
        domain: {
          select: {
            name: true,
            price: true,
            currency: true,
          },
        },
        user: {
          select: {
            username: true,
            walletAddress: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, domainId, type, title, description } = body;

    if (!type || !title) {
      return NextResponse.json(
        { error: 'Type and title are required' },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.create({
      data: {
        userId,
        domainId,
        type,
        title,
        description,
      },
    });

    return NextResponse.json({ activity }, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
