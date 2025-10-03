import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domainId, ownerId, ...data } = body;

    if (!domainId || !ownerId) {
      return NextResponse.json(
        { error: 'domainId and ownerId are required' },
        { status: 400 }
      );
    }

    // Check if domain exists
    const domain = await prisma.domain.findUnique({
      where: { id: domainId },
    });

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain not found' },
        { status: 404 }
      );
    }

    // Upsert landing page
    const landingPage = await prisma.domainLandingPage.upsert({
      where: { domainId },
      update: {
        ...data,
        updatedAt: new Date(),
      },
      create: {
        domainId,
        ownerId,
        ...data,
      },
    });

    return NextResponse.json(landingPage);
  } catch (error: any) {
    console.error('Error saving landing page:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save landing page' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domainId = searchParams.get('domainId');

    if (!domainId) {
      return NextResponse.json({ error: 'domainId required' }, { status: 400 });
    }

    const landingPage = await prisma.domainLandingPage.findUnique({
      where: { domainId },
    });

    return NextResponse.json(landingPage);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
