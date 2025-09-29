import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { walletAddress } = body;

        if (!walletAddress) {
            return NextResponse.json(
                { error: 'Wallet address is required' },
                { status: 400 }
            );
        }

        // Normalize address to lowercase for consistency
        const normalizedAddress = walletAddress.toLowerCase().trim();

        // Check if user already exists
        let user = await prisma.user.findUnique({
            where: { walletAddress: normalizedAddress },
        });

        if (user) {
            // Update last login time
            user = await prisma.user.update({
                where: { walletAddress: normalizedAddress },
                data: { lastLoginAt: new Date() },
            });

            return NextResponse.json({
                success: true,
                user,
                created: false,
            });
        }

        // Create new user
        user = await prisma.user.create({
            data: {
                walletAddress: normalizedAddress,
                lastLoginAt: new Date(),
            },
        });

        console.log(`Created new user profile for address: ${normalizedAddress}`);

        return NextResponse.json({
            success: true,
            user,
            created: true,
        });
    } catch (error) {
        console.error('Error syncing user:', error);
        return NextResponse.json(
            { error: 'Failed to sync user profile' },
            { status: 500 }
        );
    }
}
