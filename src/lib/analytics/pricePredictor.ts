/**
 * Advanced Price Intelligence & Prediction System
 * Analyzes domain characteristics and market data to predict future pricing
 */

interface DomainCharacteristics {
  name: string;
  tld: string;
  length: number;
  hasNumbers: boolean;
  hasHyphens: boolean;
  keywords: string[];
  currentPrice?: number;
}

interface PricePrediction {
  predictedPrice: number;
  confidence: number; // 0-100
  priceRange: {
    min: number;
    max: number;
  };
  factors: {
    name: string;
    impact: number; // -100 to +100
    description: string;
  }[];
  recommendation: 'BUY' | 'HOLD' | 'SELL' | 'OVERPRICED' | 'UNDERPRICED';
  reasoning: string;
}

interface MarketTrend {
  direction: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 0-100
  volume: number;
  avgPrice: number;
}

/**
 * Calculate base price based on domain characteristics
 */
function calculateBasePrice(domain: DomainCharacteristics): number {
  let basePrice = 1.0; // Start with 1 ETH

  // Length factor (shorter = more valuable)
  if (domain.length <= 3) {
    basePrice *= 10; // 3-letter domains are premium
  } else if (domain.length <= 5) {
    basePrice *= 5;
  } else if (domain.length <= 7) {
    basePrice *= 2;
  } else if (domain.length <= 10) {
    basePrice *= 1.2;
  } else {
    basePrice *= 0.5; // Longer domains are less valuable
  }

  // TLD factor
  const tldMultipliers: Record<string, number> = {
    'doma': 1.5,
    'eth': 2.0,
    'crypto': 1.8,
    'web3': 1.6,
    'dao': 1.4,
    'nft': 1.3,
  };
  basePrice *= tldMultipliers[domain.tld.toLowerCase()] || 1.0;

  // Penalize numbers and hyphens
  if (domain.hasNumbers) basePrice *= 0.6;
  if (domain.hasHyphens) basePrice *= 0.5;

  // Keyword bonus
  const premiumKeywords = ['ai', 'crypto', 'web3', 'nft', 'dao', 'defi', 'meta', 'verse'];
  const hasKeyword = premiumKeywords.some(kw => 
    domain.name.toLowerCase().includes(kw)
  );
  if (hasKeyword) basePrice *= 2;

  return basePrice;
}

/**
 * Analyze market trends for the TLD
 */
function analyzeMarketTrend(tld: string, recentSales: number = 10): MarketTrend {
  // Mock market data - in production, this would query real data
  const trendData: Record<string, MarketTrend> = {
    'doma': {
      direction: 'bullish',
      strength: 75,
      volume: recentSales,
      avgPrice: 3.5,
    },
    'eth': {
      direction: 'bullish',
      strength: 85,
      volume: recentSales * 2,
      avgPrice: 5.2,
    },
    'crypto': {
      direction: 'neutral',
      strength: 50,
      volume: recentSales,
      avgPrice: 2.8,
    },
  };

  return trendData[tld.toLowerCase()] || {
    direction: 'neutral',
    strength: 50,
    volume: recentSales,
    avgPrice: 2.0,
  };
}

/**
 * Generate price prediction with detailed analysis
 */
export function predictDomainPrice(domain: DomainCharacteristics): PricePrediction {
  const basePrice = calculateBasePrice(domain);
  const marketTrend = analyzeMarketTrend(domain.tld);
  
  const factors: PricePrediction['factors'] = [];

  // Length factor
  let lengthImpact = 0;
  if (domain.length <= 3) {
    lengthImpact = 80;
    factors.push({
      name: 'Ultra-short domain',
      impact: lengthImpact,
      description: `${domain.length}-character domains are highly valuable`,
    });
  } else if (domain.length <= 5) {
    lengthImpact = 50;
    factors.push({
      name: 'Short domain',
      impact: lengthImpact,
      description: 'Short domains are easier to remember and type',
    });
  } else if (domain.length > 12) {
    lengthImpact = -40;
    factors.push({
      name: 'Long domain',
      impact: lengthImpact,
      description: 'Longer domains are less desirable',
    });
  }

  // Market trend factor
  const trendImpact = marketTrend.direction === 'bullish' ? 30 : 
                      marketTrend.direction === 'bearish' ? -30 : 0;
  if (trendImpact !== 0) {
    factors.push({
      name: `${marketTrend.direction.charAt(0).toUpperCase() + marketTrend.direction.slice(1)} market`,
      impact: trendImpact,
      description: `.${domain.tld} domains are trending ${marketTrend.direction}`,
    });
  }

  // Keyword factor
  const premiumKeywords = ['ai', 'crypto', 'web3', 'nft', 'dao', 'defi'];
  const foundKeywords = premiumKeywords.filter(kw => 
    domain.name.toLowerCase().includes(kw)
  );
  if (foundKeywords.length > 0) {
    factors.push({
      name: 'Premium keywords',
      impact: 60,
      description: `Contains trending keywords: ${foundKeywords.join(', ')}`,
    });
  }

  // Numeric/hyphen penalty
  if (domain.hasNumbers) {
    factors.push({
      name: 'Contains numbers',
      impact: -25,
      description: 'Numbers reduce memorability and value',
    });
  }
  if (domain.hasHyphens) {
    factors.push({
      name: 'Contains hyphens',
      impact: -35,
      description: 'Hyphens make domains harder to remember',
    });
  }

  // Calculate final prediction
  const trendMultiplier = marketTrend.direction === 'bullish' ? 1.3 : 
                          marketTrend.direction === 'bearish' ? 0.8 : 1.0;
  
  const predictedPrice = basePrice * trendMultiplier;
  const priceRange = {
    min: predictedPrice * 0.7,
    max: predictedPrice * 1.5,
  };

  // Calculate confidence based on factors
  const confidence = Math.min(95, 60 + (factors.length * 5));

  // Determine recommendation
  let recommendation: PricePrediction['recommendation'] = 'HOLD';
  let reasoning = '';

  if (domain.currentPrice) {
    const ratio = domain.currentPrice / predictedPrice;
    if (ratio < 0.7) {
      recommendation = 'UNDERPRICED';
      reasoning = `Current price is ${((1 - ratio) * 100).toFixed(0)}% below predicted value. Strong buy opportunity.`;
    } else if (ratio > 1.3) {
      recommendation = 'OVERPRICED';
      reasoning = `Current price is ${((ratio - 1) * 100).toFixed(0)}% above predicted value. Consider waiting.`;
    } else if (ratio < 0.9) {
      recommendation = 'BUY';
      reasoning = 'Current price is below predicted value. Good buying opportunity.';
    } else if (ratio > 1.1) {
      recommendation = 'SELL';
      reasoning = 'Current price is above predicted value. Good time to sell.';
    } else {
      recommendation = 'HOLD';
      reasoning = 'Current price is fair based on market analysis.';
    }
  } else {
    reasoning = `Based on domain characteristics and market trends, estimated value is ${predictedPrice.toFixed(2)} ETH.`;
  }

  return {
    predictedPrice,
    confidence,
    priceRange,
    factors,
    recommendation,
    reasoning,
  };
}

/**
 * Generate historical price data for visualization
 */
export function generatePriceHistory(
  currentPrice: number,
  days: number = 30
): Array<{ timestamp: string; price: number; type: 'sale' | 'listing' | 'offer' }> {
  const history: Array<{ timestamp: string; price: number; type: 'sale' | 'listing' | 'offer' }> = [];
  const now = new Date();
  
  // Generate realistic price movement
  let price = currentPrice * 0.7; // Start lower
  const volatility = 0.15; // 15% volatility
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Random walk with upward bias
    const change = (Math.random() - 0.45) * volatility;
    price = price * (1 + change);
    
    // Ensure price doesn't go too far from current
    price = Math.max(currentPrice * 0.5, Math.min(currentPrice * 1.3, price));
    
    const type = Math.random() > 0.7 ? 'sale' : Math.random() > 0.5 ? 'listing' : 'offer';
    
    history.push({
      timestamp: date.toISOString(),
      price: parseFloat(price.toFixed(4)),
      type,
    });
  }
  
  // Ensure last point is close to current price
  if (history.length > 0) {
    history[history.length - 1].price = currentPrice;
  }
  
  return history;
}

/**
 * Extract domain characteristics from domain object
 */
export function extractDomainCharacteristics(domain: {
  name: string;
  tld: string;
  price?: string;
  keywords?: string[];
}): DomainCharacteristics {
  return {
    name: domain.name,
    tld: domain.tld,
    length: domain.name.length,
    hasNumbers: /\d/.test(domain.name),
    hasHyphens: /-/.test(domain.name),
    keywords: domain.keywords || [],
    currentPrice: domain.price ? parseFloat(domain.price) : undefined,
  };
}
