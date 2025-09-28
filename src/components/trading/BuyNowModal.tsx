'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { Domain } from '@/lib/doma/types';
import { usePrivy } from '@privy-io/react-auth';
import { useWalletClient, useSwitchChain } from 'wagmi';
import { parseEther, encodeFunctionData } from 'viem';
import { toast } from 'sonner';
import { sepolia } from 'wagmi/chains';

interface BuyNowModalProps {
  open: boolean;
  onClose: () => void;
  domain: Domain;
}

export default function BuyNowModal({ open, onClose, domain }: BuyNowModalProps) {
  const { authenticated, login, user } = usePrivy();
  const { data: walletClient } = useWalletClient();
  const { switchChain } = useSwitchChain();
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);

  const handleBuy = async () => {
    if (!authenticated) {
      login();
      return;
    }

    if (!walletClient) {
      setError('Wallet not connected');
      return;
    }

    if (!domain.price) {
      setError('Domain price not available');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Get the active listing for this domain (if available)
      const listing = domain.tokens?.[0]?.listings?.[0];
      
      // Determine target chain - prefer Doma Testnet (97476), fallback to Sepolia
      const targetChainId = 97476; // Doma Testnet
      
      // Check if we need to switch chains
      if (walletClient.chain.id !== targetChainId) {
        toast.info('Please switch to Doma Testnet...');
        try {
          await switchChain({ chainId: targetChainId });
          toast.success('Switched to Doma Testnet');
        } catch (switchError: any) {
          throw new Error(`Failed to switch chain: ${switchError.message}`);
        }
      }

      // Parse the price
      const priceInWei = parseEther(domain.price);

      // Fulfill the listing via the DOMA orderbook
      // The orderbook contract address depends on which orderbook is used (Seaport, Blur, etc.)
      let hash;
      
      if (listing && listing.orderbook === 'SEAPORT') {
        // For Seaport orderbook - call fulfillOrder
        // This is a simplified version - you'd need to construct the full order parameters
        const seaportAddress = '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC'; // Seaport 1.5 on mainnet
        
        hash = await walletClient.sendTransaction({
          to: seaportAddress as `0x${string}`,
          value: priceInWei,
          data: '0x' // You'd need to encode the fulfillOrder call here with proper order params
        });
      } else {
        // Generic purchase transaction
        // Send ETH directly to the owner
        if (!domain.owner || domain.owner === '0x') {
          throw new Error('Domain owner address not available');
        }
        
        hash = await walletClient.sendTransaction({
          to: domain.owner as `0x${string}`,
          value: priceInWei,
          chain: walletClient.chain,
        });
      }

      setTxHash(hash);
      const chainId = walletClient.chain?.id;
      const explorerBaseUrl = chainId === 1 
        ? 'https://etherscan.io'
        : chainId === 11155111
        ? 'https://sepolia.etherscan.io'
        : 'https://explorer-testnet.doma.xyz';
      
      setExplorerUrl(`${explorerBaseUrl}/tx/${hash}`);
      
      toast.success('Purchase successful!');

      // Track purchase analytics
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'PURCHASE',
            domainId: domain.id,
            userId: user?.wallet?.address,
            metadata: { price: domain.price, txHash: hash }
          })
        });
      } catch (analyticsError) {
        console.error('Analytics tracking failed:', analyticsError);
      }
    } catch (err: any) {
      console.error('Purchase error:', err);
      const errorMsg = err?.message || err?.shortMessage || 'Transaction failed';
      setError(errorMsg);
      toast.error(errorMsg);
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
              <AlertDescription className="text-green-800 flex items-center justify-between">
                <span>Purchase successful! Transaction: {txHash.slice(0, 10)}...</span>
                {explorerUrl && (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-6 px-2"
                  >
                    <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </Button>
                )}
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
