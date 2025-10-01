import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DomainPageTabs from '@/components/domain/DomainPageTabs';
import { fetchName } from '@/lib/doma/client';
import { formatUnits } from 'viem';
import { getOrCreateDomain } from '@/lib/syncDomain';

interface DomainPageProps {
  params: {
    name: string;
  };
}

// This function generates metadata for SEO
export async function generateMetadata({ params }: DomainPageProps): Promise<Metadata> {
  const domainName = params.name;
  
  try {
    // Fetch real domain data from DOMA API
    const nameData = await fetchName(domainName);
    
    const hasListings = nameData?.tokens?.[0]?.listings?.length > 0;
    const listing = nameData?.tokens?.[0]?.listings?.[0];
    
    const price = listing 
      ? formatUnits(BigInt(listing.price), listing.currency.decimals)
      : undefined;
    const currency = listing?.currency?.symbol || 'ETH';
    
    const title = `${domainName} - Premium Domain for Sale | Domanzo`;
    const description = hasListings
      ? `${domainName} available for ${price} ${currency}. Buy now or make an offer on Domanzo marketplace.`
      : `${domainName} - Premium domain on Domanzo marketplace. Make an offer or watch for updates.`;
    const ogImage = `${process.env.NEXT_PUBLIC_APP_URL}/api/og/${domainName}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [ogImage],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_APP_URL}/domain/${domainName}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    // Fallback metadata
    return {
      title: `${domainName} | Domanzo`,
      description: `View ${domainName} on Domanzo marketplace`,
    };
  }
}

// Server-side rendering for SEO
export default async function DomainPage({ params }: DomainPageProps) {
  const domainName = params.name;

  try {
    // Fetch real domain data from DOMA API
    const nameData = await fetchName(domainName);
    
    if (!nameData) {
      notFound();
    }

    const hasListings = nameData?.tokens?.[0]?.listings?.length > 0;
    const listing = nameData?.tokens?.[0]?.listings?.[0];
    const token = nameData?.tokens?.[0];
    
    const price = listing 
      ? formatUnits(BigInt(listing.price), listing.currency.decimals)
      : undefined;
    const currency = listing?.currency?.symbol || 'ETH';
    
    // Extract TLD from domain name
    const tld = domainName.split('.').pop() || 'doma';
    
    // Parse owner address from CAIP10 format
    const ownerAddress = nameData.claimedBy?.split(':').pop() || 'Unknown';

    // Sync domain to database and get the database record
    const dbDomain = await getOrCreateDomain({
      name: domainName,
      tld,
      tokenId: token?.tokenId || '',
      owner: ownerAddress,
      isListed: hasListings,
      price: price || '0',
      currency,
      description: `Premium ${domainName} domain`,
    });

    const domain = {
      id: dbDomain.id, // Use database ID for watchlist/offers
      name: domainName,
      tld,
      tokenId: token?.tokenId || '',
      owner: ownerAddress,
      isListed: hasListings,
      price: price || '0',
      currency,
      description: dbDomain.description || `Premium ${domainName} domain`,
      views: dbDomain.views,
      watchCount: dbDomain.watchCount,
      offerCount: dbDomain.offerCount,
    };

    // Add structured data for SEO
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: domain.name,
      description: domain.description,
      offers: hasListings ? {
        '@type': 'Offer',
        price: domain.price,
        priceCurrency: domain.currency,
        availability: 'https://schema.org/InStock',
        url: `${process.env.NEXT_PUBLIC_APP_URL}/domain/${domainName}`,
      } : undefined,
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <DomainPageTabs domain={domain} />
      </>
    );
  } catch (error) {
    console.error('Error fetching domain:', error);
    notFound();
  }
}

// Generate static params for popular domains (optional)
export async function generateStaticParams() {
  // Could fetch popular domains from API for static generation
  // For now, return empty array for on-demand generation
  return [];
}
