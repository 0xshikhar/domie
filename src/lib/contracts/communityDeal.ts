import { Address, parseEther, formatEther } from 'viem';

// Contract ABI - Add full ABI after compilation
export const COMMUNITY_DEAL_ABI = [
  // Events
  {
    type: 'event',
    name: 'DealCreated',
    inputs: [
      { name: 'dealId', type: 'uint256', indexed: true },
      { name: 'domainName', type: 'string', indexed: false },
      { name: 'creator', type: 'address', indexed: true },
      { name: 'targetPrice', type: 'uint256', indexed: false },
      { name: 'deadline', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'ContributionMade',
    inputs: [
      { name: 'dealId', type: 'uint256', indexed: true },
      { name: 'contributor', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'DealFunded',
    inputs: [
      { name: 'dealId', type: 'uint256', indexed: true },
      { name: 'totalAmount', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'DealExecuted',
    inputs: [
      { name: 'dealId', type: 'uint256', indexed: true },
      { name: 'tokenId', type: 'uint256', indexed: false },
      { name: 'fractionalToken', type: 'address', indexed: false },
    ],
  },
  // Functions
  {
    type: 'function',
    name: 'createDeal',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'domainName', type: 'string' },
      { name: 'targetPrice', type: 'uint256' },
      { name: 'minContribution', type: 'uint256' },
      { name: 'maxParticipants', type: 'uint256' },
      { name: 'durationInDays', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'contribute',
    stateMutability: 'payable',
    inputs: [{ name: 'dealId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getDealInfo',
    stateMutability: 'view',
    inputs: [{ name: 'dealId', type: 'uint256' }],
    outputs: [
      { name: 'domainName', type: 'string' },
      { name: 'creator', type: 'address' },
      { name: 'targetPrice', type: 'uint256' },
      { name: 'currentAmount', type: 'uint256' },
      { name: 'participantCount', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
      { name: 'status', type: 'uint8' },
      { name: 'purchased', type: 'bool' },
      { name: 'domainTokenId', type: 'uint256' },
      { name: 'fractionalTokenAddress', type: 'address' },
    ],
  },
  {
    type: 'function',
    name: 'getParticipantInfo',
    stateMutability: 'view',
    inputs: [
      { name: 'dealId', type: 'uint256' },
      { name: 'participant', type: 'address' },
    ],
    outputs: [
      { name: 'contribution', type: 'uint256' },
      { name: 'refunded', type: 'bool' },
      { name: 'shares', type: 'uint256' },
    ],
  },
  {
    type: 'function',
    name: 'getDealParticipants',
    stateMutability: 'view',
    inputs: [{ name: 'dealId', type: 'uint256' }],
    outputs: [{ name: '', type: 'address[]' }],
  },
  {
    type: 'function',
    name: 'refund',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'dealId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'cancelDeal',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'dealId', type: 'uint256' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'vote',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'dealId', type: 'uint256' },
      { name: 'proposalHash', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getProposalVotes',
    stateMutability: 'view',
    inputs: [
      { name: 'dealId', type: 'uint256' },
      { name: 'proposalHash', type: 'bytes32' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'markDomainPurchased',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'dealId', type: 'uint256' },
      { name: 'tokenId', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'setFractionalToken',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'dealId', type: 'uint256' },
      { name: 'fractionalTokenAddress', type: 'address' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'withdrawForPurchase',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'dealId', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
] as const;

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

// Contract addresses (update after deployment)
export const COMMUNITY_DEAL_ADDRESSES: Record<number, Address> = {
  // Doma Chain
  97476: '0x216C3C0e1EF077b2268CCAb94E39e538e59f801A', // Update after deployment
  // Base Sepolia
  84532: '0x0000000000000000000000000000000000000000',
};

export const DOMA_FRACTIONALIZATION_ADDRESSES: Record<number, Address> = {
  97476: '0x0000000000000000000000000000000000000000', // Official DOMA address
};

export const DOMA_OWNERSHIP_TOKEN_ADDRESSES: Record<number, Address> = {
  97476: '0x0000000000000000000000000000000000000000', // Official DOMA address
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

  const progressPercentage =
    targetPrice > 0n ? Number((currentAmount * 100n) / targetPrice) : 0;

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
    domainTokenId: domainTokenId > 0n ? domainTokenId : undefined,
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

  const sharePercentage =
    targetPrice > 0n
      ? Number((shares * 100n) / 10000n) // shares are stored as basis points
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
