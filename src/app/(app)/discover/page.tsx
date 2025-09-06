'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, TrendingUp, Clock, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { Domain } from '@/lib/doma/types';

// Mock data - will be replaced with actual API calls
const mockDomains: Domain[] = [
  {
    id: '1',
    name: 'alice.doma',
    tld: 'doma',
    tokenId: '123',
    owner: '0x1234...5678',
    isListed: true,
    price: '2.5',
    currency: 'ETH',
    views: 1234,
    watchCount: 45,
    offerCount: 8,
  },
  {
    id: '2',
    name: 'bob.doma',
    tld: 'doma',
    tokenId: '124',
    owner: '0x2345...6789',
    isListed: true,
    price: '1.8',
    currency: 'ETH',
    views: 892,
    watchCount: 32,
    offerCount: 5,
  },
  {
    id: '3',
    name: 'crypto.doma',
    tld: 'doma',
    tokenId: '125',
    owner: '0x3456...7890',
    isListed: true,
    price: '5.0',
    currency: 'ETH',
    views: 2341,
    watchCount: 78,
    offerCount: 15,
  },
  {
    id: '4',
    name: 'web3.doma',
    tld: 'doma',
    tokenId: '126',
    owner: '0x4567...8901',
    isListed: true,
    price: '4.2',
    currency: 'ETH',
    views: 1876,
    watchCount: 61,
    offerCount: 12,
  },
];

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'trending' | 'recent' | 'price'>('trending');
  const [domains, setDomains] = useState<Domain[]>(mockDomains);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // TODO: Implement actual search with DOMA API
    if (query) {
      const filtered = mockDomains.filter(d => 
        d.name.toLowerCase().includes(query.toLowerCase())
      );
      setDomains(filtered);
    } else {
      setDomains(mockDomains);
    }
  };

  const handleSort = (sort: 'trending' | 'recent' | 'price') => {
    setSortBy(sort);
    // TODO: Implement actual sorting
    const sorted = [...domains].sort((a, b) => {
      if (sort === 'price') {
        return parseFloat(a.price || '0') - parseFloat(b.price || '0');
      }
      if (sort === 'trending') {
        return (b.views || 0) - (a.views || 0);
      }
      return 0;
    });
    setDomains(sorted);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Discover Domains</h1>
          <p className="text-muted-foreground">
            Browse premium .doma domains available for purchase
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search domains..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Sort Options */}
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'trending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('trending')}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending
            </Button>
            <Button
              variant={sortBy === 'recent' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('recent')}
            >
              <Clock className="h-4 w-4 mr-2" />
              Recent
            </Button>
            <Button
              variant={sortBy === 'price' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort('price')}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Price
            </Button>
          </div>
        </div>

        {/* Domain Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {domains.map((domain) => (
            <Link key={domain.id} href={`/domain/${domain.name}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  {/* Domain Name */}
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold mb-2">{domain.name}</h3>
                    <Badge variant="secondary">.{domain.tld}</Badge>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-1">Price</p>
                    <p className="text-3xl font-bold">
                      {domain.price} <span className="text-lg text-muted-foreground">{domain.currency}</span>
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{domain.views || 0} views</span>
                    <span>{domain.offerCount || 0} offers</span>
                  </div>

                  {/* Status */}
                  <div className="mt-4 pt-4 border-t">
                    <Badge variant={domain.isListed ? 'default' : 'secondary'}>
                      {domain.isListed ? 'Available' : 'Not Listed'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {domains.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No domains found</p>
            <Button onClick={() => handleSearch('')}>Clear Search</Button>
          </div>
        )}

        {/* Load More */}
        {domains.length > 0 && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
