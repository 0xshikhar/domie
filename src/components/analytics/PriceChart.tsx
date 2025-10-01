'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Brain, Target, AlertCircle } from 'lucide-react';
import { predictDomainPrice, generatePriceHistory, extractDomainCharacteristics } from '@/lib/analytics/pricePredictor';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PricePoint {
  timestamp: string;
  price: number;
  type: 'sale' | 'listing' | 'offer';
}

interface PriceStats {
  currentPrice: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  priceChange: number;
  priceChangePercent: number;
  totalSales: number;
  suggestedPrice?: number;
}

interface PriceChartProps {
  domainName?: string;
  domainId?: string;
  tld?: string;
  domain?: any; // Full domain object for predictions
}

export default function PriceChart({ domainName, domainId, tld }: PriceChartProps) {
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
  const [stats, setStats] = useState<PriceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    const fetchPriceData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (domainName) params.append('domainName', domainName);
        if (domainId) params.append('domainId', domainId);
        if (tld) params.append('tld', tld);
        params.append('timeRange', timeRange);

        const response = await fetch(`/api/analytics/price?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch price data');
        
        const data = await response.json();
        setPriceHistory(data.history || []);
        setStats(data.stats || null);
      } catch (error) {
        console.error('Error fetching price data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPriceData();
  }, [domainName, domainId, tld, timeRange]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Price Intelligence</CardTitle>
          <CardDescription>Loading price data...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  const formatPrice = (value: number) => `${value.toFixed(4)} ETH`;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Current Price</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{formatPrice(stats.currentPrice)}</span>
                {stats.priceChangePercent !== 0 && (
                  <Badge variant={stats.priceChangePercent > 0 ? 'default' : 'destructive'} className="text-xs">
                    {stats.priceChangePercent > 0 ? '+' : ''}{stats.priceChangePercent.toFixed(1)}%
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Average Price</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{formatPrice(stats.avgPrice)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Price Range</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span>{formatPrice(stats.maxPrice)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span>{formatPrice(stats.minPrice)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Sales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{stats.totalSales}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
          {priceHistory.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <p>No price history available</p>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>

      {/* Comparable Sales */}
      {stats?.suggestedPrice && (
        <Card>
          <CardHeader>
            <CardTitle>Price Suggestion</CardTitle>
            <CardDescription>AI-powered pricing recommendation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Suggested Price</p>
                  <p className="text-3xl font-bold">{formatPrice(stats.suggestedPrice)}</p>
                </div>
                <Badge variant="outline" className="text-sm">
                  Based on {stats.totalSales} sales
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>• Analyzed comparable domain sales in the {tld || 'same'} TLD</p>
                <p>• Considered market trends and demand indicators</p>
                <p>• Factored in domain length and memorability</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
