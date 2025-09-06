import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/domains - Fetch all domains with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const isListed = searchParams.get('isListed');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    
    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }
    
    if (isListed !== null) {
      where.isListed = isListed === 'true';
    }

    const [domains, total] = await Promise.all([
      prisma.domain.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: {
          views: 'desc',
        },
        include: {
          _count: {
            select: {
              offers: true,
              watchlist: true,
            },
          },
        },
      }),
      prisma.domain.count({ where }),
    ]);

    return NextResponse.json({
      domains,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching domains:', error);
    return NextResponse.json(
      { error: 'Failed to fetch domains' },
      { status: 500 }
    );
  }
}

// POST /api/domains - Create or update domain
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      tld,
      tokenId,
      owner,
      isListed,
      price,
      currency,
      description,
      keywords,
    } = body;

    // Validation
    if (!name || !tld || !tokenId || !owner) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Upsert domain
    const domain = await prisma.domain.upsert({
      where: { tokenId },
      update: {
        isListed,
        price,
        currency,
        description,
        keywords,
        owner,
      },
      create: {
        name,
        tld,
        tokenId,
        owner,
        isListed: isListed || false,
        price,
        currency: currency || 'ETH',
        description,
        keywords: keywords || [],
      },
    });

    return NextResponse.json(domain);
  } catch (error) {
    console.error('Error creating/updating domain:', error);
    return NextResponse.json(
      { error: 'Failed to create/update domain' },
      { status: 500 }
    );
  }
}
