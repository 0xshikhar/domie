import { Address, parseEther, formatEther } from 'viem';

export enum DealStatus {
  ACTIVE = 0,
  FUNDED = 1,
  EXECUTED = 2,
  CANCELLED = 3,
  REFUNDED = 4,
}

export interface CommunityDealInfo {
  dealId: string;
  domainName: string;
  creator: Address;
  targetPrice: bigint;
  currentAmount: bigint;
  participantCount: number;
  deadline: bigint;
  status: DealStatus;
  purchased: boolean;
  domainTokenId?: bigint;
  fractionalTokenAddress?: Address;
  progressPercentage: number;
}

export interface ParticipantInfo {
  contribution: bigint;
  refunded: boolean;
  shares: bigint;
  sharePercentage: number;
}

// DOMA Protocol Contract Addresses
// Doma Testnet
export const DOMA_OWNERSHIP_TOKEN_ADDRESSES: Record<number, Address> = {
  97476: '0x424bDf2E8a6F52Bd2c1C81D9437b0DC0309DF90f', // Doma Testnet
  11155111: '0x9A374915648f1352827fFbf0A7bB5752b6995eB7', // Sepolia
  84532: '0x2f45DfC5f4c9473fa72aBdFbd223d0979B265046', // Base Sepolia
};

export const DOMA_RECORD_ADDRESSES: Record<number, Address> = {
  97476: '0xF6A92E0f8bEa4174297B0219d9d47fEe335f84f8', // Doma Testnet
  11155111: '0x0000000000000000000000000000000000000000', // Sepolia (update if needed)
  84532: '0x0000000000000000000000000000000000000000', // Base Sepolia (update if needed)
};

export const DOMA_PROXY_RECORD_ADDRESSES: Record<number, Address> = {
  97476: '0xb1508299A01c02aC3B70c7A8B0B07105aaB29E99', // Doma Testnet
  11155111: '0xD9A0E86AACf2B01013728fcCa9F00093B9b4F3Ff', // Sepolia
  84532: '0xa40aA710F0C77DF3De6CEe7493d1FfF3715D59Da', // Base Sepolia
};

export const DOMA_CROSS_CHAIN_GATEWAY_ADDRESSES: Record<number, Address> = {
  97476: '0xCE1476C791ff195e462632bf9Eb22f3d3cA07388', // Doma Testnet
  11155111: '0xEC67EfB227218CCc3c7032a6507339E7B4D623Ad', // Sepolia
  84532: '0xC721925DF8268B1d4a1673D481eB446B3EDaAAdE', // Base Sepolia
};

export const DOMA_FORWARDER_ADDRESSES: Record<number, Address> = {
  97476: '0xf17beC16794e018E2F0453a1282c3DA3d121f410', // Doma Testnet
};

// Note: DOMA doesn't have a separate fractionalization contract yet
// The fractionalization is done through the Ownership Token contract
export const DOMA_FRACTIONALIZATION_ADDRESSES: Record<number, Address> = {
  97476: '0x424bDf2E8a6F52Bd2c1C81D9437b0DC0309DF90f', // Same as Ownership Token for now
};

/**
 * Helper to format deal info from contract response
 */
export function formatDealInfo(
  dealId: string,
  contractResponse: any
): CommunityDealInfo {
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
  ] = contractResponse;

  const progressPercentage = currentAmount >= targetPrice 
    ? 100 
    : Number((currentAmount * BigInt(100)) / targetPrice);

  return {
    dealId,
    domainName,
    creator: creator as Address,
    targetPrice,
    currentAmount,
    participantCount: Number(participantCount),
    deadline,
    status: Number(status) as DealStatus,
    purchased,
    domainTokenId: domainTokenId > BigInt(0) ? domainTokenId : undefined,
    fractionalTokenAddress:
      fractionalTokenAddress !==
      '0x0000000000000000000000000000000000000000'
        ? (fractionalTokenAddress as Address)
        : undefined,
    progressPercentage,
  };
}

/**
 * Helper to format participant info
 */
export function formatParticipantInfo(
  contractResponse: any,
  targetPrice: bigint
): ParticipantInfo {
  const [contribution, refunded, shares] = contractResponse;

  const sharePercentage = targetPrice > BigInt(0)
    ? Number((contribution * BigInt(100)) / targetPrice)
    : 0;

  return {
    contribution,
    refunded,
    shares,
    sharePercentage,
  };
}

/**
 * Calculate days remaining until deadline
 */
export function getDaysRemaining(deadline: bigint): number {
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (deadline <= now) return 0;
  
  const secondsRemaining = deadline - now;
  return Math.ceil(Number(secondsRemaining) / (24 * 60 * 60));
}

/**
 * Check if deal is expired
 */
export function isDealExpired(deadline: bigint): boolean {
  const now = BigInt(Math.floor(Date.now() / 1000));
  return deadline < now;
}

/**
 * Get deal status label
 */
export function getDealStatusLabel(status: DealStatus): string {
  switch (status) {
    case DealStatus.ACTIVE:
      return 'Active';
    case DealStatus.FUNDED:
      return 'Funded';
    case DealStatus.EXECUTED:
      return 'Executed';
    case DealStatus.CANCELLED:
      return 'Cancelled';
    case DealStatus.REFUNDED:
      return 'Refunded';
    default:
      return 'Unknown';
  }
}
