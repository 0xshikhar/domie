import { prisma } from '@/lib/prisma';

export interface PricePoint {
  timestamp: string;
  price: number;
  type: 'sale' | 'listing' | 'offer';
}

export interface PriceStats {
  currentPrice: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  priceChange: number;
  priceChangePercent: number;
  totalSales: number;
  suggestedPrice?: number;
}

export interface ComparableSale {
  domainName: string;
  price: number;
  soldAt: Date;
  similarity: number;
}

export async function getPriceHistory(
  domainId?: string,
  domainName?: string,
  tld?: string,
  timeRange: string = '7d'
): Promise<{ history: PricePoint[]; stats: PriceStats }> {
  const now = new Date();
  const startDate = getStartDate(timeRange);

  try {
    // Fetch domain analytics for price history
    const analytics = await prisma.domainAnalytics.findMany({
      where: {
        ...(domainId && { domainId }),
        timestamp: {
          gte: startDate,
        },
        event: {
          in: ['OFFER_MADE', 'BUY_CLICK'],
        },
      },
      include: {
        domain: true,
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Fetch activities for sales data
    const activities = await prisma.activity.findMany({
      where: {
        ...(domainId && { domainId }),
        type: {
          in: ['DOMAIN_LISTED', 'DOMAIN_SOLD', 'OFFER_MADE'],
        },
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        domain: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Build price history from activities
    const priceHistory: PricePoint[] = [];
    const prices: number[] = [];

    activities.forEach((activity) => {
      if (activity.domain?.price) {
        const price = parseFloat(activity.domain.price);
        if (!isNaN(price)) {
          priceHistory.push({
            timestamp: activity.createdAt.toISOString(),
            price,
            type: activity.type === 'DOMAIN_SOLD' ? 'sale' : 
                  activity.type === 'OFFER_MADE' ? 'offer' : 'listing',
          });
          prices.push(price);
        }
      }
    });

    // Calculate stats
    const currentPrice = prices.length > 0 ? prices[prices.length - 1] : 0;
    const avgPrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const firstPrice = prices.length > 0 ? prices[0] : 0;
    const priceChange = currentPrice - firstPrice;
    const priceChangePercent = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;

    // Count sales
    const totalSales = activities.filter(a => a.type === 'DOMAIN_SOLD').length;

    // Calculate suggested price
    const suggestedPrice = calculateSuggestedPrice(avgPrice, minPrice, maxPrice, totalSales);

    const stats: PriceStats = {
      currentPrice,
      avgPrice,
      minPrice,
      maxPrice,
      priceChange,
      priceChangePercent,
      totalSales,
      suggestedPrice,
    };

    return { history: priceHistory, stats };
  } catch (error) {
    console.error('Error fetching price history:', error);
    return {
      history: [],
      stats: {
        currentPrice: 0,
        avgPrice: 0,
        minPrice: 0,
        maxPrice: 0,
        priceChange: 0,
        priceChangePercent: 0,
        totalSales: 0,
      },
    };
  }
}

export async function getComparableSales(
  domainName: string,
  tld: string,
  limit: number = 10
): Promise<ComparableSale[]> {
  try {
    // Find similar domains (same TLD, similar length)
    const domainLength = domainName.length;
    const minLength = Math.max(1, domainLength - 2);
    const maxLength = domainLength + 2;

    const activities = await prisma.activity.findMany({
      where: {
        type: 'DOMAIN_SOLD',
        domain: {
          tld,
          name: {
            not: domainName,
          },
        },
      },
      include: {
        domain: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit * 2, // Get more to filter by length
    });

    const comparables: ComparableSale[] = activities
      .filter(activity => {
        if (!activity.domain) return false;
        const len = activity.domain.name.length;
        return len >= minLength && len <= maxLength;
      })
      .map(activity => {
        const similarity = calculateSimilarity(domainName, activity.domain!.name);
        return {
          domainName: activity.domain!.name,
          price: parseFloat(activity.domain!.price || '0'),
          soldAt: activity.createdAt,
          similarity,
        };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return comparables;
  } catch (error) {
    console.error('Error fetching comparable sales:', error);
    return [];
  }
}

export async function getMarketTrends(tld: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  try {
    const activities = await prisma.activity.findMany({
      where: {
        type: {
          in: ['DOMAIN_LISTED', 'DOMAIN_SOLD'],
        },
        domain: {
          tld,
        },
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        domain: true,
      },
    });

    const listings = activities.filter(a => a.type === 'DOMAIN_LISTED').length;
    const sales = activities.filter(a => a.type === 'DOMAIN_SOLD').length;
    const avgPrice = activities
      .filter(a => a.domain?.price)
      .reduce((sum, a) => sum + parseFloat(a.domain!.price!), 0) / activities.length || 0;

    return {
      listings,
      sales,
      avgPrice,
      conversionRate: listings > 0 ? (sales / listings) * 100 : 0,
      trend: sales > listings * 0.5 ? 'bullish' : 'bearish',
    };
  } catch (error) {
    console.error('Error fetching market trends:', error);
    return null;
  }
}

// Helper functions
function getStartDate(timeRange: string): Date {
  const now = new Date();
  switch (timeRange) {
    case '7d':
      return new Date(now.setDate(now.getDate() - 7));
    case '30d':
      return new Date(now.setDate(now.getDate() - 30));
    case '90d':
      return new Date(now.setDate(now.getDate() - 90));
    case 'all':
      return new Date(0); // Beginning of time
    default:
      return new Date(now.setDate(now.getDate() - 7));
  }
}

function calculateSuggestedPrice(
  avgPrice: number,
  minPrice: number,
  maxPrice: number,
  totalSales: number
): number {
  if (totalSales === 0) return avgPrice;

  // Weight average price more heavily with more sales data
  const confidence = Math.min(totalSales / 10, 1);
  const range = maxPrice - minPrice;
  const midPoint = minPrice + range * 0.6; // Slightly above middle

  // Blend average and midpoint based on confidence
  return avgPrice * confidence + midPoint * (1 - confidence);
}

function calculateSimilarity(domain1: string, domain2: string): number {
  // Simple similarity based on length difference and common characters
  const lengthDiff = Math.abs(domain1.length - domain2.length);
  const lengthSimilarity = 1 - lengthDiff / Math.max(domain1.length, domain2.length);

  // Calculate character overlap
  const chars1 = new Set(domain1.toLowerCase());
  const chars2 = new Set(domain2.toLowerCase());
  const intersection = new Set([...chars1].filter(x => chars2.has(x)));
  const union = new Set([...chars1, ...chars2]);
  const charSimilarity = intersection.size / union.size;

  // Weighted average
  return lengthSimilarity * 0.4 + charSimilarity * 0.6;
}
