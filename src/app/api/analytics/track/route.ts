import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/analytics/track - Track analytics event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domainId, userId, event, metadata } = body;

    if (!domainId || !event) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const analyticsEvent = await prisma.domainAnalytics.create({
      data: {
        domainId,
        userId,
        event,
        metadata,
      },
    });

    return NextResponse.json(analyticsEvent);
  } catch (error) {
    console.error('Error tracking analytics:', error);
    return NextResponse.json(
      { error: 'Failed to track analytics' },
      { status: 500 }
    );
  }
}
