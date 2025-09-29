import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('address');

    if (!walletAddress) {
        return NextResponse.json(
            { error: 'Wallet address is required' },
            { status: 400 }
        );
    }

    try {
        const normalizedAddress = walletAddress.toLowerCase().trim();
        
        console.log('=== PORTFOLIO API DEBUG ===');
        console.log('Requested wallet address:', walletAddress);
        console.log('Normalized address:', normalizedAddress);

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { walletAddress: normalizedAddress },
            include: {
                watchlist: {
                    include: {
                        domain: true,
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        });
        
        console.log('User found:', user ? 'YES' : 'NO');
        if (user) {
            console.log('User ID:', user.id);
            console.log('User wallet:', user.walletAddress);
        }

        if (!user) {
            return NextResponse.json({
                ownedDomains: [],
                watchlist: [],
                offers: [],
                offersMade: [],
                offersReceived: [],
                stats: {
                    ownedCount: 0,
                    watchlistCount: 0,
                    activeOffersMadeCount: 0,
                    activeOffersReceivedCount: 0,
                    totalActiveOffersCount: 0,
                    portfolioValue: '0',
                },
            });
        }

        // Get owned domains (domains where user is the owner)
        const ownedDomains = await prisma.domain.findMany({
            where: {
                owner: normalizedAddress,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Get offers made by this wallet address (using offerer field)
        // This catches offers even if userId wasn't set
        console.log('Querying offers with offerer:', normalizedAddress);
        
        const offersMadeByAddress = await prisma.offer.findMany({
            where: {
                offerer: {
                    equals: normalizedAddress,
                    mode: 'insensitive', // Case-insensitive comparison
                },
            },
            include: {
                domain: true,
                user: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        
        console.log('Offers found by offerer address:', offersMadeByAddress.length);
        if (offersMadeByAddress.length > 0) {
            console.log('Sample offer:', {
                id: offersMadeByAddress[0].id,
                offerer: offersMadeByAddress[0].offerer,
                domain: offersMadeByAddress[0].domain.name,
                amount: offersMadeByAddress[0].amount,
            });
        }
        
        // Also try querying without case sensitivity for debugging
        const allOffersDebug = await prisma.offer.findMany({
            include: {
                domain: true,
                user: true,
            },
        });
        
        console.log('Total offers in database:', allOffersDebug.length);
        console.log('Offers with matching address (case-insensitive):', 
            allOffersDebug.filter(o => o.offerer.toLowerCase() === normalizedAddress).length
        );
        
        if (allOffersDebug.length > 0) {
            console.log('Sample offerer addresses in DB:', 
                allOffersDebug.slice(0, 3).map(o => o.offerer)
            );
        }

        // Get offers received on owned domains
        const receivedOffers = await prisma.offer.findMany({
            where: {
                domain: {
                    owner: normalizedAddress,
                },
            },
            include: {
                domain: true,
                user: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Combine offers made by user
        const offersMade = offersMadeByAddress.map((o) => ({
            id: o.id,
            externalId: o.externalId,
            domain: o.domain,
            amount: o.amount,
            currency: o.currency,
            status: o.status,
            expiryDate: o.expiryDate,
            createdAt: o.createdAt,
            type: 'made' as const,
            offerer: normalizedAddress,
        }));

        const offersReceived = receivedOffers.map((o) => ({
            id: o.id,
            externalId: o.externalId,
            domain: o.domain,
            amount: o.amount,
            currency: o.currency,
            status: o.status,
            expiryDate: o.expiryDate,
            createdAt: o.createdAt,
            type: 'received' as const,
            offerer: o.offerer,
            offererUser: o.user,
        }));

        // Combine and sort by creation date
        const allOffers = [...offersMade, ...offersReceived].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        // Calculate stats
        const activeOffersMadeCount = offersMadeByAddress.filter(
            (offer) => offer.status === 'ACTIVE'
        ).length;
        
        const activeOffersReceivedCount = receivedOffers.filter(
            (offer) => offer.status === 'ACTIVE'
        ).length;

        // Calculate portfolio value (sum of listed domain prices)
        const portfolioValue = ownedDomains
            .filter((d) => d.isListed && d.price)
            .reduce((sum, d) => sum + parseFloat(d.price || '0'), 0)
            .toFixed(4);

        console.log('=== RESPONSE SUMMARY ===');
        console.log('Offers Made:', offersMade.length);
        console.log('Offers Received:', offersReceived.length);
        console.log('Total Offers:', allOffers.length);
        console.log('Active Offers Made:', activeOffersMadeCount);
        console.log('Active Offers Received:', activeOffersReceivedCount);
        console.log('========================');

        return NextResponse.json({
            ownedDomains,
            watchlist: user.watchlist.map((w) => ({
                id: w.id,
                domain: w.domain,
                addedAt: w.createdAt,
            })),
            offers: allOffers,
            offersMade,
            offersReceived,
            stats: {
                ownedCount: ownedDomains.length,
                watchlistCount: user.watchlist.length,
                activeOffersMadeCount,
                activeOffersReceivedCount,
                totalActiveOffersCount: activeOffersMadeCount + activeOffersReceivedCount,
                portfolioValue,
            },
        });
    } catch (error) {
        console.error('Error fetching portfolio data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch portfolio data' },
            { status: 500 }
        );
    }
}
