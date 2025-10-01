'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useCommunityDeal } from '@/hooks/useCommunityDeal';
import { ContractDeal } from '@/hooks/useContractDeals';
import { formatEther, parseEther } from 'viem';
import { usePrivy } from '@privy-io/react-auth';

interface ContributeDealModalProps {
  open: boolean;
  onClose: () => void;
  deal: ContractDeal;
  onSuccess?: () => void;
}

export default function ContributeDealModal({ open, onClose, deal, onSuccess }: ContributeDealModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const { contribute } = useCommunityDeal();
  const { authenticated, login } = usePrivy();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authenticated) {
      login();
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const contributionAmount = parseFloat(amount);
      
      // Validation
      if (contributionAmount < parseFloat(deal.minContribution)) {
        throw new Error(`Minimum contribution is ${deal.minContribution} ETH`);
      }

      const remaining = parseFloat(formatEther(deal.targetPrice)) - parseFloat(formatEther(deal.currentAmount));
      if (contributionAmount > remaining) {
        throw new Error(`Maximum contribution is ${remaining.toFixed(4)} ETH (remaining amount)`);
      }

      // Contribute to deal
      const result = await contribute(deal.dealId, amount);
      
      if (result) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
          setSuccess(false);
          setAmount('');
        }, 2000);
      }
    } catch (err: any) {
      console.error('Contribution error:', err);
      setError(err.message || 'Failed to contribute. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setAmount('');
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  const remainingAmount = parseFloat(formatEther(deal.targetPrice)) - parseFloat(formatEther(deal.currentAmount));
  const suggestedAmounts = [
    parseFloat(deal.minContribution),
    parseFloat(deal.minContribution) * 2,
    Math.min(parseFloat(deal.minContribution) * 5, remainingAmount),
  ].filter(amt => amt <= remainingAmount);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Contribute to {deal.domainName}</DialogTitle>
          <DialogDescription>
            Join the community to collectively purchase this domain
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Contribution Successful!</h3>
            <p className="text-muted-foreground">
              You've contributed {amount} ETH to this deal
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Deal Info */}
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Target Price</span>
                <span className="font-semibold">{formatEther(deal.targetPrice)} ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Amount</span>
                <span className="font-semibold">{formatEther(deal.currentAmount)} ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-semibold text-blue-600">{remainingAmount.toFixed(4)} ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Min. Contribution</span>
                <span className="font-semibold">{deal.minContribution} ETH</span>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <Label htmlFor="amount">Contribution Amount (ETH)</Label>
              <Input
                id="amount"
                type="number"
                step="0.001"
                min={deal.minContribution}
                max={remainingAmount}
                placeholder={deal.minContribution}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Min: {deal.minContribution} ETH • Max: {remainingAmount.toFixed(4)} ETH
              </p>
            </div>

            {/* Quick Amount Buttons */}
            <div>
              <Label className="text-xs text-muted-foreground">Quick Select</Label>
              <div className="flex gap-2 mt-2">
                {suggestedAmounts.map((amt) => (
                  <Button
                    key={amt}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(amt.toString())}
                    disabled={loading}
                  >
                    {amt} ETH
                  </Button>
                ))}
              </div>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-medium text-blue-900 dark:text-blue-100">How it works:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Your funds are pooled with other participants</li>
                  <li>When target is reached, domain will be purchased</li>
                  <li>You'll receive fractional ownership tokens</li>
                  <li>Can refund if deal expires without reaching target</li>
                </ul>
              </div>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Your Share Preview */}
            {amount && parseFloat(amount) > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Your Estimated Share
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {((parseFloat(amount) / parseFloat(formatEther(deal.targetPrice))) * 100).toFixed(2)}%
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose} 
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={loading || !amount || parseFloat(amount) <= 0}
              >
                {loading ? (
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
        )}
      </DialogContent>
    </Dialog>
  );
}
