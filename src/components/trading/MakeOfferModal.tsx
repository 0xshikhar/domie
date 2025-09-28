'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { Domain } from '@/lib/doma/types';
import { usePrivy } from '@privy-io/react-auth';
import { useWalletClient } from 'wagmi';
import { parseEther } from 'viem';
import { toast } from 'sonner';

interface MakeOfferModalProps {
  open: boolean;
  onClose: () => void;
  domain: Domain;
}

export default function MakeOfferModal({ open, onClose, domain }: MakeOfferModalProps) {
  const { authenticated, login, user } = usePrivy();
  const { data: walletClient } = useWalletClient();
  const [offerAmount, setOfferAmount] = useState('');
  const [duration, setDuration] = useState('7');
  const [isProcessing, setIsProcessing] = useState(false);
  const [offerId, setOfferId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleSubmitOffer = async () => {
    if (!authenticated) {
      login();
      return;
    }

    if (!walletClient) {
      setError('Wallet not connected');
      return;
    }

    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      setError('Please enter a valid offer amount');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const durationDays = parseInt(duration);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + durationDays);

      // Create offer in the backend
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          externalId: `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          domainId: domain.id,
          offerer: user?.wallet?.address,
          userId: user?.wallet?.address,
          amount: offerAmount,
          currency: 'ETH',
          expiryDate: expiryDate.toISOString(),
          // Additional domain info for upsert
          domainName: domain.name,
          domainOwner: domain.owner,
          domainPrice: domain.price,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create offer');
      }

      const offerData = await response.json();
      setOfferId(offerData.id);
      
      // In a real implementation, you might also need to:
      // 1. Sign the offer with the wallet
      // 2. Submit it to the DOMA orderbook contract
      // 3. Lock funds in escrow (depending on orderbook design)
      
      toast.success(`Offer of ${offerAmount} ETH submitted successfully!`);

      // Track analytics
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'OFFER_MADE',
            domainId: domain.id,
            userId: user?.wallet?.address,
            metadata: { amount: offerAmount, duration: durationDays }
          })
        });
      } catch (analyticsError) {
        console.error('Analytics tracking failed:', analyticsError);
      }
    } catch (err: any) {
      console.error('Offer error:', err);
      const errorMsg = err?.message || 'Failed to create offer';
      setError(errorMsg);
      toast.error(errorMsg);
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
    setTxHash(null);
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
