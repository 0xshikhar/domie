'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { usePrivy } from '@privy-io/react-auth';
import { Heart, FileText, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface PortfolioData {
  ownedDomains: any[];
  watchlist: any[];
  offers: any[];
  offersMade: any[];
  offersReceived: any[];
  stats: {
    ownedCount: number;
    watchlistCount: number;
    activeOffersMadeCount: number;
    activeOffersReceivedCount: number;
    totalActiveOffersCount: number;
    portfolioValue: string;
  };
}

export default function PortfolioPage() {
  const { authenticated, login, user } = usePrivy();
  const [activeTab, setActiveTab] = useState('owned');
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch portfolio data
  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!authenticated || !user?.wallet?.address) return;

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/portfolio?address=${user.wallet.address}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch portfolio data');
        }

        const data = await response.json();
        setPortfolioData(data);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        toast.error('Failed to load portfolio data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolioData();
  }, [authenticated, user?.wallet?.address]);

  // Remove from watchlist
  const handleRemoveFromWatchlist = async (domainId: string) => {
    if (!user?.wallet?.address) return;

    try {
      const response = await fetch(
        `/api/watchlist?address=${user.wallet.address}&domainId=${domainId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to remove from watchlist');
      }

      toast.success('Removed from watchlist');
      
      // Refresh portfolio data
      if (portfolioData) {
        setPortfolioData({
          ...portfolioData,
          watchlist: portfolioData.watchlist.filter((w) => w.domain.id !== domainId),
          stats: {
            ...portfolioData.stats,
            watchlistCount: portfolioData.stats.watchlistCount - 1,
          },
        });
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      toast.error('Failed to remove from watchlist');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h2 className="text-2xl font-bold mb-2">Connect to View Portfolio</h2>
              <p className="text-muted-foreground">
                Connect your wallet to see your domains, watchlist, and offers
              </p>
            </div>
            <Button onClick={login} size="lg">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Portfolio</h1>
          <p className="text-muted-foreground">
            Manage your domains, watchlist, and offers
          </p>
        </div>

        {/* Stats Overview */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Owned Domains</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {portfolioData?.stats.ownedCount || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Watchlist</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {portfolioData?.stats.watchlistCount || 0}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {portfolioData?.stats.totalActiveOffersCount || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {portfolioData?.stats.activeOffersMadeCount || 0} made • {portfolioData?.stats.activeOffersReceivedCount || 0} received
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {portfolioData?.stats.portfolioValue || '0'} ETH
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="owned">Owned</TabsTrigger>
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
          </TabsList>

          {/* Owned Domains */}
          <TabsContent value="owned" className="space-y-4">
            {!portfolioData || portfolioData.ownedDomains.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No domains owned</h3>
                  <p className="text-muted-foreground mb-4">
                    You don't own any domains yet. Browse the marketplace to find your perfect domain.
                  </p>
                  <Link href="/discover">
                    <Button>Browse Domains</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              portfolioData.ownedDomains.map((domain) => (
                <Card key={domain.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2">{domain.name}</h3>
                        <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                          <span>{domain.views || 0} views</span>
                          <span>{domain.offerCount || 0} offers</span>
                        </div>
                        {domain.isListed && domain.price && (
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold">{domain.price}</span>
                            <span className="text-lg text-muted-foreground">{domain.currency}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge variant={domain.isListed ? 'default' : 'secondary'}>
                          {domain.isListed ? 'Listed' : 'Not Listed'}
                        </Badge>
                        <Link href={`/domain/${domain.name}`}>
                          <Button variant="outline" size="sm">
                            View Page
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Watchlist */}
          <TabsContent value="watchlist" className="space-y-4">
            {!portfolioData || portfolioData.watchlist.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No domains in watchlist</h3>
                  <p className="text-muted-foreground mb-4">
                    Start watching domains to track their prices and activity.
                  </p>
                  <Link href="/discover">
                    <Button>Browse Domains</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              portfolioData.watchlist.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{item.domain.name}</h3>
                        {item.domain.isListed && item.domain.price && (
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">{item.domain.price}</span>
                            <span className="text-muted-foreground">{item.domain.currency}</span>
                          </div>
                        )}
                        {!item.domain.isListed && (
                          <Badge variant="secondary">Not Listed</Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          onClick={() => handleRemoveFromWatchlist(item.domain.id)}
                        >
                          Remove
                        </Button>
                        <Link href={`/domain/${item.domain.name}`}>
                          <Button>View</Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Offers */}
          <TabsContent value="offers" className="space-y-6">
            {!portfolioData || portfolioData.offers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No offers</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't made or received any offers yet.
                  </p>
                  <Link href="/discover">
                    <Button>Browse Domains</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Offers Made Section */}
                {portfolioData.offersMade && portfolioData.offersMade.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Offers Made ({portfolioData.offersMade.length})
                    </h3>
                    <div className="space-y-3">
                      {portfolioData.offersMade.map((offer) => {
                        const expiryDate = new Date(offer.expiryDate);
                        const now = new Date();
                        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        const expiresIn = daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : 'Expired';
                        
                        return (
                          <Card key={offer.id}>
                            <CardContent className="p-6">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-xl font-bold">{offer.domain.name}</h3>
                                    <Badge variant="outline" className="text-xs">You offered</Badge>
                                  </div>
                                  <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-2xl font-bold">{offer.amount}</span>
                                    <span className="text-muted-foreground">{offer.currency}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">Expires: {expiresIn}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <Badge variant={offer.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                    {offer.status}
                                  </Badge>
                                  <Link href={`/domain/${offer.domain.name}`}>
                                    <Button variant="outline" size="sm">
                                      View Domain
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Offers Received Section */}
                {portfolioData.offersReceived && portfolioData.offersReceived.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Offers Received ({portfolioData.offersReceived.length})
                    </h3>
                    <div className="space-y-3">
                      {portfolioData.offersReceived.map((offer) => {
                        const expiryDate = new Date(offer.expiryDate);
                        const now = new Date();
                        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        const expiresIn = daysUntilExpiry > 0 ? `${daysUntilExpiry} days` : 'Expired';
                        
                        return (
                          <Card key={offer.id} className="border-primary/20">
                            <CardContent className="p-6">
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="text-xl font-bold">{offer.domain.name}</h3>
                                    <Badge variant="default" className="text-xs">Received</Badge>
                                  </div>
                                  <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-2xl font-bold">{offer.amount}</span>
                                    <span className="text-muted-foreground">{offer.currency}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    From: {offer.offerer.slice(0, 6)}...{offer.offerer.slice(-4)} • Expires: {expiresIn}
                                  </p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                  <Badge variant={offer.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                    {offer.status}
                                  </Badge>
                                  <div className="flex gap-2">
                                    {offer.status === 'ACTIVE' && (
                                      <>
                                        <Button variant="default" size="sm">
                                          Accept
                                        </Button>
                                        <Button variant="outline" size="sm">
                                          Reject
                                        </Button>
                                      </>
                                    )}
                                    <Link href={`/domain/${offer.domain.name}`}>
                                      <Button variant="outline" size="sm">
                                        View
                                      </Button>
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
