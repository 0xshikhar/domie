import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CustomLandingPage from '@/components/landing-builder/CustomLandingPage';
import { prisma } from '@/lib/prisma';

interface LivePageProps {
  params: {
    name: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: LivePageProps): Promise<Metadata> {
  const domainName = params.name;
  
  try {
    // Fetch domain and landing page
    const domain = await prisma.domain.findUnique({
      where: { name: domainName },
      include: {
        landingPage: true,
      },
    });

    if (!domain || !domain.landingPage || !domain.landingPage.isPublished) {
      return {
        title: `${domainName} | Domanzo`,
        description: `View ${domainName} on Domanzo`,
      };
    }

    const landingPage = domain.landingPage;
    
    const title = landingPage.customTitle || `${domainName} - Premium Domain`;
    const description = landingPage.customDescription || `Discover ${domainName} - a premium domain name available now.`;
    const ogImage = landingPage.customOgImage || `${process.env.NEXT_PUBLIC_APP_URL}/api/og/${domainName}`;

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
        canonical: `${process.env.NEXT_PUBLIC_APP_URL}/live/${domainName}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: `${domainName} | Domanzo`,
      description: `View ${domainName} on Domanzo`,
    };
  }
}

// Server-side rendering
export default async function LivePage({ params }: LivePageProps) {
  const domainName = params.name;

  try {
    // Fetch domain with landing page
    const domain = await prisma.domain.findUnique({
      where: { name: domainName },
      include: {
        landingPage: true,
      },
    });

    if (!domain) {
      notFound();
    }

    // Check if landing page exists and is published
    if (!domain.landingPage || !domain.landingPage.isPublished) {
      notFound();
    }

    // Add structured data for SEO
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: domainName,
      description: domain.landingPage.customDescription || domain.description,
      offers: domain.isListed ? {
        '@type': 'Offer',
        price: domain.price,
        priceCurrency: domain.currency,
        availability: 'https://schema.org/InStock',
        url: `${process.env.NEXT_PUBLIC_APP_URL}/live/${domainName}`,
      } : undefined,
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <CustomLandingPage
          landingPage={domain.landingPage as any}
          domainName={domainName}
        />
      </>
    );
  } catch (error) {
    console.error('Error fetching landing page:', error);
    notFound();
  }
}
