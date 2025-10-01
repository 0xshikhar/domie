'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, Heart, MessageCircle, Share2, TrendingUp, Copy, ExternalLink, 
  CheckCircle2, XCircle, Info, Brain, Activity as ActivityIcon, ShoppingCart 
} from 'lucide-react';
import { Domain } from '@/lib/doma/types';
import BuyNowModal from '@/components/trading/BuyNowModal';
import MakeOfferModal from '@/components/trading/MakeOfferModal';
import SendTradeCardButton from '@/components/trading/SendTradeCardButton';
import ShareButtons from '@/components/social/ShareButtons';
import AIEnhancedPriceChart from '@/components/analytics/AIEnhancedPriceChart';
import ActivityFeed from '@/components/activity/ActivityFeed';
import { toast } from 'sonner';
import { usePrivy } from '@privy-io/react-auth';

interface DomainPageTabsProps {
  domain: Domain & {
    views?: number;
    watchCount?: number;
    offerCount?: number;
  };
}

export default function DomainPageTabs({ domain }: DomainPageTabsProps) {
  const router = useRouter();
  const { authenticated, login, user } = usePrivy();
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Check if domain is in watchlist
  useEffect(() => {
    const checkWatchlist = async () => {
      if (!authenticated || !user?.wallet?.address) return;

      try {
        const response = await fetch(
          `/api/watchlist?address=${user.wallet.address}&domainId=${domain.id}`
        );
        const data = await response.json();
        setIsWatching(data.isWatching || false);
      } catch (error) {
        console.error('Error checking watchlist:', error);
      }
    };

    checkWatchlist();
  }, [authenticated, user?.wallet?.address, domain.id]);

  const handleWatch = async () => {
    if (!authenticated) {
      login();
      toast.info('Please connect your wallet to add to watchlist');
      return;
    }

    if (!user?.wallet?.address) return;

    try {
      if (isWatching) {
        const response = await fetch(
          `/api/watchlist?address=${user.wallet.address}&domainId=${domain.id}`,
          { method: 'DELETE' }
        );
        if (!response.ok) throw new Error('Failed to remove from watchlist');
        setIsWatching(false);
        toast.success('Removed from watchlist');
      } else {
        const response = await fetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: user.wallet.address,
            domainId: domain.id,
          }),
        });
        if (!response.ok) throw new Error('Failed to add to watchlist');
        setIsWatching(true);
        toast.success('Added to watchlist');
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
      toast.error('Failed to update watchlist');
    }
  };

  const handleContactOwner = () => {
    if (!authenticated) {
      login();
      toast.info('Please connect your wallet to message the owner');
      return;
    }
    router.push(`/messages?peer=${domain.owner}`);
    toast.success('Opening chat with domain owner...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section - Compact */}
          <div className="mb-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex-1">
                <Badge variant="secondary" className="mb-3">
                  Premium Domain
                </Badge>
                <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  {domain.name}
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                  {domain.description || `Secure this premium ${domain.tld} domain today`}
                </p>
                
                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{domain.views || 0} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    <span>{domain.watchCount || 0} watching</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>{domain.offerCount || 0} offers</span>
                  </div>
                </div>
              </div>

              {/* Price Card - Compact */}
              <Card className="w-80 border-2">
                <CardHeader className="pb-3">
                  <CardDescription>Current Price</CardDescription>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{domain.price || '—'}</span>
                    <span className="text-xl text-muted-foreground">{domain.currency}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex gap-2">
                    <Button 
                      size="lg" 
                      className="flex-1"
                      onClick={() => setShowBuyModal(true)}
                      disabled={!domain.isListed}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Buy Now
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline"
                      onClick={handleWatch}
                    >
                      <Heart className={`h-5 w-5 ${isWatching ? 'fill-current text-red-500' : ''}`} />
                    </Button>
                  </div>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowOfferModal(true)}
                  >
                    Make Offer
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="secondary"
                      onClick={handleContactOwner}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <SendTradeCardButton
                      domainName={domain.name}
                      tokenId={domain.tokenId}
                      price={domain.price || '0'}
                      currency={domain.currency}
                      ownerAddress={domain.owner}
                      action="buy"
                      variant="secondary"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabbed Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12">
              <TabsTrigger value="overview" className="text-base">
                <Info className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="intelligence" className="text-base">
                <Brain className="h-4 w-4 mr-2" />
                AI Intelligence
              </TabsTrigger>
              <TabsTrigger value="activity" className="text-base">
                <ActivityIcon className="h-4 w-4 mr-2" />
                Activity
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Domain Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Domain Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Token ID */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-muted-foreground">Token ID</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(domain.tokenId, 'Token ID')}
                          >
                            {copiedField === 'Token ID' ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="font-mono text-sm bg-muted p-3 rounded-md break-all">
                          {domain.tokenId}
                        </p>
                      </div>

                      <Separator />

                      {/* Owner */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-muted-foreground">Owner</p>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(domain.owner, 'Owner Address')}
                            >
                              {copiedField === 'Owner Address' ? (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a
                                href={`https://explorer-testnet.doma.xyz/address/${domain.owner}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                        <p className="font-mono text-sm bg-muted p-3 rounded-md break-all">
                          {domain.owner}
                        </p>
                      </div>

                      <Separator />

                      {/* Additional Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">TLD</p>
                          <p className="font-semibold text-lg">.{domain.tld}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Status</p>
                          <Badge variant={domain.isListed ? 'default' : 'secondary'}>
                            {domain.isListed ? 'Listed' : 'Not Listed'}
                          </Badge>
                        </div>
                      </div>
                      
                      {domain.keywords && domain.keywords.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <p className="text-sm text-muted-foreground mb-2">Keywords</p>
                            <div className="flex flex-wrap gap-2">
                              {domain.keywords.map((keyword, i) => (
                                <Badge key={i} variant="outline">{keyword}</Badge>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Why This Domain */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Why Choose {domain.name}?</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>Short, memorable, and brandable</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>Perfect for Web3 identity and branding</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>Verified ownership on blockchain</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span>Instant transfer upon purchase</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Registrar Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Registrar</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Name</p>
                        <p className="font-semibold">D3 Registrar</p>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Network</p>
                        <p className="font-semibold">Doma Testnet</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Share */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Share</CardTitle>
                      <CardDescription>Spread the word</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <ShareButtons
                        domainName={domain.name}
                        price={domain.price || undefined}
                        currency={domain.currency}
                        description={domain.description || undefined}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* AI Intelligence Tab */}
            <TabsContent value="intelligence" className="mt-6">
              <AIEnhancedPriceChart
                domain={{
                  name: domain.name,
                  tld: domain.tld,
                  price: domain.price || undefined,
                  keywords: domain.keywords,
                  id: domain.id,
                }}
              />
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-6">
              <ActivityFeed
                domainId={domain.id}
                showFilters={false}
                limit={20}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <BuyNowModal 
        open={showBuyModal} 
        onClose={() => setShowBuyModal(false)}
        domain={domain}
      />
      <MakeOfferModal 
        open={showOfferModal} 
        onClose={() => setShowOfferModal(false)}
        domain={domain}
      />
    </div>
  );
}
