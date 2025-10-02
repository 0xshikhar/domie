'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MessageCircle, Loader2 } from 'lucide-react';
import { createBuyNowTradeCard, createOfferTradeCard } from '@/lib/xmtp/client';
import { usePrivy } from '@privy-io/react-auth';
import { toast } from 'sonner';

interface SendTradeCardButtonProps {
  domainName: string;
  tokenId: string;
  price?: string;
  currency?: string;
  ownerAddress: string;
  action?: 'buy' | 'offer';
  offerAmount?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

/**
 * Button component to send trade cards in XMTP chat
 * Can be used on domain pages to initiate trade conversations
 */
export default function SendTradeCardButton({
  domainName,
  tokenId,
  price,
  currency = 'ETH',
  ownerAddress,
  action = 'buy',
  offerAmount,
  variant = 'default',
  size = 'default',
  className,
}: SendTradeCardButtonProps) {
  const router = useRouter();
  const { authenticated, login } = usePrivy();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleSendTradeCard = async () => {
    if (!authenticated) {
      toast.info('Please connect your wallet to start a conversation');
      login();
      return;
    }

    if (!ownerAddress) {
      toast.error('Owner address not available');
      return;
    }

    setIsNavigating(true);

    try {
      let tradeCardMessage = '';

      if (action === 'buy' && price) {
        tradeCardMessage = createBuyNowTradeCard(
          domainName,
          tokenId,
          price,
          currency
        );
      } else if (action === 'offer' && offerAmount) {
        tradeCardMessage = createOfferTradeCard(
          domainName,
          tokenId,
          offerAmount,
          currency
        );
      } else {
        toast.error('Invalid trade card configuration');
        return;
      }

      // Navigate to messages page with trade card
      router.push(
        `/messages?peer=${ownerAddress}&tradeCard=${encodeURIComponent(tradeCardMessage)}`
      );

      toast.success('Opening trade conversation...');
    } catch (error) {
      console.error('Failed to send trade card:', error);
      toast.error('Failed to open conversation');
    } finally {
      setIsNavigating(false);
    }
  };

  return (
    <Button
      onClick={handleSendTradeCard}
      disabled={isNavigating}
      variant={variant}
      size={size}
      className={className}
    >
      {isNavigating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Opening...
        </>
      ) : (
        <>
          <MessageCircle className="mr-2 h-4 w-4" />
          {action === 'buy' ? 'Buy in Chat' : 'Make Offer in Chat'}
        </>
      )}
    </Button>
  );
}

/**
 * Usage Example:
 * 
 * import SendTradeCardButton from '@/components/trading/SendTradeCardButton';
 * 
 * // On a domain landing page:
 * <SendTradeCardButton
 *   domainName={domain.name}
 *   tokenId={domain.tokenId}
 *   price={domain.price}
 *   currency="ETH"
 *   ownerAddress={domain.owner}
 *   action="buy"
 * />
 * 
 * // For making an offer:
 * <SendTradeCardButton
 *   domainName={domain.name}
 *   tokenId={domain.tokenId}
 *   currency="ETH"
 *   ownerAddress={domain.owner}
 *   action="offer"
 *   offerAmount="0.45"
 *   variant="secondary"
 * />
 */
