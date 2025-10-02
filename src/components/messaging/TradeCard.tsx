'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ExternalLink, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Fuel,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { TradeCard as TradeCardType } from '@/lib/xmtp/client';
import { useTrade } from '@/hooks/useTrade';
import { formatTransactionStatus } from '@/lib/xmtp/trading';
import { Separator } from '@/components/ui/separator';

interface TradeCardProps {
  data: Omit<TradeCardType, 'type'>;
  onTransactionComplete?: (hash?: string) => void;
}

export default function TradeCard({ data, onTransactionComplete }: TradeCardProps) {
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerDuration, setOfferDuration] = useState('7');

  const {
    status,
    gasEstimate,
    isEstimating,
    isProcessing,
    isSuccess,
    isError,
    executeBuy,
    makeOffer,
    estimateGas,
    reset,
  } = useTrade({
    tradeData: data,
    onSuccess: (hash) => {
      onTransactionComplete?.(hash);
      // Reset form after success
      setTimeout(() => {
        setShowOfferForm(false);
        setOfferAmount('');
        reset();
      }, 3000);
    },
  });

  const handleBuyNow = async () => {
    if (data.action === 'buy') {
      await executeBuy();
    }
  };

  const handleMakeOffer = async () => {
    if (!offerAmount) return;
    await makeOffer(offerAmount, parseInt(offerDuration));
  };

  const handleEstimateGas = async () => {
    await estimateGas();
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

  const suggestedOffer = data.price ? (parseFloat(data.price) * 0.9).toFixed(4) : '0';

  return (
    <Card className="w-full max-w-sm border-2 border-primary/20 shadow-lg">
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

        {/* Gas Estimate */}
        {gasEstimate && data.action === 'buy' && (
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-400">
              <Fuel className="h-4 w-4" />
              <span className="font-medium">Gas Estimate</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total Cost</span>
              <span className="font-semibold">{gasEstimate.totalCost} ETH</span>
            </div>
          </div>
        )}

        {/* Transaction Status */}
        {status.status !== 'idle' && (
          <Alert 
            variant={isError ? 'destructive' : isSuccess ? 'default' : 'default'}
            className={isSuccess ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : ''}
          >
            {isSuccess ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : isError ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            <AlertDescription className={isSuccess ? 'text-green-800 dark:text-green-400' : ''}>
              {formatTransactionStatus(status)}
              {status.explorerUrl && (
                <a 
                  href={status.explorerUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 underline inline-flex items-center gap-1"
                >
                  View TX <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Offer Form */}
        {showOfferForm && !isSuccess && (
          <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="offer-amount" className="text-sm">Your Offer</Label>
              <div className="flex gap-2">
                <Input
                  id="offer-amount"
                  type="number"
                  step="0.0001"
                  placeholder="0.00"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  disabled={isProcessing}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setOfferAmount(suggestedOffer)}
                  disabled={isProcessing}
                  title="10% below asking price"
                >
                  <TrendingUp className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Suggested: {suggestedOffer} {data.currency}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-sm flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Duration
              </Label>
              <select
                id="duration"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={offerDuration}
                onChange={(e) => setOfferDuration(e.target.value)}
                disabled={isProcessing}
              >
                <option value="1">1 day</option>
                <option value="3">3 days</option>
                <option value="7">7 days</option>
                <option value="14">14 days</option>
                <option value="30">30 days</option>
              </select>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setShowOfferForm(false);
                  setOfferAmount('');
                }}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={handleMakeOffer}
                disabled={isProcessing || !offerAmount}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Offer'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        {!showOfferForm && !isSuccess && (
          <div className="space-y-2">
            {data.action === 'buy' && (
              <>
                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    onClick={handleBuyNow}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Buy Now'
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleEstimateGas}
                    disabled={isEstimating || isProcessing}
                    title="Estimate Gas"
                  >
                    {isEstimating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Fuel className="h-4 w-4" />
                    )}
                  </Button>
                  <Button variant="outline" size="icon" asChild>
                    <a href={`/domain/${data.domainName}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <Button 
                  variant="secondary" 
                  className="w-full" 
                  size="sm"
                  onClick={() => setShowOfferForm(true)}
                  disabled={isProcessing}
                >
                  Make an Offer Instead
                </Button>
              </>
            )}

            {(data.action === 'offer' || data.action === 'counter') && (
              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={() => setShowOfferForm(true)}
                  disabled={isProcessing}
                >
                  {getActionLabel()}
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a href={`/domain/${data.domainName}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Token ID */}
        <p className="text-xs text-muted-foreground text-center">
          Token ID: {data.tokenId}
        </p>
      </CardContent>
    </Card>
  );
}
