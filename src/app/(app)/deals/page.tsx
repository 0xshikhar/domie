'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp, Clock, Plus } from 'lucide-react';
import { Deal, DealStatus } from '@/lib/doma/types';
import CreateDealModal from '@/components/deals/CreateDealModal';

// Mock data
const mockDeals: Deal[] = [
  {
    id: '1',
    domainId: '3',
    creatorId: 'user1',
    title: 'Group Buy: crypto.doma',
    description: 'Let\'s pool together to buy this premium domain!',
    targetPrice: '5.0',
    minContribution: '0.5',
    maxParticipants: 10,
    status: DealStatus.ACTIVE,
    currentAmount: '3.5',
    participantCount: 7,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    domainId: '4',
    creatorId: 'user2',
    title: 'Community Deal: web3.doma',
    description: 'Premium web3 domain - fractional ownership',
    targetPrice: '4.2',
    minContribution: '0.3',
    maxParticipants: 14,
    status: DealStatus.ACTIVE,
    currentAmount: '2.1',
    participantCount: 7,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>(mockDeals);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'funded'>('all');

  const filteredDeals = deals.filter(deal => {
    if (filter === 'all') return true;
    if (filter === 'active') return deal.status === DealStatus.ACTIVE;
    if (filter === 'funded') return deal.status === DealStatus.FUNDED;
    return true;
  });

  const getProgressPercentage = (deal: Deal) => {
    return (parseFloat(deal.currentAmount) / parseFloat(deal.targetPrice)) * 100;
  };

  const getDaysRemaining = (endDate: string) => {
    const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

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
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Deal
          </Button>
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
                {deals.reduce((sum, d) => sum + parseFloat(d.currentAmount), 0).toFixed(2)} ETH
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
                    {deal.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">
                      {deal.currentAmount} / {deal.targetPrice} ETH
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
                      {getDaysRemaining(deal.endDate)}d
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" disabled={deal.status !== DealStatus.ACTIVE}>
                    Join Deal
                  </Button>
                  <Button variant="outline">View Details</Button>
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
