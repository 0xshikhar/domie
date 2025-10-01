import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, formatEther } from 'viem';
import { defineChain } from 'viem/chains';
import { PrismaClient } from '@prisma/client';
import { COMMUNITY_DEAL_ADDRESSES, COMMUNITY_DEAL_ABI } from '@/lib/contracts/abis/CommunityDealData';

// Define Doma Testnet
const domaTestnet = defineChain({
  id: 97476,
  name: 'Doma Testnet',
  network: 'doma-testnet',
  nativeCurrency: {
    name: 'Ethereum',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc-testnet.doma.xyz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Doma Explorer',
      url: 'https://explorer-testnet.doma.xyz',
    },
  },
  testnet: true,
});

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { chainId = 97476 } = await request.json();
    
    // Create public client for Doma Testnet
    const publicClient = createPublicClient({
      chain: domaTestnet,
      transport: http(),
    });

    const contractAddress = COMMUNITY_DEAL_ADDRESSES[chainId];
    if (!contractAddress) {
      return NextResponse.json({ error: 'Contract not available on this network' }, { status: 400 });
    }

    // Fetch deals from contract
    const dealPromises: Promise<any>[] = [];
    for (let i = 0; i < 100; i++) {
      dealPromises.push(
        publicClient.readContract({
          address: contractAddress as `0x${string}`,
          abi: COMMUNITY_DEAL_ABI,
          functionName: 'getDealInfo',
          args: [BigInt(i)],
        }).catch(() => null)
      );
    }

    const dealResults = await Promise.all(dealPromises);
    const syncResults = [];
    
    for (let i = 0; i < dealResults.length; i++) {
      const dealData = dealResults[i];
      if (!dealData || !dealData[0]) continue;

      const [
        domainName,
        creator,
        targetPrice,
        currentAmount,
        participantCount,
        deadline,
        status,
        purchased,
        domainTokenId,
        fractionalTokenAddress,
      ] = dealData;

      // Skip empty deals
      if (!domainName || domainName.trim() === '') continue;

      const contractDealId = i.toString();
      
      try {
        // Check if deal already exists in database
        let deal = await prisma.deal.findUnique({
          where: { contractDealId }
        });

        if (deal) {
          // Update existing deal
          deal = await prisma.deal.update({
            where: { contractDealId },
            data: {
              status: mapContractStatusToDb(Number(status)),
              currentAmount: formatEther(currentAmount),
              participantCount: Number(participantCount),
              purchased,
              domainTokenId: domainTokenId > BigInt(0) ? domainTokenId.toString() : null,
              fractionalTokenAddress: fractionalTokenAddress !== '0x0000000000000000000000000000000000000000' 
                ? fractionalTokenAddress 
                : null,
            }
          });
          syncResults.push({ dealId: i, action: 'updated', deal });
        } else {
          // Create domain if it doesn't exist
          let domain = await prisma.domain.findUnique({
            where: { name: domainName }
          });

          if (!domain) {
            domain = await prisma.domain.create({
              data: {
                name: domainName,
                tld: domainName.split('.').pop() || 'doma',
                tokenId: domainTokenId > BigInt(0) ? domainTokenId.toString() : `temp-${Date.now()}`,
                owner: creator,
                isListed: true,
                price: formatEther(targetPrice),
                description: `Community deal for ${domainName}`,
                keywords: [domainName.split('.')[0], 'community', 'deal'],
              }
            });
          }

          // Create new deal
          deal = await prisma.deal.create({
            data: {
              contractDealId,
              domainId: domain.id,
              domainName,
              creatorId: creator, // This should be mapped to actual user ID
              creatorAddress: creator,
              title: `Community Deal: ${domainName}`,
              description: `Join the community to collectively purchase ${domainName} domain`,
              targetPrice: formatEther(targetPrice),
              minContribution: "0.01", // Default, could be extracted from contract
              maxParticipants: 50, // Default, could be extracted from contract
              status: mapContractStatusToDb(Number(status)),
              currentAmount: formatEther(currentAmount),
              participantCount: Number(participantCount),
              endDate: new Date(Number(deadline) * 1000),
              contractDeadline: deadline,
              purchased,
              domainTokenId: domainTokenId > BigInt(0) ? domainTokenId.toString() : null,
              fractionalTokenAddress: fractionalTokenAddress !== '0x0000000000000000000000000000000000000000' 
                ? fractionalTokenAddress 
                : null,
            }
          });
          syncResults.push({ dealId: i, action: 'created', deal });
        }
      } catch (dbError) {
        console.error(`Error syncing deal ${i}:`, dbError);
        syncResults.push({ dealId: i, action: 'error', error: dbError });
      }
    }

    return NextResponse.json({ 
      success: true, 
      synced: syncResults.length,
      results: syncResults 
    });

  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: 'Failed to sync deals' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

function mapContractStatusToDb(contractStatus: number): 'ACTIVE' | 'FUNDED' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED' {
  switch (contractStatus) {
    case 0: return 'ACTIVE';
    case 1: return 'FUNDED';
    case 2: return 'COMPLETED';
    case 3: return 'CANCELLED';
    case 4: return 'EXPIRED';
    default: return 'ACTIVE';
  }
}

export async function GET() {
  try {
    // Return all deals from database
    const deals = await prisma.deal.findMany({
      include: {
        domain: true,
        participants: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, deals });
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
