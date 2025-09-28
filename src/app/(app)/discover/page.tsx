'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, TrendingUp, Clock, DollarSign, Loader2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { useDomains } from '@/hooks/useDomains';
import { formatUnits } from 'viem';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'trending' | 'recent' | 'price'>('trending');
  const [showListedOnly, setShowListedOnly] = useState(true);
  const [selectedTLD, setSelectedTLD] = useState<string>('All');
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const tldOptions = ['All', 'com', 'ai', 'io'];

  // Fetch real domains from DOMA API
  const {
    data: domainsData,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useDomains({
    search: searchQuery,
    isListed: showListedOnly,
    tlds: selectedTLD !== 'All' ? [selectedTLD] : undefined,
    limit: 24,
  });

  type NamesPage = {
    items: any[];
    currentPage?: number;
    pageSize?: number;
    hasNextPage?: boolean;
    totalCount?: number;
  };
  const allDomains = (domainsData?.pages as NamesPage[] | undefined)?.flatMap((page) => page.items) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Discover Domains</h1>
          <p className="text-muted-foreground">
            Browse premium domains available for purchase
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* TLD Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="min-w-[140px] justify-between">
                  <span>.{selectedTLD}</span>
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[140px]">
                {tldOptions.map((tld) => (
                  <DropdownMenuCheckboxItem
                    key={tld}
                    checked={selectedTLD === tld}
                    onCheckedChange={() => setSelectedTLD(tld)}
                  >
                    {tld === 'All' ? 'All' : `.${tld}`}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Price Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Price: {sortBy === 'price' ? 'Low to High' : 'All'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={sortBy !== 'price'}
                  onCheckedChange={() => setSortBy('trending')}
                >
                  All Prices
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortBy === 'price'}
                  onCheckedChange={() => setSortBy('price')}
                >
                  Low to High
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="outline"
              onClick={() => setShowMoreFilters(!showMoreFilters)}
            >
              More Filters
            </Button>
          </div>

          {/* Sort Options */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'trending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('trending')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Trending
              </Button>
              <Button
                variant={sortBy === 'recent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('recent')}
              >
                <Clock className="h-4 w-4 mr-2" />
                Recent
              </Button>
              <Button
                variant={sortBy === 'price' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('price')}
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Price
              </Button>
            </div>

            {/* Listed Only Toggle */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="listed-only"
                checked={showListedOnly}
                onChange={(e) => setShowListedOnly(e.target.checked)}
                className="rounded cursor-pointer"
              />
              <label htmlFor="listed-only" className="text-sm text-muted-foreground cursor-pointer">
                Show listed domains only
              </label>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-8 w-32 mb-4" />
                <Skeleton className="h-4 w-16 mb-4" />
                <Skeleton className="h-12 w-24 mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Domain Grid with Infinite Scroll */}
        {!isLoading && allDomains.length > 0 && (
          <div id="scrollableDiv" className="overflow-auto p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allDomains.map((nameData: any) => {
                const hasListings = nameData.tokens?.[0]?.listings?.length > 0;
                const listing = nameData.tokens?.[0]?.listings?.[0];
                const token = nameData.tokens?.[0];
                
                const price = listing 
                  ? formatUnits(BigInt(listing.price), listing.currency.decimals)
                  : '0';
                const currency = listing?.currency?.symbol || 'ETH';
                const tld = nameData.name.split('.').pop() || 'doma';
                const domainLength = nameData.name.split('.')[0].length;

                return (
                  <Link key={nameData.name} href={`/domain/${nameData.name}`}>
                    <Card className="hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer h-full border-2 hover:border-primary/50">
                      <CardContent className="p-6">
                        {/* Domain Name with Icon */}
                        <div className="mb-4 flex items-start justify-between">
                          <div>
                            <h3 className="text-2xl font-bold mb-2 break-all">{nameData.name}</h3>
                            <div className="flex gap-2">
                              <Badge variant="secondary" className="font-semibold">
                                .{tld}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {domainLength} chars
                              </Badge>
                            </div>
                          </div>
                          {hasListings && (
                            <Badge className="bg-green-500 hover:bg-green-600">Listed</Badge>
                          )}
                        </div>

                        {/* Price */}
                        <div className="mb-4 bg-muted/50 p-4 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">Price</p>
                          {hasListings ? (
                            <div className="flex items-baseline gap-2">
                              <p className="text-3xl font-bold">
                                {parseFloat(price).toFixed(3)}
                              </p>
                              <span className="text-lg text-muted-foreground font-medium">{currency}</span>
                            </div>
                          ) : (
                            <p className="text-2xl font-bold text-muted-foreground">
                              Not Listed
                            </p>
                          )}
                          {hasListings && listing?.currency?.usdExchangeRate && (
                            <p className="text-sm text-muted-foreground mt-1">
                              ≈ ${(parseFloat(price) * listing.currency.usdExchangeRate).toLocaleString('en-US', { maximumFractionDigits: 2 })} USD
                            </p>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Network:</span>
                            <span className="font-medium">{token?.chain?.name || 'Unknown'}</span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-4 pt-4 border-t">
                          <Button className="w-full" variant={hasListings ? 'default' : 'outline'}>
                            {hasListings ? 'Buy or Make Offer' : 'Make Offer'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="text-center mt-8">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && allDomains.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No domains found</p>
            <Button onClick={() => setSearchQuery('')}>Clear Search</Button>
          </div>
        )}
      </div>
    </div>
  );
}
