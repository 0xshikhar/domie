import { prisma } from '@/lib/prisma';

export type ActivityType = 'DOMAIN_LISTED' | 'DOMAIN_SOLD' | 'OFFER_MADE' | 'DEAL_CREATED' | 'DEAL_FUNDED';

interface CreateActivityParams {
  type: ActivityType;
  title: string;
  description?: string;
  userId?: string;
  domainId?: string;
}

export async function createActivity({
  type,
  title,
  description,
  userId,
  domainId,
}: CreateActivityParams) {
  try {
    const activity = await prisma.activity.create({
      data: {
        type,
        title,
        description,
        userId,
        domainId,
      },
    });
    return activity;
  } catch (error) {
    console.error('Error creating activity:', error);
    return null;
  }
}

export async function createDomainListedActivity(
  domainId: string,
  domainName: string,
  price: string,
  currency: string,
  userId?: string
) {
  return createActivity({
    type: 'DOMAIN_LISTED',
    title: `${domainName} listed for sale`,
    description: `Domain listed for ${price} ${currency}`,
    userId,
    domainId,
  });
}

export async function createDomainSoldActivity(
  domainId: string,
  domainName: string,
  price: string,
  currency: string,
  buyerId?: string
) {
  return createActivity({
    type: 'DOMAIN_SOLD',
    title: `${domainName} sold!`,
    description: `Domain sold for ${price} ${currency}`,
    userId: buyerId,
    domainId,
  });
}

export async function createOfferMadeActivity(
  domainId: string,
  domainName: string,
  offerAmount: string,
  currency: string,
  offererId?: string
) {
  return createActivity({
    type: 'OFFER_MADE',
    title: `Offer made on ${domainName}`,
    description: `New offer: ${offerAmount} ${currency}`,
    userId: offererId,
    domainId,
  });
}

export async function createDealCreatedActivity(
  domainId: string,
  domainName: string,
  targetPrice: string,
  creatorId?: string
) {
  return createActivity({
    type: 'DEAL_CREATED',
    title: `Community deal created for ${domainName}`,
    description: `Target price: ${targetPrice} ETH`,
    userId: creatorId,
    domainId,
  });
}

export async function createDealFundedActivity(
  domainId: string,
  domainName: string,
  totalAmount: string,
  participantCount: number
) {
  return createActivity({
    type: 'DEAL_FUNDED',
    title: `${domainName} deal fully funded!`,
    description: `${participantCount} participants raised ${totalAmount} ETH`,
    domainId,
  });
}
