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

        // Use original address to preserve checksum
        const address = walletAddress.trim();

        // Check if user already exists (case-insensitive)
        let user = await prisma.user.findFirst({
            where: { 
                walletAddress: {
                    equals: address,
                    mode: 'insensitive',
                },
            },
        });

        if (user) {
            // Update last login time
            user = await prisma.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
            });

            return NextResponse.json({
                success: true,
                user,
                created: false,
            });
        }

        // Create new user with original address
        user = await prisma.user.create({
            data: {
                walletAddress: address,
                lastLoginAt: new Date(),
            },
        });

        console.log(`Created new user profile for address: ${address}`);

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
