import { LandingPageTemplate } from '@/types/landing-page';

export const templates: LandingPageTemplate[] = [
  {
    id: 'tech-startup',
    name: 'Tech Startup',
    description: 'Modern, clean design perfect for tech companies',
    primaryColor: '#3b82f6',
    secondaryColor: '#1e293b',
    accentColor: '#8b5cf6',
    sections: [
      {
        id: 'hero-1',
        type: 'hero',
        order: 0,
        enabled: true,
        config: {
          title: 'Build the Future',
          subtitle: 'Premium Tech Domain',
          description: 'Perfect for your next innovative project',
          ctaText: 'Get Started',
          alignment: 'center',
        },
      },
      {
        id: 'features-1',
        type: 'features',
        order: 1,
        enabled: true,
        config: {
          title: 'Why This Domain?',
          features: [
            { icon: 'zap', title: 'Lightning Fast', description: 'Instant recognition' },
            { icon: 'shield', title: 'Secure', description: 'Blockchain verified' },
            { icon: 'trending', title: 'Valuable', description: 'Appreciating asset' },
          ],
        },
      },
      {
        id: 'cta-1',
        type: 'cta',
        order: 2,
        enabled: true,
        config: {
          title: 'Ready to Launch?',
          description: 'Secure this domain today',
          ctaText: 'Buy Now',
        },
      },
    ],
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    description: 'Perfect for online stores and marketplaces',
    primaryColor: '#10b981',
    secondaryColor: '#064e3b',
    accentColor: '#f59e0b',
    sections: [
      {
        id: 'hero-1',
        type: 'hero',
        order: 0,
        enabled: true,
        config: {
          title: 'Your Store, Your Domain',
          subtitle: 'E-Commerce Ready',
          description: 'Build trust with a premium domain name',
          ctaText: 'Shop Now',
          alignment: 'left',
        },
      },
      {
        id: 'stats-1',
        type: 'stats',
        order: 1,
        enabled: true,
        config: {
          title: 'Proven Results',
          stats: [
            { label: 'Conversion Rate', value: '3.5', suffix: '%' },
            { label: 'Trust Score', value: '95', suffix: '/100' },
            { label: 'SEO Rank', value: 'A', suffix: '+' },
            { label: 'Value', value: '10', prefix: '$', suffix: 'K' },
          ],
        },
      },
      {
        id: 'cta-1',
        type: 'cta',
        order: 2,
        enabled: true,
        config: {
          title: 'Start Selling Today',
          ctaText: 'Get This Domain',
        },
      },
    ],
  },
  {
    id: 'premium-luxury',
    name: 'Premium Luxury',
    description: 'Elegant design for high-end domains',
    primaryColor: '#d97706',
    secondaryColor: '#1c1917',
    accentColor: '#fbbf24',
    sections: [
      {
        id: 'hero-1',
        type: 'hero',
        order: 0,
        enabled: true,
        config: {
          title: 'Luxury Redefined',
          subtitle: 'Premium Domain',
          description: 'Exclusivity meets excellence',
          ctaText: 'Inquire Now',
          alignment: 'center',
        },
      },
      {
        id: 'about-1',
        type: 'about',
        order: 1,
        enabled: true,
        config: {
          title: 'A Legacy Asset',
          description: 'This premium domain represents more than just a web address—it\'s a statement of quality and prestige.',
          features: [
            { title: 'Exclusive', description: 'One of a kind' },
            { title: 'Prestigious', description: 'Commands respect' },
            { title: 'Timeless', description: 'Enduring value' },
          ],
        },
      },
      {
        id: 'cta-1',
        type: 'cta',
        order: 2,
        enabled: true,
        config: {
          title: 'Own Excellence',
          ctaText: 'Make Offer',
        },
      },
    ],
  },
];
