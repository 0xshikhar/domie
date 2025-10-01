'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, Clock, Plus, RefreshCw, Loader2 } from 'lucide-react';
import { DealStatus } from '@/lib/contracts/communityDeal';
import CreateDealModal from '@/components/deals/CreateDealModal';
import { useContractDeals, ContractDeal } from '@/hooks/useContractDeals';
import { formatEther } from 'viem';

export default function DealsPage() {
  const router = useRouter();
  const { deals, loading, error, refreshDeals, isContractAvailable, contractAddress } = useContractDeals();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'funded'>('all');
  const [syncing, setSyncing] = useState(false);

  const filteredDeals = deals.filter(deal => {
    if (filter === 'all') return true;
    if (filter === 'active') return deal.status === DealStatus.ACTIVE;
    if (filter === 'funded') return deal.status === DealStatus.FUNDED;
    return true;
  });

  const getProgressPercentage = (deal: ContractDeal) => {
    return deal.progressPercentage;
  };

  const getDaysRemaining = (deal: ContractDeal) => {
    return deal.daysRemaining;
  };

  // Sync deals with database
  const syncDeals = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/deals/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chainId: 97476 })
      });
      const result = await response.json();
      if (result.success) {
        refreshDeals();
        console.log(`Synced ${result.synced} deals`);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setSyncing(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading community deals...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={refreshDeals}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Community Deals</h1>
            <p className="text-muted-foreground">
              Pool funds with others to buy premium domains
            </p>
            {contractAddress && (
              <p className="text-xs text-muted-foreground mt-2">
                Contract: {contractAddress}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={syncDeals}
              disabled={syncing}
            >
              {syncing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Deal
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deals.filter(d => d.status === DealStatus.ACTIVE).length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {deals.reduce((sum, d) => sum + d.participantCount, 0)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Funds Raised</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {deals.reduce((sum, d) => sum + parseFloat(formatEther(d.currentAmount)), 0).toFixed(4)} ETH
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Deals
          </Button>
          <Button
            variant={filter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('active')}
          >
            Active
          </Button>
          <Button
            variant={filter === 'funded' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('funded')}
          >
            Funded
          </Button>
        </div>

        {/* Deals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDeals.map((deal) => (
            <Card key={deal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl mb-2">{deal.title}</CardTitle>
                    <CardDescription>{deal.description}</CardDescription>
                  </div>
                  <Badge variant={deal.status === DealStatus.ACTIVE ? 'default' : 'secondary'}>
                    {DealStatus[deal.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">
                      {formatEther(deal.currentAmount)} / {formatEther(deal.targetPrice)} ETH
                    </span>
                  </div>
                  <Progress value={getProgressPercentage(deal)} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {getProgressPercentage(deal).toFixed(0)}% funded
                  </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Participants</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {deal.participantCount}/{deal.maxParticipants}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Min. Contribution</p>
                    <p className="font-semibold">{deal.minContribution} ETH</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Time Left</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getDaysRemaining(deal)}d
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    className="flex-1" 
                    disabled={deal.status !== DealStatus.ACTIVE}
                    onClick={() => router.push(`/deals/${deal.id}`)}
                  >
                    Join Deal
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => router.push(`/deals/${deal.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredDeals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No deals found</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Deal
            </Button>
          </div>
        )}
      </div>

      {/* Create Deal Modal */}
      <CreateDealModal 
        open={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
