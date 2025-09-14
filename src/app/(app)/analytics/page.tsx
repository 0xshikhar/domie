'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Eye, TrendingUp, MessageCircle, Heart, DollarSign, Users } from 'lucide-react';

// Mock analytics data
const mockStats = {
  totalViews: 12543,
  totalOffers: 234,
  totalMessages: 156,
  totalWatchers: 89,
  conversionRate: 12.5,
  avgPrice: 2.8,
};

const mockTopDomains = [
  { name: 'alice.doma', views: 1234, offers: 8, price: '2.5' },
  { name: 'bob.doma', views: 892, offers: 5, price: '1.8' },
  { name: 'crypto.doma', views: 2341, offers: 15, price: '5.0' },
];

const mockRecentActivity = [
  { type: 'OFFER_MADE', domain: 'alice.doma', amount: '2.2 ETH', time: '2 hours ago' },
  { type: 'DOMAIN_LISTED', domain: 'web3.doma', amount: '4.2 ETH', time: '5 hours ago' },
  { type: 'DEAL_CREATED', domain: 'premium.doma', amount: '10 ETH', time: '1 day ago' },
];

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track performance and insights across the marketplace
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+12.5%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Offers</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalOffers}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+8.2%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalMessages}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+15.3%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Watchers</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalWatchers}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+5.7%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+2.1%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.avgPrice} ETH</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-red-600">-3.2%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics */}
        <Tabs defaultValue="domains" className="space-y-4">
          <TabsList>
            <TabsTrigger value="domains">Top Domains</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          {/* Top Domains */}
          <TabsContent value="domains" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Domains</CardTitle>
                <CardDescription>Domains with the most engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTopDomains.map((domain, index) => (
                    <div key={domain.name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{domain.name}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {domain.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {domain.offers} offers
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{domain.price} ETH</p>
                        <Badge variant="secondary">Listed</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recent Activity */}
          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest marketplace events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockRecentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                        {activity.type === 'OFFER_MADE' && <DollarSign className="h-5 w-5" />}
                        {activity.type === 'DOMAIN_LISTED' && <TrendingUp className="h-5 w-5" />}
                        {activity.type === 'DEAL_CREATED' && <Users className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{activity.type.replace('_', ' ')}</p>
                        <p className="text-sm text-muted-foreground">
                          {activity.domain} • {activity.amount}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends */}
          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Market Trends</CardTitle>
                <CardDescription>Insights and patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Popular TLDs</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>.doma</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: '85%' }} />
                          </div>
                          <span className="text-sm text-muted-foreground">85%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>.eth</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: '12%' }} />
                          </div>
                          <span className="text-sm text-muted-foreground">12%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Others</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: '3%' }} />
                          </div>
                          <span className="text-sm text-muted-foreground">3%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Price Ranges</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-muted-foreground mb-1">Under 1 ETH</p>
                          <p className="text-2xl font-bold">45%</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-muted-foreground mb-1">1-5 ETH</p>
                          <p className="text-2xl font-bold">38%</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-muted-foreground mb-1">5-10 ETH</p>
                          <p className="text-2xl font-bold">12%</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm text-muted-foreground mb-1">Over 10 ETH</p>
                          <p className="text-2xl font-bold">5%</p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
