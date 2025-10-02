'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, Clock, TrendingUp, ArrowLeft, MessageCircle, 
  Share2, AlertCircle, CheckCircle, Loader2, ExternalLink 
} from 'lucide-react';
import { useContractDeals, ContractDeal } from '@/hooks/useContractDeals';
import { useCommunityDeal } from '@/hooks/useCommunityDeal';
import { DealStatus } from '@/lib/contracts/communityDeal';
import ContributeDealModal from '@/components/deals/ContributeDealModal';
import { DealRoom } from '@/components/deals/DealRoom';
import { formatEther } from 'viem';
import { usePrivy } from '@privy-io/react-auth';

export default function DealDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;
  
  const { deals, loading: dealsLoading } = useContractDeals();
  const { getDealInfo, getParticipantInfo, getDealParticipants } = useCommunityDeal();
  const { user, authenticated } = usePrivy();
  
  const [deal, setDeal] = useState<ContractDeal | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [userParticipation, setUserParticipation] = useState<any>(null);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch deal details
  useEffect(() => {
    const fetchDealDetails = async () => {
      try {
        setLoading(true);
        
        // Find deal from contract deals
        const foundDeal = deals.find(d => d.id === dealId);
        if (foundDeal) {
          setDeal(foundDeal);
          
          // Fetch participants
          try {
            const participantAddresses = await getDealParticipants(dealId);
            setParticipants(participantAddresses);
            
            // If user is authenticated, check their participation
            if (authenticated && user?.wallet?.address && foundDeal.targetPrice) {
              const participation = await getParticipantInfo(
                dealId, 
                user.wallet.address as `0x${string}`,
                foundDeal.targetPrice
              );
              setUserParticipation(participation);
            }
          } catch (err) {
            console.error('Error fetching participants:', err);
          }
        }
      } catch (error) {
        console.error('Error fetching deal details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!dealsLoading && dealId) {
      fetchDealDetails();
    }
  }, [dealId, deals, dealsLoading, getDealParticipants, getParticipantInfo, authenticated, user]);

  const handleContributeSuccess = () => {
    // Refresh deal data
    window.location.reload();
  };

  const handleOpenChat = () => {
    // Navigate to chat with deal context
    router.push(`/chat?deal=${dealId}`);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/deals/${dealId}`;
    if (navigator.share) {
      await navigator.share({
        title: deal?.title,
        text: deal?.description,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  if (loading || dealsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading deal details...</p>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Deal Not Found</h2>
          <p className="text-muted-foreground mb-4">This deal doesn&apos;t exist or has been removed.</p>
          <Button onClick={() => router.push('/deals')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Deals
          </Button>
        </div>
      </div>
    );
  }

  const isParticipant = userParticipation && userParticipation.contribution > BigInt(0);
  const canJoin = deal.status === DealStatus.ACTIVE && !isParticipant;
  const isFunded = deal.status === DealStatus.FUNDED;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.push('/deals')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Deals
          </Button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">{deal.domainName}</h1>
              <p className="text-muted-foreground">{deal.description}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
              {isParticipant && (
                <Button onClick={handleOpenChat}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Group Chat
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Deal Status</CardTitle>
                  <Badge variant={deal.status === DealStatus.ACTIVE ? 'default' : 'secondary'}>
                    {DealStatus[deal.status]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Funding Progress</span>
                    <span className="font-semibold">
                      {formatEther(deal.currentAmount)} / {formatEther(deal.targetPrice)} ETH
                    </span>
                  </div>
                  <Progress value={deal.progressPercentage} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {deal.progressPercentage.toFixed(1)}% funded
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Participants</p>
                    <p className="text-2xl font-bold flex items-center gap-1">
                      <Users className="h-5 w-5" />
                      {deal.participantCount}/{deal.maxParticipants}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Min. Contribution</p>
                    <p className="text-2xl font-bold">{deal.minContribution} ETH</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Time Left</p>
                    <p className="text-2xl font-bold flex items-center gap-1">
                      <Clock className="h-5 w-5" />
                      {deal.daysRemaining}d
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Target</p>
                    <p className="text-2xl font-bold">{formatEther(deal.targetPrice)} ETH</p>
                  </div>
                </div>

                {/* User Participation Status */}
                {isParticipant && userParticipation && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <p className="font-semibold text-green-900 dark:text-green-100">
                        You&apos;re participating in this deal!
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Your Contribution</p>
                        <p className="font-semibold">{formatEther(userParticipation.contribution)} ETH</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Your Share</p>
                        <p className="font-semibold">{userParticipation.sharePercentage.toFixed(2)}%</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  {canJoin && (
                    <Button 
                      className="flex-1" 
                      size="lg"
                      onClick={() => setShowContributeModal(true)}
                    >
                      Join Deal
                    </Button>
                  )}
                  {isFunded && (
                    <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                        🎉 Deal Funded! Waiting for domain purchase...
                      </p>
                    </div>
                  )}
                  {deal.purchased && deal.fractionalTokenAddress && (
                    <Button variant="outline" className="flex-1" asChild>
                      <a 
                        href={`https://explorer-testnet.doma.xyz/address/${deal.fractionalTokenAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View Fractional Tokens
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue={isParticipant ? "room" : "details"} className="w-full">
              <TabsList className={`grid w-full ${isParticipant ? 'grid-cols-4' : 'grid-cols-3'}`}>
                {isParticipant && <TabsTrigger value="room">Deal Room</TabsTrigger>}
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="participants">Participants</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              {/* Deal Room Tab - Only for participants */}
              {isParticipant && deal.xmtpGroupId && (
                <TabsContent value="room" className="mt-6">
                  <DealRoom
                    dealId={deal.id}
                    xmtpGroupId={deal.xmtpGroupId}
                    dealName={deal.domainName}
                    targetPrice={formatEther(deal.targetPrice)}
                    currentAmount={formatEther(deal.currentAmount)}
                    participants={participants.map((address, index) => ({
                      id: `${address}-${index}`,
                      walletAddress: address,
                      contribution: '0', // TODO: Fetch actual contribution
                      sharePercentage: 0, // TODO: Calculate actual percentage
                    }))}
                    status={DealStatus[deal.status]}
                    endDate={new Date(deal.endDate)}
                  />
                </TabsContent>
              )}

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Deal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Domain Name</p>
                      <p className="font-semibold text-lg">{deal.domainName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Creator</p>
                      <p className="font-mono text-sm">{deal.creator}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Contract Deal ID</p>
                      <p className="font-mono text-sm">{deal.dealId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Deadline</p>
                      <p className="font-semibold">
                        {new Date(deal.endDate).toLocaleString()}
                      </p>
                    </div>
                    {deal.domainTokenId && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Domain Token ID</p>
                        <p className="font-mono text-sm">{deal.domainTokenId.toString()}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="participants" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Participants ({participants.length})</CardTitle>
                    <CardDescription>
                      People who have contributed to this deal
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {participants.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No participants yet. Be the first to join!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {participants.map((address, index) => (
                          <div 
                            key={address} 
                            className="flex items-center justify-between p-3 bg-muted rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>
                                  {address.slice(2, 4).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-mono text-sm">{address}</p>
                                <p className="text-xs text-muted-foreground">
                                  Participant #{index + 1}
                                </p>
                              </div>
                            </div>
                            {address.toLowerCase() === user?.wallet?.address?.toLowerCase() && (
                              <Badge variant="secondary">You</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-2 h-fit">
                          <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-semibold">Deal Created</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(deal.startDate).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {deal.participantCount > 0 && (
                        <div className="flex gap-3">
                          <div className="bg-green-100 dark:bg-green-900 rounded-full p-2 h-fit">
                            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-semibold">{deal.participantCount} Participants Joined</p>
                            <p className="text-sm text-muted-foreground">
                              {formatEther(deal.currentAmount)} ETH raised
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge>{DealStatus[deal.status]}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{deal.progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Participants</span>
                  <span className="font-semibold">{deal.participantCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days Left</span>
                  <span className="font-semibold">{deal.daysRemaining}d</span>
                </div>
              </CardContent>
            </Card>

            {/* Contract Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contract Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Deal ID</p>
                  <p className="font-mono text-sm">{deal.dealId}</p>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <a 
                    href={`https://explorer-testnet.doma.xyz/tx/${deal.dealId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Explorer
                    <ExternalLink className="h-3 w-3 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contribute Modal */}
      <ContributeDealModal
        open={showContributeModal}
        onClose={() => setShowContributeModal(false)}
        deal={deal}
        onSuccess={handleContributeSuccess}
      />
    </div>
  );
}
