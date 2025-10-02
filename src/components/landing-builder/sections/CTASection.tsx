'use client';

import { Button } from '@/components/ui/button';
import { SectionConfig } from '@/types/landing-page';
import { ArrowRight, MessageCircle } from 'lucide-react';

interface CTASectionProps {
  config: SectionConfig;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  onPrimaryCTA?: () => void;
  onSecondaryCTA?: () => void;
}

export default function CTASection({ config, colors, onPrimaryCTA, onSecondaryCTA }: CTASectionProps) {
  const {
    title = 'Ready to Own This Domain?',
    description = 'Secure this premium domain name today and take your brand to the next level.',
    ctaText = 'Buy Now',
  } = config;

  return (
    <section
      className="py-20 px-6"
      style={{
        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
        color: '#ffffff',
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          {title}
        </h2>
        
        {description && (
          <p className="text-xl opacity-90 mb-10">
            {description}
          </p>
        )}

        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            size="lg"
            onClick={onPrimaryCTA}
            className="text-lg px-8 bg-white hover:bg-gray-100 transition-colors"
            style={{
              color: colors.primary,
            }}
          >
            {ctaText}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={onSecondaryCTA}
            className="text-lg px-8 border-2 border-white text-white hover:bg-white/10"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Contact Owner
          </Button>
        </div>
      </div>
    </section>
  );
}
