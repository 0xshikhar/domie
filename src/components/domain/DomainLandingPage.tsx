'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Eye, Heart, MessageCircle, Share2, TrendingUp, Copy, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';
import { Domain } from '@/lib/doma/types';
import BuyNowModal from '@/components/trading/BuyNowModal';
import MakeOfferModal from '@/components/trading/MakeOfferModal';
import SendTradeCardButton from '@/components/trading/SendTradeCardButton';
import { toast } from 'sonner';
import { usePrivy } from '@privy-io/react-auth';

interface DomainLandingPageProps {
  domain: Domain & {
    views?: number;
    watchCount?: number;
    offerCount?: number;
  };
}

export default function DomainLandingPage({ domain }: DomainLandingPageProps) {
  const router = useRouter();
  const { authenticated, login, user } = usePrivy();
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isCheckingWatchlist, setIsCheckingWatchlist] = useState(false);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `${domain.name} - Premium Domain`,
        text: `Check out ${domain.name} on Domie`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Check if domain is in watchlist on mount
  useEffect(() => {
    const checkWatchlist = async () => {
      if (!authenticated || !user?.wallet?.address) return;

      setIsCheckingWatchlist(true);
      try {
        const response = await fetch(
          `/api/watchlist?address=${user.wallet.address}&domainId=${domain.id}`
        );
        const data = await response.json();
        setIsWatching(data.isWatching || false);
      } catch (error) {
        console.error('Error checking watchlist:', error);
      } finally {
        setIsCheckingWatchlist(false);
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
        // Remove from watchlist
        const response = await fetch(
          `/api/watchlist?address=${user.wallet.address}&domainId=${domain.id}`,
          { method: 'DELETE' }
        );

        if (!response.ok) {
          throw new Error('Failed to remove from watchlist');
        }

        setIsWatching(false);
        toast.success('Removed from watchlist');
      } else {
        // Add to watchlist
        const response = await fetch('/api/watchlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress: user.wallet.address,
            domainId: domain.id,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to add to watchlist');
        }

        setIsWatching(true);
        toast.success('Added to watchlist');
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update watchlist');
    }
  };

  const handleContactOwner = () => {
    if (!authenticated) {
      login();
      toast.info('Please connect your wallet to message the owner');
      return;
    }
    // Navigate to messages page with the owner's address as a query param
    router.push(`/messages?peer=${domain.owner}`);
    toast.success('Opening chat with domain owner...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Domain Name Hero */}
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-4">
              Premium Domain
            </Badge>
            <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              {domain.name}
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              {domain.description || `Secure this premium ${domain.tld} domain today`}
            </p>
            
            {/* Stats */}
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
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

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Domain Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Price Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Price</CardTitle>
                  <CardDescription>Listed by verified owner</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-5xl font-bold">{domain.price || '—'}</span>
                    <span className="text-2xl text-muted-foreground">{domain.currency}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <Button 
                        size="lg" 
                        className="flex-1"
                        onClick={() => setShowBuyModal(true)}
                        disabled={!domain.isListed}
                      >
                        Buy Now
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setShowOfferModal(true)}
                      >
                        Make Offer
                      </Button>
                      <Button 
                        size="lg" 
                        variant="outline"
                        onClick={handleWatch}
                      >
                        <Heart className={`h-5 w-5 ${isWatching ? 'fill-current text-red-500' : ''}`} />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        size="lg" 
                        variant="secondary"
                        onClick={handleContactOwner}
                      >
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Message
                      </Button>
                      <SendTradeCardButton
                        domainName={domain.name}
                        tokenId={domain.tokenId}
                        price={domain.price || '0'}
                        currency={domain.currency}
                        ownerAddress={domain.owner}
                        action="buy"
                        size="lg"
                        variant="default"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Domain Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Domain Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Token ID - Full Display */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">Token ID</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(domain.tokenId, 'Token ID')}
                        className="h-8"
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

                  {/* Owner - Full Display */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-muted-foreground">Owner</p>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(domain.owner, 'Owner Address')}
                          className="h-8"
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
                          className="h-8"
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

                  {/* Additional Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">TLD</p>
                      <p className="font-semibold text-lg">.{domain.tld}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <Badge variant={domain.isListed ? 'default' : 'secondary'} className="text-sm">
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

              {/* Domain Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Domain Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Domain Name</p>
                      <p className="font-semibold">{domain.name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Transfer Lock</p>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm">Disabled</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Fractionalized</p>
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm">No</span>
                      </div>
                    </div>
                  </div>
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
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <span>Short, memorable, and brandable</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <span>Perfect for Web3 identity and branding</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <span>Verified ownership on blockchain</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5" />
                      <span>Instant transfer upon purchase</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Actions & Info */}
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
                    <p className="text-sm text-muted-foreground mb-1">IANA ID</p>
                    <p className="font-mono text-sm">3784</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Website</p>
                    <Button variant="link" className="h-auto p-0" asChild>
                      <a href="#" target="_blank" rel="noopener noreferrer">
                        Visit
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Owner Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Owner</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold">
                        {domain.owner.slice(2, 4).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm truncate">{domain.owner}</p>
                      <p className="text-xs text-muted-foreground">Domain Owner</p>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>

              {/* Tokens */}
              <Card>
                <CardHeader>
                  <CardTitle>Tokens</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Network</p>
                      <p className="font-semibold text-sm">Doma Testnet</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Token ID</p>
                      <p className="font-mono text-xs truncate">{domain.tokenId.slice(0, 12)}...</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Owner</p>
                      <p className="font-mono text-xs truncate">{domain.owner.slice(0, 10)}...</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Created</p>
                      <p className="text-sm">an hour ago</p>
                    </div>
                  </div>
                  {domain.isListed && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-semibold mb-2">Active Listings</p>
                        <div className="bg-muted p-3 rounded-md">
                          <p className="text-xs text-muted-foreground mb-1">Orderbook: DOMA</p>
                          <p className="font-semibold">{domain.price} {domain.currency}</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Share */}
              <Card>
                <CardHeader>
                  <CardTitle>Share</CardTitle>
                  <CardDescription>Spread the word</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Domain
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
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
