export interface Listing {
    id: string;
    offererAddress: string;
    orderbook: string;
    externalId: string;
    price: string;
    currency: {
      name: string;
      symbol: string;
      decimals: number;
      usdExchangeRate?: number;
    };
    createdAt: string;
    expiresAt: string;
  }
  
  export interface Token {
    tokenId: string;
    tokenAddress: string;
    networkId: string;
    ownerAddress: string;
    listings?: Listing[];
  }
  
  export interface Domain {
    id: string;
    name: string;
    tld: string;
    tokenId: string;
    owner: string;
    registrationDate?: string;
    expiryDate?: string;
    isListed: boolean;
    price?: string;
    currency: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
    views?: number;
    watchCount?: number;
    offerCount?: number;
    metadata?: Record<string, any>;
    tokens?: Token[];
  }
  
  export interface Offer {
    id: string;
    externalId: string;
    domainId: string;
    offerer: string;
    userId?: string;
    amount: string;
    currency: string;
    status: OfferStatus;
    expiryDate: string;
    createdAt: string;
  }
  
  export enum OfferStatus {
    ACTIVE = 'ACTIVE',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED',
  }
  
  export interface Transaction {
    id: string;
    type: string;
    from: string;
    to: string;
    amount?: string;
    timestamp: string;
    txHash: string;
  }
  
  export interface Deal {
    id: string;
    domainId: string;
    creatorId: string;
    title: string;
    description?: string;
    targetPrice: string;
    minContribution: string;
    maxParticipants: number;
    status: DealStatus;
    currentAmount: string;
    participantCount: number;
    startDate: string;
    endDate: string;
  }
  
  export enum DealStatus {
    ACTIVE = 'ACTIVE',
    FUNDED = 'FUNDED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    EXPIRED = 'EXPIRED',
  }
  
  export interface DomainFilter {
    isListed?: boolean;
    minPrice?: string;
    maxPrice?: string;
    tld?: string;
    owner?: string;
    search?: string;
  }
  