import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Add to watchlist
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { walletAddress, domainId } = body;

        if (!walletAddress || !domainId) {
            return NextResponse.json(
                { error: 'Wallet address and domain ID are required' },
                { status: 400 }
            );
        }

        const normalizedAddress = walletAddress.toLowerCase().trim();

        // Get or create user
        let user = await prisma.user.findUnique({
            where: { walletAddress: normalizedAddress },
        });

        if (!user) {
            user = await prisma.user.create({
                data: { walletAddress: normalizedAddress },
            });
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

        // Check if already in watchlist
        const existing = await prisma.watchlist.findUnique({
            where: {
                userId_domainId: {
                    userId: user.id,
                    domainId: domainId,
                },
            },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Domain already in watchlist' },
                { status: 400 }
            );
        }

        // Add to watchlist
        const watchlistItem = await prisma.watchlist.create({
            data: {
                userId: user.id,
                domainId: domainId,
            },
            include: {
                domain: true,
            },
        });

        // Update domain watch count
        await prisma.domain.update({
            where: { id: domainId },
            data: { watchCount: { increment: 1 } },
        });

        // Create analytics event
        await prisma.domainAnalytics.create({
            data: {
                domainId: domainId,
                userId: user.id,
                event: 'WATCHLIST_ADD',
            },
        });

        return NextResponse.json({
            success: true,
            watchlistItem,
        });
    } catch (error) {
        console.error('Error adding to watchlist:', error);
        return NextResponse.json(
            { error: 'Failed to add to watchlist' },
            { status: 500 }
        );
    }
}

// Remove from watchlist
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const walletAddress = searchParams.get('address');
        const domainId = searchParams.get('domainId');

        if (!walletAddress || !domainId) {
            return NextResponse.json(
                { error: 'Wallet address and domain ID are required' },
                { status: 400 }
            );
        }

        const normalizedAddress = walletAddress.toLowerCase().trim();

        // Get user
        const user = await prisma.user.findUnique({
            where: { walletAddress: normalizedAddress },
        });

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Remove from watchlist
        await prisma.watchlist.delete({
            where: {
                userId_domainId: {
                    userId: user.id,
                    domainId: domainId,
                },
            },
        });

        // Update domain watch count
        await prisma.domain.update({
            where: { id: domainId },
            data: { watchCount: { decrement: 1 } },
        });

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.error('Error removing from watchlist:', error);
        return NextResponse.json(
            { error: 'Failed to remove from watchlist' },
            { status: 500 }
        );
    }
}

// Check if domain is in watchlist
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const walletAddress = searchParams.get('address');
        const domainId = searchParams.get('domainId');

        if (!walletAddress || !domainId) {
            return NextResponse.json({ isWatching: false });
        }

        const normalizedAddress = walletAddress.toLowerCase().trim();

        const user = await prisma.user.findUnique({
            where: { walletAddress: normalizedAddress },
        });

        if (!user) {
            return NextResponse.json({ isWatching: false });
        }

        const watchlistItem = await prisma.watchlist.findUnique({
            where: {
                userId_domainId: {
                    userId: user.id,
                    domainId: domainId,
                },
            },
        });

        return NextResponse.json({
            isWatching: !!watchlistItem,
        });
    } catch (error) {
        console.error('Error checking watchlist:', error);
        return NextResponse.json({ isWatching: false });
    }
}
