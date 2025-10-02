import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domainId, ownerId, ...data } = body;

    const landingPage = await prisma.domainLandingPage.upsert({
      where: { domainId },
      update: data,
      create: { domainId, ownerId, ...data },
    });

    return NextResponse.json(landingPage);
  } catch (error) {
    console.error('Error saving landing page:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
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
