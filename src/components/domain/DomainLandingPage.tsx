'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Eye, Heart, MessageCircle, Share2, TrendingUp } from 'lucide-react';
import { Domain } from '@/lib/doma/types';
import BuyNowModal from '@/components/trading/BuyNowModal';
import MakeOfferModal from '@/components/trading/MakeOfferModal';

interface DomainLandingPageProps {
  domain: Domain & {
    views?: number;
    watchCount?: number;
    offerCount?: number;
  };
}

export default function DomainLandingPage({ domain }: DomainLandingPageProps) {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [isWatching, setIsWatching] = useState(false);

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

  const handleWatch = () => {
    setIsWatching(!isWatching);
    // TODO: Add to watchlist in database
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
                </CardContent>
              </Card>

              {/* Domain Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Domain Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Token ID</p>
                      <p className="font-mono">{domain.tokenId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Owner</p>
                      <p className="font-mono">{domain.owner.slice(0, 10)}...</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">TLD</p>
                      <p className="font-semibold">.{domain.tld}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
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
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Short, memorable, and brandable</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Perfect for Web3 identity and branding</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Verified ownership on blockchain</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>Instant transfer upon purchase</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Actions & Info */}
            <div className="space-y-6">
              {/* Contact Owner */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Owner</CardTitle>
                  <CardDescription>Start a conversation via XMTP</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
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

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Listed</span>
                      <span>2 days ago</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last offer</span>
                      <span>5 hours ago</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Views today</span>
                      <span>127</span>
                    </div>
                  </div>
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
