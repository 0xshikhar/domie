import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/domains/[id] - Fetch single domain
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const domain = await prisma.domain.findUnique({
      where: { id: params.id },
      include: {
        offers: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        analytics: {
          orderBy: { timestamp: 'desc' },
          take: 100,
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            offers: true,
            watchlist: true,
          },
        },
      },
    });

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.domain.update({
      where: { id: params.id },
      data: { views: { increment: 1 } },
    });

    return NextResponse.json(domain);
  } catch (error) {
    console.error('Error fetching domain:', error);
    return NextResponse.json(
      { error: 'Failed to fetch domain' },
      { status: 500 }
    );
  }
}

// PATCH /api/domains/[id] - Update domain
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const domain = await prisma.domain.update({
      where: { id: params.id },
      data: body,
    });

    return NextResponse.json(domain);
  } catch (error) {
    console.error('Error updating domain:', error);
    return NextResponse.json(
      { error: 'Failed to update domain' },
      { status: 500 }
    );
  }
}

// DELETE /api/domains/[id] - Delete domain
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.domain.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting domain:', error);
    return NextResponse.json(
      { error: 'Failed to delete domain' },
      { status: 500 }
    );
  }
}
