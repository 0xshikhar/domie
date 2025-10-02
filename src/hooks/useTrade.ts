import { useState, useCallback } from 'react';
import { useWalletClient, useSwitchChain } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import { toast } from 'sonner';
import {
  executeBuyTransaction,
  submitOffer,
  estimateBuyGas,
  TransactionStatus,
  GasEstimate,
} from '@/lib/xmtp/trading';
import { TradeCard } from '@/lib/xmtp/client';

interface UseTradeOptions {
  tradeData: Omit<TradeCard, 'type'>;
  onSuccess?: (hash?: string) => void;
  onError?: (error: string) => void;
}

export function useTrade({ tradeData, onSuccess, onError }: UseTradeOptions) {
  const { authenticated, login, user } = usePrivy();
  const { data: walletClient } = useWalletClient();
  const { switchChain } = useSwitchChain();
  
  const [status, setStatus] = useState<TransactionStatus>({ status: 'idle' });
  const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  /**
   * Estimate gas for buy transaction
   */
  const estimateGas = useCallback(async () => {
    if (!walletClient || !tradeData.price) {
      toast.error('Wallet not connected or price not available');
      return;
    }

    setIsEstimating(true);
    try {
      // In a real implementation, you'd get the actual seller address
      const sellerAddress = '0x0000000000000000000000000000000000000000';
      
      const estimate = await estimateBuyGas(
        walletClient,
        sellerAddress,
        tradeData.price
      );
      
      setGasEstimate(estimate);
      toast.success('Gas estimated successfully');
    } catch (error: any) {
      console.error('Gas estimation failed:', error);
      toast.error('Failed to estimate gas');
    } finally {
      setIsEstimating(false);
    }
  }, [walletClient, tradeData.price]);

  /**
   * Execute buy transaction
   */
  const executeBuy = useCallback(async () => {
    if (!authenticated) {
      login();
      return;
    }

    if (!walletClient) {
      const error = 'Wallet not connected';
      setStatus({ status: 'error', error });
      onError?.(error);
      toast.error(error);
      return;
    }

    try {
      // Check if we need to switch chains
      const targetChainId = 97476; // Doma Testnet
      if (walletClient.chain.id !== targetChainId) {
        toast.info('Switching to Doma Testnet...');
        try {
          await switchChain({ chainId: targetChainId });
          toast.success('Switched to Doma Testnet');
        } catch (switchError: any) {
          throw new Error(`Failed to switch chain: ${switchError.message}`);
        }
      }

      const hash = await executeBuyTransaction({
        walletClient,
        tradeData,
        onStatusUpdate: setStatus,
      });

      toast.success('Purchase successful!');
      onSuccess?.(hash);

      // Track analytics
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'PURCHASE_FROM_CHAT',
            domainName: tradeData.domainName,
            userId: user?.wallet?.address,
            metadata: { 
              price: tradeData.price, 
              txHash: hash,
              source: 'xmtp_chat',
            },
          }),
        });
      } catch (analyticsError) {
        console.error('Analytics tracking failed:', analyticsError);
      }
    } catch (error: any) {
      const errorMsg = error?.message || error?.shortMessage || 'Transaction failed';
      setStatus({ status: 'error', error: errorMsg });
      onError?.(errorMsg);
      toast.error(errorMsg);
    }
  }, [authenticated, walletClient, tradeData, login, switchChain, onSuccess, onError, user]);

  /**
   * Submit an offer
   */
  const makeOffer = useCallback(async (offerAmount: string, duration = 7) => {
    if (!authenticated) {
      login();
      return;
    }

    if (!walletClient) {
      const error = 'Wallet not connected';
      setStatus({ status: 'error', error });
      onError?.(error);
      toast.error(error);
      return;
    }

    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      const error = 'Invalid offer amount';
      setStatus({ status: 'error', error });
      onError?.(error);
      toast.error(error);
      return;
    }

    try {
      const result = await submitOffer({
        walletClient,
        tradeData,
        offerAmount,
        duration,
        onStatusUpdate: setStatus,
      });

      toast.success(`Offer of ${offerAmount} ${tradeData.currency} submitted!`);
      onSuccess?.(result.offerId);

      // Track analytics
      try {
        await fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'OFFER_FROM_CHAT',
            domainName: tradeData.domainName,
            userId: user?.wallet?.address,
            metadata: { 
              amount: offerAmount, 
              duration,
              source: 'xmtp_chat',
            },
          }),
        });
      } catch (analyticsError) {
        console.error('Analytics tracking failed:', analyticsError);
      }
    } catch (error: any) {
      const errorMsg = error?.message || 'Failed to submit offer';
      setStatus({ status: 'error', error: errorMsg });
      onError?.(errorMsg);
      toast.error(errorMsg);
    }
  }, [authenticated, walletClient, tradeData, login, onSuccess, onError, user]);

  /**
   * Reset status
   */
  const reset = useCallback(() => {
    setStatus({ status: 'idle' });
    setGasEstimate(null);
  }, []);

  return {
    // State
    status,
    gasEstimate,
    isEstimating,
    isProcessing: ['estimating', 'pending', 'confirming'].includes(status.status),
    isSuccess: status.status === 'success',
    isError: status.status === 'error',
    
    // Actions
    executeBuy,
    makeOffer,
    estimateGas,
    reset,
  };
}
