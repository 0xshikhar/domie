'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import { TradeCard as TradeCardType } from '@/lib/xmtp/client';

interface TradeCardProps {
  data: Omit<TradeCardType, 'type'>;
}

export default function TradeCard({ data }: TradeCardProps) {
  const handleAction = () => {
    // TODO: Implement action based on data.action
    console.log('Trade card action:', data.action);
  };

  const getActionLabel = () => {
    switch (data.action) {
      case 'buy':
        return 'Buy Now';
      case 'offer':
        return 'Make Offer';
      case 'counter':
        return 'Counter Offer';
      default:
        return 'View';
    }
  };

  return (
    <Card className="w-full max-w-sm border-2 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{data.domainName}</CardTitle>
          <Badge variant="secondary">Trade</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Price */}
        <div className="bg-muted/50 rounded-lg p-3">
          <p className="text-sm text-muted-foreground mb-1">
            {data.action === 'offer' || data.action === 'counter' ? 'Offer Amount' : 'Price'}
          </p>
          <p className="text-2xl font-bold">
            {data.amount || data.price} <span className="text-lg text-muted-foreground">{data.currency}</span>
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button className="flex-1" onClick={handleAction}>
            {getActionLabel()}
          </Button>
          <Button variant="outline" size="icon" asChild>
            <a href={`/domain/${data.domainName}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Token ID */}
        <p className="text-xs text-muted-foreground text-center">
          Token ID: {data.tokenId}
        </p>
      </CardContent>
    </Card>
  );
}
