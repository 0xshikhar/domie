'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Domain } from '@/lib/doma/types';
import { usePrivy } from '@privy-io/react-auth';

interface MakeOfferModalProps {
  open: boolean;
  onClose: () => void;
  domain: Domain;
}

export default function MakeOfferModal({ open, onClose, domain }: MakeOfferModalProps) {
  const { authenticated, login } = usePrivy();
  const [offerAmount, setOfferAmount] = useState('');
  const [duration, setDuration] = useState('7');
  const [isProcessing, setIsProcessing] = useState(false);
  const [offerId, setOfferId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmitOffer = async () => {
    if (!authenticated) {
      login();
      return;
    }

    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      setError('Please enter a valid offer amount');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // TODO: Implement actual offer logic with DOMA orderbook
      // const offer = await orderbook.createOffer({
      //   tokenId: domain.tokenId,
      //   amount: parseEther(offerAmount),
      //   duration: parseInt(duration) * 24 * 60 * 60,
      // });
      
      // Simulate offer creation
      await new Promise(resolve => setTimeout(resolve, 1500));
      setOfferId('offer_' + Math.random().toString(36).substr(2, 9));
      
      // Track analytics
      // await trackEvent('OFFER_MADE', domain.id, { amount: offerAmount });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create offer');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAndClose = () => {
    setOfferAmount('');
    setDuration('7');
    setOfferId(null);
    setError(null);
    setIsProcessing(false);
    onClose();
  };

  const suggestedOffer = domain.price ? (parseFloat(domain.price) * 0.9).toFixed(2) : '0';

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Make an Offer</DialogTitle>
          <DialogDescription>
            Submit your offer for {domain.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Price */}
          {domain.price && (
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Current Price</span>
                <span className="font-semibold">{domain.price} {domain.currency}</span>
              </div>
            </div>
          )}

          {/* Offer Amount */}
          <div className="space-y-2">
            <Label htmlFor="offer-amount">Your Offer</Label>
            <div className="flex gap-2">
              <Input
                id="offer-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                disabled={isProcessing || !!offerId}
              />
              <Button
                variant="outline"
                onClick={() => setOfferAmount(suggestedOffer)}
                disabled={isProcessing || !!offerId}
              >
                Suggest
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Suggested: {suggestedOffer} ETH (10% below asking)
            </p>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Offer Duration</Label>
            <select
              id="duration"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={isProcessing || !!offerId}
            >
              <option value="1">1 day</option>
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </select>
          </div>

          <Separator />

          {/* Offer Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Offer Amount</span>
              <span>{offerAmount || '0.00'} ETH</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Valid Until</span>
              <span>{duration} days</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Network Fee</span>
              <span>~0.003 ETH</span>
            </div>
          </div>

          {/* Success State */}
          {offerId && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Offer submitted successfully! The owner will be notified.
              </AlertDescription>
            </Alert>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={resetAndClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmitOffer}
              disabled={isProcessing || !!offerId || !offerAmount}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : offerId ? (
                'Submitted'
              ) : (
                'Submit Offer'
              )}
            </Button>
          </div>

          {!authenticated && (
            <p className="text-xs text-center text-muted-foreground">
              You&apos;ll need to connect your wallet to make an offer
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
