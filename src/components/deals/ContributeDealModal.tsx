'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Info } from 'lucide-react';
import { useCommunityDeal } from '@/hooks/useCommunityDeal';
import { toast } from 'sonner';
import { formatEther, parseEther } from 'viem';
import { CommunityDealInfo } from '@/lib/contracts/communityDeal';

interface ContributeDealModalProps {
  open: boolean;
  onClose: () => void;
  deal: CommunityDealInfo;
  onSuccess?: () => void;
}

export default function ContributeDealModal({ open, onClose, deal, onSuccess }: ContributeDealModalProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { contribute } = useCommunityDeal();

  const minContribution = formatEther(deal.targetPrice / BigInt(deal.participantCount || 10));
  const remaining = formatEther(deal.targetPrice - deal.currentAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const amountBigInt = parseEther(amount);
    
    if (amountBigInt > (deal.targetPrice - deal.currentAmount)) {
      toast.error(`Amount exceeds remaining target (${remaining} ETH)`);
      return;
    }

    setIsLoading(true);
    
    try {
      const { hash } = await contribute(deal.dealId, amount);
      
      toast.success('Contribution successful!', {
        description: `Transaction: ${hash.slice(0, 10)}...`,
      });
      
      onSuccess?.();
      onClose();
      setAmount('');
    } catch (error: any) {
      console.error('Error contributing:', error);
      toast.error('Failed to contribute', {
        description: error.message || 'Please try again',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMaxClick = () => {
    setAmount(remaining);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Contribute to Deal</DialogTitle>
          <DialogDescription>
            Join the community purchase for <strong>{deal.domainName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Deal Info */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Target Price:</span>
              <span className="font-semibold">{formatEther(deal.targetPrice)} ETH</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Amount:</span>
              <span className="font-semibold">{formatEther(deal.currentAmount)} ETH</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Remaining:</span>
              <span className="font-semibold text-primary">{remaining} ETH</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Participants:</span>
              <span className="font-semibold">{deal.participantCount}</span>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Contribution Amount (ETH)</Label>
            <div className="flex gap-2">
              <Input
                id="amount"
                type="number"
                step="0.001"
                min="0"
                placeholder={`Min: ${minContribution}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLoading}
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleMaxClick}
                disabled={isLoading}
              >
                Max
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Suggested minimum: {minContribution} ETH per participant
            </p>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium">How it works:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Your funds are pooled with other participants</li>
                <li>When target is reached, domain will be purchased</li>
                <li>You'll receive fractional ownership tokens (ERC-20)</li>
                <li>Can refund if deal expires without reaching target</li>
              </ul>
            </div>
          </div>

          {/* Share Calculation */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-primary/10 p-3 rounded-lg">
              <p className="text-sm font-medium mb-1">Your Ownership Share:</p>
              <p className="text-2xl font-bold text-primary">
                {((parseFloat(amount) / parseFloat(formatEther(deal.targetPrice))) * 100).toFixed(2)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Based on your contribution of {amount} ETH
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Contributing...
                </>
              ) : (
                'Contribute'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
