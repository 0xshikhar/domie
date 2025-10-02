import { parseEther, formatEther, type WalletClient } from 'viem';
import { TradeCard } from './client';

export interface GasEstimate {
  gasLimit: bigint;
  gasPrice: bigint;
  totalCost: string;
  totalCostUSD?: string;
}

export interface TransactionStatus {
  status: 'idle' | 'estimating' | 'pending' | 'confirming' | 'success' | 'error';
  hash?: string;
  error?: string;
  explorerUrl?: string;
}

export interface TradeExecutionParams {
  walletClient: WalletClient;
  tradeData: Omit<TradeCard, 'type'>;
  onStatusUpdate?: (status: TransactionStatus) => void;
}

export interface OfferParams {
  walletClient: WalletClient;
  tradeData: Omit<TradeCard, 'type'>;
  offerAmount: string;
  duration?: number;
  onStatusUpdate?: (status: TransactionStatus) => void;
}

/**
 * Estimate gas for a buy transaction
 */
export async function estimateBuyGas(
  walletClient: WalletClient,
  to: string,
  value: string
): Promise<GasEstimate> {
  try {
    const valueInWei = parseEther(value);
    
    // Use a simple estimate for gas
    // In production, you'd use the public client to estimate gas
    const gasLimit = BigInt(21000); // Standard ETH transfer
    const gasPrice = BigInt(20000000000); // 20 gwei fallback

    // Calculate total gas cost
    const gasCost = gasLimit * gasPrice;
    const totalCostWei = valueInWei + gasCost;

    return {
      gasLimit,
      gasPrice,
      totalCost: formatEther(totalCostWei),
    };
  } catch (error) {
    console.error('Gas estimation failed:', error);
    // Return fallback estimate
    return {
      gasLimit: BigInt(21000),
      gasPrice: BigInt(20000000000),
      totalCost: value,
    };
  }
}

/**
 * Execute a buy transaction
 */
export async function executeBuyTransaction({
  walletClient,
  tradeData,
  onStatusUpdate,
}: TradeExecutionParams): Promise<string> {
  try {
    onStatusUpdate?.({ status: 'estimating' });

    const priceInWei = parseEther(tradeData.price);
    
    // Get the token owner address (seller)
    // In a real implementation, you'd fetch this from the domain data
    const sellerAddress = '0x0000000000000000000000000000000000000000'; // Placeholder
    
    onStatusUpdate?.({ status: 'pending' });

    // Send transaction
    const hash = await walletClient.sendTransaction({
      to: sellerAddress as `0x${string}`,
      value: priceInWei,
      chain: walletClient.chain,
      account: walletClient.account!,
    });

    const chainId = walletClient.chain?.id;
    const explorerUrl = getExplorerUrl(chainId, hash);

    onStatusUpdate?.({ 
      status: 'confirming', 
      hash,
      explorerUrl,
    });

    // Wait for confirmation (optional - can be done separately)
    // const receipt = await walletClient.waitForTransactionReceipt({ hash });

    onStatusUpdate?.({ 
      status: 'success', 
      hash,
      explorerUrl,
    });

    return hash;
  } catch (error: any) {
    const errorMsg = error?.message || error?.shortMessage || 'Transaction failed';
    onStatusUpdate?.({ 
      status: 'error', 
      error: errorMsg,
    });
    throw error;
  }
}

/**
 * Submit an offer (creates offer in database and optionally on-chain)
 */
export async function submitOffer({
  walletClient,
  tradeData,
  offerAmount,
  duration = 7,
  onStatusUpdate,
}: OfferParams): Promise<{ offerId: string; hash?: string }> {
  try {
    onStatusUpdate?.({ status: 'pending' });

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + duration);

    // Create offer in backend
    const response = await fetch('/api/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        externalId: `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        domainId: tradeData.tokenId, // Use tokenId as domainId
        tokenId: tradeData.tokenId,
        domainName: tradeData.domainName,
        offerer: walletClient.account?.address,
        userId: walletClient.account?.address,
        amount: offerAmount,
        currency: tradeData.currency,
        expiryDate: expiryDate.toISOString(),
        domainOwner: '0x0000000000000000000000000000000000000000', // Placeholder
        domainPrice: tradeData.price,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create offer');
    }

    const offerData = await response.json();

    onStatusUpdate?.({ 
      status: 'success',
    });

    return { offerId: offerData.id };
  } catch (error: any) {
    const errorMsg = error?.message || 'Failed to submit offer';
    onStatusUpdate?.({ 
      status: 'error', 
      error: errorMsg,
    });
    throw error;
  }
}

/**
 * Get blockchain explorer URL for a transaction
 */
export function getExplorerUrl(chainId: number | undefined, hash: string): string {
  const explorers: Record<number, string> = {
    1: 'https://etherscan.io',
    11155111: 'https://sepolia.etherscan.io',
    97476: 'https://explorer-testnet.doma.xyz',
    8453: 'https://basescan.org',
    84532: 'https://sepolia.basescan.org',
  };

  const baseUrl = chainId ? explorers[chainId] : 'https://etherscan.io';
  return `${baseUrl}/tx/${hash}`;
}

/**
 * Format transaction status for display
 */
export function formatTransactionStatus(status: TransactionStatus): string {
  switch (status.status) {
    case 'idle':
      return 'Ready';
    case 'estimating':
      return 'Estimating gas...';
    case 'pending':
      return 'Waiting for confirmation...';
    case 'confirming':
      return 'Confirming transaction...';
    case 'success':
      return 'Transaction successful!';
    case 'error':
      return status.error || 'Transaction failed';
    default:
      return 'Unknown status';
  }
}

/**
 * Create a transaction receipt message for XMTP
 */
export function createTransactionReceipt(
  action: 'buy' | 'offer',
  domainName: string,
  amount: string,
  currency: string,
  hash?: string,
  explorerUrl?: string
): string {
  const actionText = action === 'buy' ? 'Purchase' : 'Offer';
  const receipt = [
    `✅ ${actionText} Receipt`,
    `Domain: ${domainName}`,
    `Amount: ${amount} ${currency}`,
  ];

  if (hash) {
    receipt.push(`TX: ${hash.slice(0, 10)}...${hash.slice(-8)}`);
  }

  if (explorerUrl) {
    receipt.push(`View: ${explorerUrl}`);
  }

  return receipt.join('\n');
}

/**
 * Parse domain owner from domain data
 */
export function getDomainOwner(domainData: any): string | null {
  try {
    // Try to get owner from tokens array
    if (domainData?.tokens?.[0]?.ownerAddress) {
      return domainData.tokens[0].ownerAddress;
    }
    
    // Fallback to claimedBy
    if (domainData?.claimedBy) {
      return domainData.claimedBy;
    }

    return null;
  } catch (error) {
    console.error('Failed to parse domain owner:', error);
    return null;
  }
}
