import { useCallback } from 'react';
import { usePublicClient, useWalletClient, useChainId } from 'wagmi';
import { Address, parseEther } from 'viem';
import {
  COMMUNITY_DEAL_ABI,
  COMMUNITY_DEAL_ADDRESSES,
  CommunityDealInfo,
  ParticipantInfo,
  formatDealInfo,
  formatParticipantInfo,
} from '@/lib/contracts/communityDeal';

/**
 * Hook to interact with Community Deal contract
 */
export function useCommunityDeal() {
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const contractAddress = COMMUNITY_DEAL_ADDRESSES[chainId];

  /**
   * Create a new community deal
   */
  const createDeal = useCallback(
    async (params: {
      domainName: string;
      targetPrice: string; // in ETH
      minContribution: string; // in ETH
      maxParticipants: number;
      durationInDays: number;
    }) => {
      if (!walletClient || !contractAddress) {
        throw new Error('Wallet not connected or contract not deployed');
      }

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: COMMUNITY_DEAL_ABI,
        functionName: 'createDeal',
        args: [
          params.domainName,
          parseEther(params.targetPrice),
          parseEther(params.minContribution),
          BigInt(params.maxParticipants),
          BigInt(params.durationInDays),
        ],
      });

      if (!publicClient) throw new Error('Public client not available');
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      
      // Parse logs to get deal ID
      const dealCreatedLog = receipt.logs.find(
        (log) => log.topics[0] === '0x...' // Add event signature
      );
      
      return { hash, receipt };
    },
    [walletClient, contractAddress, publicClient]
  );

  /**
   * Contribute to a deal
   */
  const contribute = useCallback(
    async (dealId: string, amount: string) => {
      if (!walletClient || !contractAddress) {
        throw new Error('Wallet not connected or contract not deployed');
      }

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: COMMUNITY_DEAL_ABI,
        functionName: 'contribute',
        args: [BigInt(dealId)],
        value: parseEther(amount),
      });

      if (!publicClient) throw new Error('Public client not available');
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      return { hash, receipt };
    },
    [walletClient, contractAddress, publicClient]
  );

  /**
   * Get deal info
   */
  const getDealInfo = useCallback(
    async (dealId: string): Promise<CommunityDealInfo | null> => {
      if (!publicClient || !contractAddress) return null;

      try {
        const result = await publicClient.readContract({
          address: contractAddress,
          abi: COMMUNITY_DEAL_ABI,
          functionName: 'getDealInfo',
          args: [BigInt(dealId)],
        });

        return formatDealInfo(dealId, result);
      } catch (error) {
        console.error('Error fetching deal info:', error);
        return null;
      }
    },
    [publicClient, contractAddress]
  );

  /**
   * Get participant info
   */
  const getParticipantInfo = useCallback(
    async (
      dealId: string,
      address: Address,
      targetPrice: bigint
    ): Promise<ParticipantInfo | null> => {
      if (!publicClient || !contractAddress) return null;

      try {
        const result = await publicClient.readContract({
          address: contractAddress,
          abi: COMMUNITY_DEAL_ABI,
          functionName: 'getParticipantInfo',
          args: [BigInt(dealId), address],
        });

        return formatParticipantInfo(result, targetPrice);
      } catch (error) {
        console.error('Error fetching participant info:', error);
        return null;
      }
    },
    [publicClient, contractAddress]
  );

  /**
   * Get all participants
   */
  const getDealParticipants = useCallback(
    async (dealId: string): Promise<Address[]> => {
      if (!publicClient || !contractAddress) return [];

      try {
        const result = await publicClient.readContract({
          address: contractAddress,
          abi: COMMUNITY_DEAL_ABI,
          functionName: 'getDealParticipants',
          args: [BigInt(dealId)],
        });

        return result as Address[];
      } catch (error) {
        console.error('Error fetching participants:', error);
        return [];
      }
    },
    [publicClient, contractAddress]
  );

  /**
   * Cancel a deal
   */
  const cancelDeal = useCallback(
    async (dealId: string) => {
      if (!walletClient || !contractAddress) {
        throw new Error('Wallet not connected or contract not deployed');
      }

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: COMMUNITY_DEAL_ABI,
        functionName: 'cancelDeal',
        args: [BigInt(dealId)],
      });

      if (!publicClient) throw new Error('Public client not available');
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      return { hash, receipt };
    },
    [walletClient, contractAddress, publicClient]
  );

  /**
   * Request refund
   */
  const refund = useCallback(
    async (dealId: string) => {
      if (!walletClient || !contractAddress) {
        throw new Error('Wallet not connected or contract not deployed');
      }

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: COMMUNITY_DEAL_ABI,
        functionName: 'refund',
        args: [BigInt(dealId)],
      });

      if (!publicClient) throw new Error('Public client not available');
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      return { hash, receipt };
    },
    [walletClient, contractAddress, publicClient]
  );

  /**
   * Vote on proposal
   */
  const vote = useCallback(
    async (dealId: string, proposalHash: `0x${string}`) => {
      if (!walletClient || !contractAddress) {
        throw new Error('Wallet not connected or contract not deployed');
      }

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: COMMUNITY_DEAL_ABI,
        functionName: 'vote',
        args: [BigInt(dealId), proposalHash],
      });

      if (!publicClient) throw new Error('Public client not available');
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      return { hash, receipt };
    },
    [walletClient, contractAddress, publicClient]
  );

  /**
   * Get proposal votes
   */
  const getProposalVotes = useCallback(
    async (dealId: string, proposalHash: `0x${string}`): Promise<bigint> => {
      if (!publicClient || !contractAddress) return 0n;

      try {
        const result = await publicClient.readContract({
          address: contractAddress,
          abi: COMMUNITY_DEAL_ABI,
          functionName: 'getProposalVotes',
          args: [BigInt(dealId), proposalHash],
        });

        return result as bigint;
      } catch (error) {
        console.error('Error fetching proposal votes:', error);
        return 0n;
      }
    },
    [publicClient, contractAddress]
  );

  /**
   * Mark domain as purchased (admin)
   */
  const markDomainPurchased = useCallback(
    async (dealId: string, tokenId: string) => {
      if (!walletClient || !contractAddress) {
        throw new Error('Wallet not connected or contract not deployed');
      }

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: COMMUNITY_DEAL_ABI,
        functionName: 'markDomainPurchased',
        args: [BigInt(dealId), BigInt(tokenId)],
      });

      if (!publicClient) throw new Error('Public client not available');
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      return { hash, receipt };
    },
    [walletClient, contractAddress, publicClient]
  );

  /**
   * Set fractional token address (admin)
   */
  const setFractionalToken = useCallback(
    async (dealId: string, fractionalTokenAddress: Address) => {
      if (!walletClient || !contractAddress) {
        throw new Error('Wallet not connected or contract not deployed');
      }

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: COMMUNITY_DEAL_ABI,
        functionName: 'setFractionalToken',
        args: [BigInt(dealId), fractionalTokenAddress],
      });

      if (!publicClient) throw new Error('Public client not available');
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      return { hash, receipt };
    },
    [walletClient, contractAddress, publicClient]
  );

  return {
    contractAddress,
    createDeal,
    contribute,
    getDealInfo,
    getParticipantInfo,
    getDealParticipants,
    cancelDeal,
    refund,
    vote,
    getProposalVotes,
    markDomainPurchased,
    setFractionalToken,
  };
}

/**
 * Hook to watch contract events
 */
export function useWatchCommunityDealEvents(
  onDealCreated?: (dealId: string, domainName: string, creator: Address) => void,
  onContribution?: (dealId: string, contributor: Address, amount: bigint) => void,
  onDealFunded?: (dealId: string) => void
) {
  const chainId = useChainId();
  const publicClient = usePublicClient();
  const contractAddress = COMMUNITY_DEAL_ADDRESSES[chainId];

  // Implement event watching using viem's watchContractEvent
  // This would be used for real-time updates
}
