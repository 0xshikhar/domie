// Analytics helper functions

export async function trackEvent(
  event: string,
  domainId: string,
  userId?: string,
  metadata?: Record<string, any>
) {
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domainId,
        userId,
        event,
        metadata,
      }),
    });
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

export function trackPageView(domainId: string, userId?: string) {
  return trackEvent('PAGE_VIEW', domainId, userId);
}

export function trackDomainClick(domainId: string, userId?: string) {
  return trackEvent('DOMAIN_CLICK', domainId, userId);
}

export function trackOfferMade(domainId: string, userId?: string, amount?: string) {
  return trackEvent('OFFER_MADE', domainId, userId, { amount });
}

export function trackBuyClick(domainId: string, userId?: string) {
  return trackEvent('BUY_CLICK', domainId, userId);
}

export function trackMessageSent(domainId: string, userId?: string) {
  return trackEvent('MESSAGE_SENT', domainId, userId);
}

export function trackWatchlistAdd(domainId: string, userId?: string) {
  return trackEvent('WATCHLIST_ADD', domainId, userId);
}

export function trackDealCreated(domainId: string, userId?: string, dealId?: string) {
  return trackEvent('DEAL_CREATED', domainId, userId, { dealId });
}
