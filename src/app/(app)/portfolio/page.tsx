'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { usePrivy } from '@privy-io/react-auth';
import { Heart, FileText, TrendingUp, DollarSign } from 'lucide-react';
import Link from 'next/link';

// Mock data - will be replaced with real data
const mockOwnedDomains = [
  {
    id: '1',
    name: 'myname.doma',
    tokenId: '789',
    isListed: true,
    price: '1.5',
    currency: 'ETH',
    views: 234,
    offers: 3,
  },
];

const mockWatchlist = [
  {
    id: '2',
    name: 'premium.doma',
    price: '5.0',
    currency: 'ETH',
    priceChange: '+12%',
  },
  {
    id: '3',
    name: 'crypto.doma',
    price: '4.2',
    currency: 'ETH',
    priceChange: '-5%',
  },
];

const mockOffers = [
  {
    id: '1',
    domainName: 'alice.doma',
    amount: '2.2',
    currency: 'ETH',
    status: 'ACTIVE',
    expiresIn: '5 days',
  },
  {
    id: '2',
    domainName: 'bob.doma',
    amount: '1.5',
    currency: 'ETH',
    status: 'REJECTED',
    expiresIn: 'Expired',
  },
];

export default function PortfolioPage() {
  const { authenticated, login, user } = usePrivy();
  const [activeTab, setActiveTab] = useState('owned');

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Owned Domains</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockOwnedDomains.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Watchlist</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockWatchlist.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Offers</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockOffers.filter(o => o.status === 'ACTIVE').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.5 ETH</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="owned">Owned</TabsTrigger>
            <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            <TabsTrigger value="offers">Offers</TabsTrigger>
          </TabsList>

          {/* Owned Domains */}
          <TabsContent value="owned" className="space-y-4">
            {mockOwnedDomains.map((domain) => (
              <Card key={domain.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-2">{domain.name}</h3>
                      <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                        <span>{domain.views} views</span>
                        <span>{domain.offers} offers</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">{domain.price}</span>
                        <span className="text-lg text-muted-foreground">{domain.currency}</span>
                      </div>
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
            ))}
          </TabsContent>

          {/* Watchlist */}
          <TabsContent value="watchlist" className="space-y-4">
            {mockWatchlist.map((domain) => (
              <Card key={domain.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{domain.name}</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{domain.price}</span>
                        <span className="text-muted-foreground">{domain.currency}</span>
                        <Badge variant={domain.priceChange.startsWith('+') ? 'default' : 'destructive'}>
                          {domain.priceChange}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">Remove</Button>
                      <Link href={`/domain/${domain.name}`}>
                        <Button>View</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Offers */}
          <TabsContent value="offers" className="space-y-4">
            {mockOffers.map((offer) => (
              <Card key={offer.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{offer.domainName}</h3>
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-2xl font-bold">{offer.amount}</span>
                        <span className="text-muted-foreground">{offer.currency}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Expires: {offer.expiresIn}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={offer.status === 'ACTIVE' ? 'default' : 'secondary'}>
                        {offer.status}
                      </Badge>
                      {offer.status === 'ACTIVE' && (
                        <Button variant="outline" size="sm">
                          Cancel Offer
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
