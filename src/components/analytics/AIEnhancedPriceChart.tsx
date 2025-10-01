'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Activity, Brain, Target, 
  AlertCircle, Sparkles, Shield, BarChart3, Zap 
} from 'lucide-react';
import { generatePriceHistory } from '@/lib/analytics/pricePredictor';
import { performAIAnalysis, type DetailedPriceFactor } from '@/lib/analytics/aiPriceAnalysis';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AIEnhancedPriceChartProps {
  domain: {
    name: string;
    tld: string;
    price?: string;
    keywords?: string[];
    id?: string;
    registrationDate?: Date;
    expiryDate?: Date;
  };
}

export default function AIEnhancedPriceChart({ domain }: AIEnhancedPriceChartProps) {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  const currentPrice = domain.price ? parseFloat(domain.price) : 2.5;

  // Prepare domain data for AI analysis
  const domainData = {
    name: domain.name,
    tld: domain.tld,
    price: currentPrice,
    keywords: domain.keywords,
    length: domain.name.length,
    hasNumbers: /\d/.test(domain.name),
    hasHyphens: /-/.test(domain.name),
    registrationDate: domain.registrationDate,
    expiryDate: domain.expiryDate,
  };

  // Perform AI analysis
  const aiAnalysis = performAIAnalysis(domainData);

  // Generate price history
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 180;
  const priceHistory = generatePriceHistory(currentPrice, days);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [timeRange]);

  const formatPrice = (value: number) => `${value.toFixed(4)} ETH`;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'STRONG_BUY':
        return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'BUY':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'SELL':
        return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      case 'STRONG_SELL':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment.includes('very_bullish')) return 'text-emerald-600';
    if (sentiment.includes('bullish')) return 'text-green-600';
    if (sentiment.includes('bearish')) return 'text-red-600';
    return 'text-blue-600';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  // Group factors by category
  const factorsByCategory = aiAnalysis.factors.reduce((acc, factor) => {
    if (!acc[factor.category]) acc[factor.category] = [];
    acc[factor.category].push(factor);
    return acc;
  }, {} as Record<string, DetailedPriceFactor[]>);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Recommendation Banner */}
      <Alert className={`border-2 ${getRecommendationColor(aiAnalysis.recommendation)}`}>
        <Brain className="h-6 w-6" />
        <AlertDescription className="ml-2">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="font-bold text-xl mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Recommendation: {aiAnalysis.recommendation.replace('_', ' ')}
              </p>
              <p className="text-sm opacity-90 mb-3">{aiAnalysis.reasoning}</p>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Risk: <span className={getRiskColor(aiAnalysis.riskLevel)}>{aiAnalysis.riskLevel.toUpperCase()}</span>
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Sentiment: <span className={getSentimentColor(aiAnalysis.marketSentiment)}>
                    {aiAnalysis.marketSentiment.replace('_', ' ').toUpperCase()}
                  </span>
                </span>
              </div>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="text-sm mb-2">
                {aiAnalysis.confidence.toFixed(0)}% Confidence
              </Badge>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Investment Score</p>
                <p className="text-2xl font-bold">{aiAnalysis.investmentScore.toFixed(0)}/100</p>
              </div>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Current Price
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatPrice(currentPrice)}</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-primary/20">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-primary" />
              AI Predicted Value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-primary">{formatPrice(aiAnalysis.predictedPrice)}</p>
              <Sparkles className="h-5 w-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Value Range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> High
                </span>
                <span className="font-semibold">{formatPrice(aiAnalysis.priceRange.max)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-red-600 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" /> Low
                </span>
                <span className="font-semibold">{formatPrice(aiAnalysis.priceRange.min)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Investment Score
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold mb-2">{aiAnalysis.investmentScore.toFixed(0)}/100</p>
            <Progress value={aiAnalysis.investmentScore} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Price Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Price History & Trends</CardTitle>
              <CardDescription>Historical price movements with AI predictions</CardDescription>
            </div>
            <Tabs value={timeRange} onValueChange={setTimeRange}>
              <TabsList>
                <TabsTrigger value="7d">7D</TabsTrigger>
                <TabsTrigger value="30d">30D</TabsTrigger>
                <TabsTrigger value="90d">90D</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={priceHistory}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={formatDate}
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                tickFormatter={(value) => `${value.toFixed(2)}`}
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                formatter={(value: number) => [formatPrice(value), 'Price']}
                labelFormatter={formatDate}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1}
                fill="url(#colorPrice)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* AI Analysis Factors - Grouped by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Detailed AI Price Analysis
          </CardTitle>
          <CardDescription>
            {aiAnalysis.factors.length} factors analyzed across {Object.keys(factorsByCategory).length} categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(factorsByCategory).map(([category, factors]) => (
              <div key={category} className="space-y-3">
                <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  {category}
                </h3>
                <div className="space-y-2 pl-3">
                  {factors.map((factor, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                      <div className={`mt-1 ${factor.impact > 0 ? 'text-green-600' : factor.impact < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {factor.impact > 0 ? <TrendingUp className="h-4 w-4" /> : 
                         factor.impact < 0 ? <TrendingDown className="h-4 w-4" /> : 
                         <Activity className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-semibold text-sm">{factor.name}</p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge 
                              variant={factor.impact > 0 ? 'default' : factor.impact < 0 ? 'destructive' : 'secondary'} 
                              className="text-xs"
                            >
                              {factor.impact > 0 ? '+' : ''}{factor.impact}%
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {factor.confidence}% sure
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{factor.description}</p>
                        <div className="mt-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Weight: {(factor.weight * 100).toFixed(0)}%</span>
                            <Progress value={factor.weight * 100} className="h-1 w-20" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Investment Summary */}
      <Card className={`border-2 ${getRecommendationColor(aiAnalysis.recommendation)}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Investment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Key Insights</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recommendation:</span>
                  <span className="font-semibold">{aiAnalysis.recommendation.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Confidence Level:</span>
                  <span className="font-semibold">{aiAnalysis.confidence.toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Market Sentiment:</span>
                  <span className={`font-semibold ${getSentimentColor(aiAnalysis.marketSentiment)}`}>
                    {aiAnalysis.marketSentiment.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Risk Level:</span>
                  <span className={`font-semibold ${getRiskColor(aiAnalysis.riskLevel)}`}>
                    {aiAnalysis.riskLevel.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Valuation</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Price:</span>
                  <span className="font-semibold">{formatPrice(currentPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AI Prediction:</span>
                  <span className="font-semibold text-primary">{formatPrice(aiAnalysis.predictedPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Potential Upside:</span>
                  <span className="font-semibold text-green-600">
                    {formatPrice(aiAnalysis.priceRange.max - currentPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Investment Score:</span>
                  <span className="font-semibold">{aiAnalysis.investmentScore.toFixed(0)}/100</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm leading-relaxed">{aiAnalysis.reasoning}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
