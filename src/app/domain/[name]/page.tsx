import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DomainLandingPage from '@/components/domain/DomainLandingPage';

interface DomainPageProps {
  params: {
    name: string;
  };
}

// This function generates metadata for SEO
export async function generateMetadata({ params }: DomainPageProps): Promise<Metadata> {
  const domainName = params.name;
  
  // TODO: Fetch domain data from DOMA API
  // For now, using mock data
  const domain = {
    name: domainName,
    price: '2.5',
    currency: 'ETH',
    description: `Premium ${domainName} domain available for purchase on Domie marketplace`,
  };

  const title = `${domainName} - Premium Domain for Sale | Domie`;
  const description = domain.description || `${domainName} available for ${domain.price} ${domain.currency}. Buy now or make an offer on Domie.`;
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
}

// Server-side rendering for SEO
export default async function DomainPage({ params }: DomainPageProps) {
  const domainName = params.name;

  // TODO: Fetch domain data from DOMA API
  // For now, using mock data
  const domain = {
    id: '1',
    name: domainName,
    tld: 'doma',
    tokenId: '123',
    owner: '0x1234...5678',
    isListed: true,
    price: '2.5',
    currency: 'ETH',
    description: `Premium ${domainName} domain`,
    views: 1234,
    watchCount: 45,
    offerCount: 8,
  };

  if (!domain) {
    notFound();
  }

  // Add structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: domain.name,
    description: domain.description,
    offers: {
      '@type': 'Offer',
      price: domain.price,
      priceCurrency: domain.currency,
      availability: 'https://schema.org/InStock',
      url: `${process.env.NEXT_PUBLIC_APP_URL}/domain/${domainName}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <DomainLandingPage domain={domain} />
    </>
  );
}

// Generate static params for popular domains (optional)
export async function generateStaticParams() {
  // TODO: Fetch popular domains from API
  return [];
}
