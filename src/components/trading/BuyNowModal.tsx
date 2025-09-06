'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Domain } from '@/lib/doma/types';
import { usePrivy } from '@privy-io/react-auth';

interface BuyNowModalProps {
  open: boolean;
  onClose: () => void;
  domain: Domain;
}

export default function BuyNowModal({ open, onClose, domain }: BuyNowModalProps) {
  const { authenticated, login } = usePrivy();
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async () => {
    if (!authenticated) {
      login();
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // TODO: Implement actual purchase logic with DOMA orderbook
      // const tx = await orderbook.fulfillListing(domain.tokenId);
      
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTxHash('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef');
      
      // Track analytics
      // await trackEvent('BUY_CLICK', domain.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAndClose = () => {
    setTxHash(null);
    setError(null);
    setIsProcessing(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy {domain.name}</DialogTitle>
          <DialogDescription>
            Complete your purchase in one transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Domain Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Domain</span>
              <span className="font-semibold">{domain.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Price</span>
              <span className="text-2xl font-bold">{domain.price} {domain.currency}</span>
            </div>
          </div>

          <Separator />

          {/* Transaction Details */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Network Fee</span>
              <span>~0.005 ETH</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Platform Fee</span>
              <span>0%</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{domain.price} ETH</span>
            </div>
          </div>

          {/* Success State */}
          {txHash && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Purchase successful! Transaction: {txHash.slice(0, 10)}...
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
              onClick={handleBuy}
              disabled={isProcessing || !!txHash}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : txHash ? (
                'Complete'
              ) : (
                'Confirm Purchase'
              )}
            </Button>
          </div>

          {!authenticated && (
            <p className="text-xs text-center text-muted-foreground">
              You&apos;ll need to connect your wallet to complete this purchase
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
