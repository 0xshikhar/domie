'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PageBuilder from '@/components/landing-builder/PageBuilder';
import { LandingPageData } from '@/types/landing-page';
import { toast } from 'sonner';
import { usePrivy } from '@privy-io/react-auth';

export default function CustomizePage() {
  const params = useParams();
  const domainName = decodeURIComponent(params.name as string);
  const { authenticated, login, user } = usePrivy();
  const [initialData, setInitialData] = useState<Partial<LandingPageData> | undefined>();
  const [loading, setLoading] = useState(true);
  const [domainId, setDomainId] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch domain to get ID
        const domainResponse = await fetch(`/api/domains?name=${domainName}`);
        if (domainResponse.ok) {
          const domainData = await domainResponse.json();
          setDomainId(domainData.id);

          // Fetch existing landing page if any
          const landingPageResponse = await fetch(`/api/landing-pages?domainId=${domainData.id}`);
          if (landingPageResponse.ok) {
            const landingPageData = await landingPageResponse.json();
            if (landingPageData) {
              setInitialData(landingPageData);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [domainName]);

  const handleSave = async (data: Partial<LandingPageData>) => {
    if (!authenticated || !user?.wallet?.address) {
      toast.error('Please connect your wallet');
      login();
      return;
    }

    try {
      // Get or create user first - MUST have a valid user ID
      const userResponse = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: user.wallet.address.toLowerCase(),
        }),
      });

      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error('Failed to create user:', errorText);
        throw new Error('Failed to create user account. Please try again.');
      }

      const userData = await userResponse.json();
      const userId = userData.id;

      if (!userId) {
        throw new Error('User ID not returned from server');
      }

      // Prepare the data with proper structure
      const saveData = {
        domainId,
        ownerId: userId,
        primaryColor: data.primaryColor || '#3b82f6',
        secondaryColor: data.secondaryColor || '#1e293b',
        accentColor: data.accentColor || '#8b5cf6',
        logoUrl: data.logoUrl || null,
        heroImageUrl: data.heroImageUrl || null,
        heroVideoUrl: data.heroVideoUrl || null,
        fontFamily: data.fontFamily || 'Inter',
        customTitle: data.customTitle || null,
        customDescription: data.customDescription || null,
        customOgImage: data.customOgImage || null,
        customKeywords: data.customKeywords || [],
        sections: data.sections || [],
        template: data.template || 'default',
        isPublished: data.isPublished || false,
        showOrderbook: data.showOrderbook ?? true,
        showAnalytics: data.showAnalytics ?? true,
        showOffers: data.showOffers ?? true,
        primaryCTA: data.primaryCTA || 'Buy Now',
        secondaryCTA: data.secondaryCTA || 'Make Offer',
      };

      const response = await fetch('/api/landing-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Save failed:', errorData);
        throw new Error(errorData.error || 'Failed to save landing page');
      }

      const result = await response.json();
      toast.success(data.isPublished ? 'Landing page published!' : 'Landing page saved!');
      return result;
    } catch (error) {
      console.error('Error saving landing page:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save landing page';
      toast.error(errorMessage);
      throw error;
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">Please connect your wallet to customize your domain landing page.</p>
          <button
            onClick={login}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading page builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageBuilder
        domainId={domainId}
        domainName={domainName}
        initialData={initialData}
        onSave={handleSave}
      />
    </div>
  );
}
