'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Brain, Target, AlertCircle, Sparkles } from 'lucide-react';
import { predictDomainPrice, generatePriceHistory, extractDomainCharacteristics } from '@/lib/analytics/pricePredictor';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EnhancedPriceChartProps {
  domain: {
    name: string;
    tld: string;
    price?: string;
    keywords?: string[];
    id?: string;
  };
}

export default function EnhancedPriceChart({ domain }: EnhancedPriceChartProps) {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  // Get current price or use default
  const currentPrice = domain.price ? parseFloat(domain.price) : 2.5;

  // Generate prediction
  const characteristics = extractDomainCharacteristics(domain);
  const prediction = predictDomainPrice(characteristics);

  // Generate price history
  const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 180;
  const priceHistory = generatePriceHistory(currentPrice, days);

  // Calculate stats from history
  const prices = priceHistory.map(p => p.price);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const firstPrice = prices[0];
  const priceChange = currentPrice - firstPrice;
  const priceChangePercent = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;

  useEffect(() => {
    // Simulate loading
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
      case 'BUY':
      case 'UNDERPRICED':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'SELL':
      case 'OVERPRICED':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Prediction Alert */}
      <Alert className={`border-2 ${getRecommendationColor(prediction.recommendation)}`}>
        <Brain className="h-5 w-5" />
        <AlertDescription className="ml-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg mb-1">
                AI Prediction: {prediction.recommendation}
              </p>
              <p className="text-sm opacity-90">{prediction.reasoning}</p>
            </div>
            <Badge variant="outline" className="ml-4">
              {prediction.confidence}% confidence
            </Badge>
          </div>
        </AlertDescription>
      </Alert>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Current Price
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{formatPrice(currentPrice)}</span>
              {priceChangePercent !== 0 && (
                <Badge variant={priceChangePercent > 0 ? 'default' : 'destructive'} className="text-xs">
                  {priceChangePercent > 0 ? '+' : ''}{priceChangePercent.toFixed(1)}%
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Predicted Value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold">{formatPrice(prediction.predictedPrice)}</span>
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Price Range
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">↑</span>
                <span>{formatPrice(prediction.priceRange.max)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-red-500">↓</span>
                <span>{formatPrice(prediction.priceRange.min)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Average Price
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{formatPrice(avgPrice)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Price Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Price History</CardTitle>
              <CardDescription>Track price movements over time</CardDescription>
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
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={priceHistory}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
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

      {/* AI Analysis Factors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Price Analysis
          </CardTitle>
          <CardDescription>
            Factors influencing the predicted price
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {prediction.factors.map((factor, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className={`mt-1 ${factor.impact > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {factor.impact > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm">{factor.name}</p>
                    <Badge variant={factor.impact > 0 ? 'default' : 'destructive'} className="text-xs">
                      {factor.impact > 0 ? '+' : ''}{factor.impact}%
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{factor.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Investment Recommendation */}
      <Card className={`border-2 ${getRecommendationColor(prediction.recommendation)}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Investment Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{prediction.recommendation}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on {prediction.factors.length} analysis factors
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Confidence Level</p>
                <p className="text-3xl font-bold">{prediction.confidence}%</p>
              </div>
            </div>
            
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm leading-relaxed">{prediction.reasoning}</p>
            </div>

            {prediction.recommendation === 'UNDERPRICED' && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This domain appears to be significantly undervalued. Consider making an offer before the price increases.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
