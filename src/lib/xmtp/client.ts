'use client';

// XMTP client utilities
// Note: XMTP will be initialized in the provider component

export interface XMTPMessage {
  id: string;
  content: string;
  senderAddress: string;
  sent: Date;
  contentType?: string;
}

export interface XMTPConversation {
  peerAddress: string;
  createdAt: Date;
  context?: {
    conversationId: string;
    metadata: Record<string, any>;
  };
}

export interface TradeCard {
  type: 'trade_card';
  domainName: string;
  tokenId: string;
  price: string;
  currency: string;
  action: 'buy' | 'offer' | 'counter';
  amount?: string;
}

export function createTradeCardMessage(data: Omit<TradeCard, 'type'>): string {
  return JSON.stringify({
    type: 'trade_card',
    ...data,
  });
}

export function parseTradeCardMessage(content: string): TradeCard | null {
  try {
    const parsed = JSON.parse(content);
    if (parsed.type === 'trade_card') {
      return parsed as TradeCard;
    }
  } catch (error) {
    // Not a trade card message
  }
  return null;
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function isTradeCardMessage(content: string): boolean {
  try {
    const parsed = JSON.parse(content);
    return parsed.type === 'trade_card';
  } catch {
    return false;
  }
}

/**
 * Create a trade card for a domain listing (Buy Now)
 */
export function createBuyNowTradeCard(
  domainName: string,
  tokenId: string,
  price: string,
  currency: string = 'ETH'
): string {
  return createTradeCardMessage({
    domainName,
    tokenId,
    price,
    currency,
    action: 'buy',
  });
}

/**
 * Create a trade card for making an offer
 */
export function createOfferTradeCard(
  domainName: string,
  tokenId: string,
  amount: string,
  currency: string = 'ETH'
): string {
  return createTradeCardMessage({
    domainName,
    tokenId,
    price: '0', // Not buying, making offer
    currency,
    action: 'offer',
    amount,
  });
}

/**
 * Create a counter offer trade card
 */
export function createCounterOfferTradeCard(
  domainName: string,
  tokenId: string,
  amount: string,
  currency: string = 'ETH'
): string {
  return createTradeCardMessage({
    domainName,
    tokenId,
    price: '0',
    currency,
    action: 'counter',
    amount,
  });
}
