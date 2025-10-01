import { NextRequest, NextResponse } from 'next/server';
import { getPriceHistory, getComparableSales, getMarketTrends } from '@/lib/analytics/priceAnalysis';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const domainId = searchParams.get('domainId');
    const domainName = searchParams.get('domainName');
    const tld = searchParams.get('tld');
    const timeRange = searchParams.get('timeRange') || '7d';
    const includeComparables = searchParams.get('includeComparables') === 'true';
    const includeTrends = searchParams.get('includeTrends') === 'true';

    // Fetch price history and stats
    const { history, stats } = await getPriceHistory(
      domainId || undefined,
      domainName || undefined,
      tld || undefined,
      timeRange
    );

    const response: any = {
      history,
      stats,
    };

    // Optionally include comparable sales
    if (includeComparables && domainName && tld) {
      const comparables = await getComparableSales(domainName, tld);
      response.comparables = comparables;
    }

    // Optionally include market trends
    if (includeTrends && tld) {
      const trends = await getMarketTrends(tld);
      response.trends = trends;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching price analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch price analytics' },
      { status: 500 }
    );
  }
}
