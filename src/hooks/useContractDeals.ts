import { useState, useEffect, useCallback } from 'react';
import { usePublicClient, useChainId } from 'wagmi';
import { formatEther } from 'viem';
import { COMMUNITY_DEAL_ADDRESSES, COMMUNITY_DEAL_ABI } from '@/lib/contracts/abis/CommunityDealData';
import { CommunityDealInfo, DealStatus } from '@/lib/contracts/communityDeal';

export interface ContractDeal extends CommunityDealInfo {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  progressPercentage: number;
  minContribution: string;
  maxParticipants: number;
  xmtpGroupId?: string; // XMTP group conversation ID for deal room
}

export function useContractDeals() {
  const [deals, setDeals] = useState<ContractDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const contractAddress = COMMUNITY_DEAL_ADDRESSES[chainId] as `0x${string}` | undefined;

  const fetchDeals = useCallback(async () => {
    if (!publicClient || !contractAddress) {
      setError('Contract not available on this network');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get total number of deals by trying to read deals starting from ID 0
      // We'll check up to 100 deals (reasonable limit)
      const dealPromises: Promise<any>[] = [];
      
      for (let i = 0; i < 100; i++) {
        dealPromises.push(
          publicClient.readContract({
            address: contractAddress,
            abi: COMMUNITY_DEAL_ABI,
            functionName: 'getDealInfo',
            args: [BigInt(i)],
          }).catch(() => null) // Return null for non-existent deals
        );
      }

      const dealResults = await Promise.all(dealPromises);
      const validDeals: ContractDeal[] = [];

      for (let i = 0; i < dealResults.length; i++) {
        const dealData = dealResults[i];
        if (!dealData || !dealData[0]) continue; // Skip null/empty results

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

        // console.log("dealData", dealData);

        // Skip empty deals (domain name empty means deal doesn't exist)
        if (!domainName || domainName.trim() === '') continue;

        const now = BigInt(Math.floor(Date.now() / 1000));
        const daysRemaining = deadline > now 
          ? Math.ceil(Number(deadline - now) / (24 * 60 * 60))
          : 0;

        const progressPercentage = targetPrice > BigInt(0)
          ? Number((currentAmount * BigInt(100)) / targetPrice)
          : 0;

        const deal: ContractDeal = {
          id: i.toString(),
          dealId: i.toString(),
          domainName,
          creator,
          targetPrice,
          currentAmount,
          participantCount: Number(participantCount),
          deadline,
          status: Number(status) as DealStatus,
          purchased,
          domainTokenId: domainTokenId > BigInt(0) ? domainTokenId : undefined,
          fractionalTokenAddress: fractionalTokenAddress !== '0x0000000000000000000000000000000000000000' 
            ? fractionalTokenAddress 
            : undefined,
          progressPercentage,
          daysRemaining,
          title: `Community Deal: ${domainName}`,
          description: `Join the community to collectively purchase ${domainName}`,
          startDate: new Date().toISOString(), // We don't have start date in contract
          endDate: new Date(Number(deadline) * 1000).toISOString(),
          minContribution: "0.01", // Default value, could be read from contract
          maxParticipants: 50, // Default value, could be read from contract
          xmtpGroupId: undefined, // TODO: Fetch from database
        };

        validDeals.push(deal);
      }

      setDeals(validDeals);
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError('Failed to fetch deals from contract');
    } finally {
      setLoading(false);
    }
  }, [publicClient, contractAddress]);

  // Fetch deals on mount and when contract changes
  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  // Refresh deals function
  const refreshDeals = useCallback(() => {
    fetchDeals();
  }, [fetchDeals]);

  return {
    deals,
    loading,
    error,
    refreshDeals,
    contractAddress,
    isContractAvailable: !!contractAddress,
  };
}
