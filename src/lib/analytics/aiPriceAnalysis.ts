/**
 * AI-Powered Domain Price Analysis
 * Uses advanced algorithms and can integrate with Gemini AI for deeper insights
 */

export interface DetailedPriceFactor {
  category: string;
  name: string;
  impact: number; // -100 to +100
  weight: number; // 0-1 (importance)
  description: string;
  confidence: number; // 0-100
}

export interface AIAnalysisResult {
  predictedPrice: number;
  confidence: number;
  priceRange: { min: number; max: number };
  factors: DetailedPriceFactor[];
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
  reasoning: string;
  marketSentiment: 'very_bullish' | 'bullish' | 'neutral' | 'bearish' | 'very_bearish';
  riskLevel: 'low' | 'medium' | 'high';
  investmentScore: number; // 0-100
}

interface DomainData {
  name: string;
  tld: string;
  price?: number;
  keywords?: string[];
  length: number;
  hasNumbers: boolean;
  hasHyphens: boolean;
  registrationDate?: Date;
  expiryDate?: Date;
}

/**
 * Advanced factor analysis with multiple categories
 */
export function analyzeDetailedFactors(domain: DomainData): DetailedPriceFactor[] {
  const factors: DetailedPriceFactor[] = [];

  // 1. LENGTH ANALYSIS
  const lengthAnalysis = analyzeDomainLength(domain.length);
  factors.push({
    category: 'Domain Characteristics',
    name: lengthAnalysis.name,
    impact: lengthAnalysis.impact,
    weight: 0.25,
    description: lengthAnalysis.description,
    confidence: 95,
  });

  // 2. TLD ANALYSIS
  const tldAnalysis = analyzeTLD(domain.tld);
  factors.push({
    category: 'Extension Value',
    name: `${domain.tld.toUpperCase()} Extension`,
    impact: tldAnalysis.impact,
    weight: 0.20,
    description: tldAnalysis.description,
    confidence: 90,
  });

  // 3. KEYWORD ANALYSIS
  const keywordAnalysis = analyzeKeywords(domain.name, domain.keywords);
  if (keywordAnalysis.impact !== 0) {
    factors.push({
      category: 'Semantic Value',
      name: keywordAnalysis.name,
      impact: keywordAnalysis.impact,
      weight: 0.20,
      description: keywordAnalysis.description,
      confidence: 85,
    });
  }

  // 4. BRANDABILITY ANALYSIS
  const brandAnalysis = analyzeBrandability(domain.name, domain.hasNumbers, domain.hasHyphens);
  factors.push({
    category: 'Brand Potential',
    name: brandAnalysis.name,
    impact: brandAnalysis.impact,
    weight: 0.15,
    description: brandAnalysis.description,
    confidence: 80,
  });

  // 5. MEMORABILITY ANALYSIS
  const memoryAnalysis = analyzeMemorability(domain.name);
  factors.push({
    category: 'User Experience',
    name: memoryAnalysis.name,
    impact: memoryAnalysis.impact,
    weight: 0.10,
    description: memoryAnalysis.description,
    confidence: 75,
  });

  // 6. MARKET TREND ANALYSIS
  const trendAnalysis = analyzeMarketTrend(domain.tld);
  factors.push({
    category: 'Market Dynamics',
    name: trendAnalysis.name,
    impact: trendAnalysis.impact,
    weight: 0.10,
    description: trendAnalysis.description,
    confidence: 70,
  });

  return factors;
}

/**
 * Analyze domain length impact
 */
function analyzeDomainLength(length: number) {
  if (length === 1) {
    return {
      name: 'Single Character Domain',
      impact: 95,
      description: 'Extremely rare and valuable - only 36 possible combinations',
    };
  } else if (length === 2) {
    return {
      name: 'Two Character Domain',
      impact: 85,
      description: 'Ultra-premium - highly sought after by collectors and brands',
    };
  } else if (length === 3) {
    return {
      name: 'Three Character Domain',
      impact: 70,
      description: 'Premium short domain - perfect for acronyms and brands',
    };
  } else if (length <= 5) {
    return {
      name: 'Short Domain (4-5 chars)',
      impact: 50,
      description: 'Highly memorable and easy to type - great for branding',
    };
  } else if (length <= 7) {
    return {
      name: 'Medium Short Domain (6-7 chars)',
      impact: 25,
      description: 'Good balance between memorability and availability',
    };
  } else if (length <= 10) {
    return {
      name: 'Standard Length Domain (8-10 chars)',
      impact: 0,
      description: 'Average length - suitable for most use cases',
    };
  } else if (length <= 15) {
    return {
      name: 'Long Domain (11-15 chars)',
      impact: -25,
      description: 'Harder to remember and type - may reduce value',
    };
  } else {
    return {
      name: 'Very Long Domain (15+ chars)',
      impact: -50,
      description: 'Difficult to remember and prone to typos - significant value reduction',
    };
  }
}

/**
 * Analyze TLD value and market position - REALISTIC VERSION
 */
function analyzeTLD(tld: string) {
  const tldData: Record<string, { impact: number; description: string }> = {
    'eth': {
      impact: 60, // Reduced from 80
      description: 'Premium Web3 extension - highest demand in crypto space',
    },
    'crypto': {
      impact: 50, // Reduced from 70
      description: 'Strong crypto branding - widely recognized in blockchain industry',
    },
    'web3': {
      impact: 45, // Reduced from 65
      description: 'Emerging Web3 standard - growing adoption and recognition',
    },
    'dao': {
      impact: 40, // Reduced from 60
      description: 'DAO-focused extension - popular for decentralized organizations',
    },
    'nft': {
      impact: 35, // Reduced from 55
      description: 'NFT-specific branding - strong in digital collectibles market',
    },
    'doma': {
      impact: 30, // Reduced from 50
      description: 'Native Doma extension - established marketplace presence',
    },
    'defi': {
      impact: 35, // Reduced from 50
      description: 'DeFi-focused extension - valuable in decentralized finance',
    },
    'ai': {
      impact: 55, // Added AI TLD
      description: 'AI-focused extension - extremely hot trend in 2024',
    },
  };

  const data = tldData[tld.toLowerCase()] || {
    impact: 10, // Reduced from 20
    description: 'Standard extension - limited market recognition',
  };

  return data;
}

/**
 * Analyze keyword value and trends
 */
function analyzeKeywords(domainName: string, keywords?: string[]) {
  const premiumKeywords = {
    'ai': { impact: 50, trend: 'very_hot' }, // Reduced from 75
    'crypto': { impact: 45, trend: 'hot' }, // Reduced from 70
    'web3': { impact: 40, trend: 'hot' }, // Reduced from 65
    'nft': { impact: 35, trend: 'stable' }, // Reduced from 60
    'dao': { impact: 35, trend: 'growing' }, // Reduced from 60
    'defi': { impact: 40, trend: 'stable' }, // Reduced from 65
    'meta': { impact: 30, trend: 'growing' }, // Reduced from 55
    'verse': { impact: 25, trend: 'growing' }, // Reduced from 50
    'swap': { impact: 25, trend: 'stable' }, // Reduced from 45
    'token': { impact: 25, trend: 'stable' }, // Reduced from 45
    'chain': { impact: 30, trend: 'stable' }, // Reduced from 50
    'protocol': { impact: 20, trend: 'stable' }, // Reduced from 40
  };

  const name = domainName.toLowerCase();
  const foundKeywords: string[] = [];
  let totalImpact = 0;

  for (const [keyword, data] of Object.entries(premiumKeywords)) {
    if (name.includes(keyword)) {
      foundKeywords.push(keyword);
      totalImpact += data.impact;
    }
  }

  if (foundKeywords.length === 0) {
    return { name: '', impact: 0, description: '' };
  }

  // Reduced max impact and apply diminishing returns
  const avgImpact = Math.min(totalImpact / foundKeywords.length, 50); // Reduced from 80 to 50
  
  return {
    name: `Premium Keywords: ${foundKeywords.join(', ')}`,
    impact: avgImpact,
    description: `Contains ${foundKeywords.length} trending keyword${foundKeywords.length > 1 ? 's' : ''} - adds moderate value`,
  };
}

/**
 * Analyze brandability - STRICT VERSION
 */
function analyzeBrandability(name: string, hasNumbers: boolean, hasHyphens: boolean) {
  let impact = 0;
  let issues: string[] = [];
  let strengths: string[] = [];

  // Check for numbers - MUCH STRICTER PENALTY
  if (hasNumbers) {
    impact -= 70; // Increased from -30 to -70
    issues.push('contains numbers - severely reduces brand value');
  } else {
    strengths.push('no numbers');
  }

  // Check for hyphens - STRICTER PENALTY
  if (hasHyphens) {
    impact -= 60; // Increased from -40 to -60
    issues.push('contains hyphens - hard to communicate');
  } else {
    strengths.push('no hyphens');
  }

  // Check for vowels (more pronounceable)
  const vowels = name.match(/[aeiou]/gi);
  if (vowels && vowels.length >= name.length * 0.3) {
    impact += 15; // Reduced from 20 to 15
    strengths.push('pronounceable');
  }

  // Check for repeating characters
  if (/(.)\1{2,}/.test(name)) {
    impact -= 25; // Increased from -15 to -25
    issues.push('repeating characters');
  }

  // Check for mixed case patterns (like cYnThIa)
  if (/[a-z].*[A-Z]|[A-Z].*[a-z]/.test(name)) {
    impact -= 20;
    issues.push('mixed case pattern');
  }

  const description = issues.length > 0
    ? `Brandability severely impacted: ${issues.join(', ')}`
    : `Strong brand potential: ${strengths.join(', ')}`;

  return {
    name: hasNumbers || hasHyphens ? 'Poor Brandability' : 'Strong Brandability',
    impact,
    description,
  };
}

/**
 * Analyze memorability
 */
function analyzeMemorability(name: string) {
  let score = 50; // Base score

  // Shorter is more memorable
  if (name.length <= 5) score += 30;
  else if (name.length <= 7) score += 15;
  else if (name.length > 12) score -= 20;

  // Common patterns are more memorable
  if (/^[a-z]+$/.test(name.toLowerCase())) score += 10;
  
  // Palindromes are memorable
  if (name === name.split('').reverse().join('')) score += 25;

  // Dictionary words are memorable
  const commonWords = ['app', 'pay', 'buy', 'get', 'go', 'my', 'the', 'new', 'pro', 'max'];
  if (commonWords.some(word => name.toLowerCase().includes(word))) score += 15;

  const impact = Math.min(Math.max(score - 50, -40), 40);

  return {
    name: impact > 20 ? 'Highly Memorable' : impact > 0 ? 'Memorable' : impact < -20 ? 'Hard to Remember' : 'Average Memorability',
    impact,
    description: impact > 0 
      ? 'Easy to remember and recall - increases word-of-mouth potential'
      : 'May require repeated exposure for recall - consider marketing investment',
  };
}

/**
 * Analyze market trends
 */
function analyzeMarketTrend(tld: string) {
  const trends: Record<string, { impact: number; sentiment: string }> = {
    'eth': { impact: 40, sentiment: 'Very bullish - ETH ecosystem growing rapidly' },
    'crypto': { impact: 30, sentiment: 'Bullish - sustained crypto adoption' },
    'web3': { impact: 35, sentiment: 'Very bullish - Web3 infrastructure expanding' },
    'ai': { impact: 45, sentiment: 'Extremely bullish - AI revolution in progress' },
    'dao': { impact: 25, sentiment: 'Bullish - DAO adoption increasing' },
    'nft': { impact: 15, sentiment: 'Neutral - market stabilizing after peak' },
    'doma': { impact: 30, sentiment: 'Bullish - growing marketplace ecosystem' },
  };

  const trend = trends[tld.toLowerCase()] || { impact: 10, sentiment: 'Neutral - stable market conditions' };

  return {
    name: `Market Trend: ${trend.impact > 30 ? 'Very Bullish' : trend.impact > 15 ? 'Bullish' : 'Neutral'}`,
    impact: trend.impact,
    description: trend.sentiment,
  };
}

/**
 * Calculate final AI analysis - STRICT VERSION
 */
export function performAIAnalysis(domain: DomainData): AIAnalysisResult {
  const factors = analyzeDetailedFactors(domain);
  
  // Calculate weighted score
  let weightedScore = 0;
  let totalWeight = 0;
  
  factors.forEach(factor => {
    weightedScore += (factor.impact * factor.weight);
    totalWeight += factor.weight;
  });
  
  const normalizedScore = weightedScore / totalWeight;
  
  // Base price calculation - MUCH MORE CONSERVATIVE
  let basePrice = 0.1; // Start with 0.1 ETH instead of 1.0
  
  // Apply length multiplier - REDUCED MULTIPLIERS
  if (domain.length <= 3) basePrice *= 8; // Reduced from 15 to 8
  else if (domain.length <= 5) basePrice *= 4; // Reduced from 7 to 4
  else if (domain.length <= 7) basePrice *= 2; // Reduced from 3 to 2
  else if (domain.length <= 10) basePrice *= 1.2; // Reduced from 1.5 to 1.2
  else basePrice *= 0.5; // Penalty for long domains
  
  // CRITICAL: Apply severe penalties for numbers and hyphens
  if (domain.hasNumbers) {
    basePrice *= 0.15; // 85% reduction for numbers
  }
  if (domain.hasHyphens) {
    basePrice *= 0.2; // 80% reduction for hyphens
  }
  
  // Apply score multiplier - CAPPED to prevent over-inflation
  const scoreMultiplier = Math.max(0.3, Math.min(2.0, 1 + (normalizedScore / 100)));
  const predictedPrice = basePrice * scoreMultiplier;
  
  // Calculate confidence
  const avgConfidence = factors.reduce((sum, f) => sum + f.confidence, 0) / factors.length;
  
  // Determine recommendation
  let recommendation: AIAnalysisResult['recommendation'] = 'HOLD';
  let reasoning = '';
  
  if (domain.price) {
    const ratio = domain.price / predictedPrice;
    if (ratio < 0.6) {
      recommendation = 'STRONG_BUY';
      reasoning = `Significantly undervalued at ${((1 - ratio) * 100).toFixed(0)}% below AI prediction. Exceptional investment opportunity with high upside potential.`;
    } else if (ratio < 0.85) {
      recommendation = 'BUY';
      reasoning = `Undervalued by ${((1 - ratio) * 100).toFixed(0)}%. Good buying opportunity with solid growth potential.`;
    } else if (ratio > 1.4) {
      recommendation = 'STRONG_SELL';
      reasoning = `Overvalued by ${((ratio - 1) * 100).toFixed(0)}%. Price significantly exceeds AI valuation - high risk investment.`;
    } else if (ratio > 1.15) {
      recommendation = 'SELL';
      reasoning = `Overvalued by ${((ratio - 1) * 100).toFixed(0)}%. Consider taking profits or waiting for price correction.`;
    } else {
      recommendation = 'HOLD';
      reasoning = 'Fairly valued based on comprehensive AI analysis. Suitable for long-term holding.';
    }
  } else {
    reasoning = `AI valuation: ${predictedPrice.toFixed(2)} ETH based on ${factors.length} analytical factors.`;
  }
  
  // Market sentiment
  const trendFactor = factors.find(f => f.category === 'Market Dynamics');
  const marketSentiment = trendFactor && trendFactor.impact > 35 ? 'very_bullish' :
                         trendFactor && trendFactor.impact > 20 ? 'bullish' :
                         trendFactor && trendFactor.impact < -20 ? 'bearish' :
                         trendFactor && trendFactor.impact < -35 ? 'very_bearish' : 'neutral';
  
  // Risk level
  const riskLevel = avgConfidence > 85 ? 'low' : avgConfidence > 70 ? 'medium' : 'high';
  
  // Investment score (0-100)
  const investmentScore = Math.min(100, Math.max(0, 50 + normalizedScore));
  
  return {
    predictedPrice,
    confidence: avgConfidence,
    priceRange: {
      min: predictedPrice * 0.7,
      max: predictedPrice * 1.4,
    },
    factors,
    recommendation,
    reasoning,
    marketSentiment,
    riskLevel,
    investmentScore,
  };
}
