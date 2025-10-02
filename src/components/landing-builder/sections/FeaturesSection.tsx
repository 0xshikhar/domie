'use client';

import { SectionConfig } from '@/types/landing-page';
import { Sparkles, Shield, Zap, Globe, TrendingUp, Award } from 'lucide-react';

interface FeaturesSectionProps {
  config: SectionConfig;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const iconMap: Record<string, any> = {
  sparkles: Sparkles,
  shield: Shield,
  zap: Zap,
  globe: Globe,
  trending: TrendingUp,
  award: Award,
};

export default function FeaturesSection({ config, colors }: FeaturesSectionProps) {
  const {
    title = 'Why This Domain?',
    description = 'Discover what makes this domain name a valuable asset for your business.',
    features = [
      { icon: 'sparkles', title: 'Premium Quality', description: 'Short, memorable, and brandable' },
      { icon: 'shield', title: 'Secure Ownership', description: 'Blockchain-verified ownership' },
      { icon: 'zap', title: 'Instant Transfer', description: 'Quick and easy domain transfer' },
      { icon: 'globe', title: 'Global Reach', description: 'Recognized worldwide' },
      { icon: 'trending', title: 'High Value', description: 'Appreciating digital asset' },
      { icon: 'award', title: 'Verified', description: 'Authenticated and verified' },
    ],
  } = config;

  return (
    <section
      className="py-20 px-6"
      style={{
        backgroundColor: config.backgroundColor || '#ffffff',
        color: config.textColor || colors.secondary,
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: colors.primary }}>
            {title}
          </h2>
          {description && (
            <p className="text-lg opacity-80">
              {description}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon || 'sparkles'] || Sparkles;
            
            return (
              <div
                key={index}
                className="p-6 rounded-xl border-2 hover:shadow-lg transition-all duration-300"
                style={{
                  borderColor: `${colors.primary}20`,
                  backgroundColor: `${colors.primary}05`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{
                    backgroundColor: `${colors.primary}20`,
                    color: colors.primary,
                  }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="opacity-70">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
