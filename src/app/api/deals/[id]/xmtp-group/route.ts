import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { xmtpGroupId } = await request.json();
    
    const deal = await prisma.deal.update({
      where: { contractDealId: params.id },
      data: { xmtpGroupId },
    });

    return NextResponse.json({ success: true, deal });
  } catch (error) {
    console.error('Error updating deal:', error);
    return NextResponse.json(
      { error: 'Failed to update deal' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deal = await prisma.deal.findUnique({
      where: { contractDealId: params.id },
      select: { xmtpGroupId: true },
    });

    return NextResponse.json({ xmtpGroupId: deal?.xmtpGroupId });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch deal' },
      { status: 500 }
    );
  }
}
