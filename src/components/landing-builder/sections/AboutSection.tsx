'use client';

import { SectionConfig } from '@/types/landing-page';
import { CheckCircle2 } from 'lucide-react';

interface AboutSectionProps {
  config: SectionConfig;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  domainName: string;
}

export default function AboutSection({ config, colors, domainName }: AboutSectionProps) {
  const {
    title = `About ${domainName}`,
    description = 'This premium domain name offers exceptional value for businesses and projects looking to establish a strong online presence.',
    features = [
      { title: 'Memorable', description: 'Easy to remember and type' },
      { title: 'Brandable', description: 'Perfect for building a strong brand' },
      { title: 'SEO-Friendly', description: 'Great for search engine optimization' },
    ],
    imageUrl,
    alignment = 'left',
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
        <div className={`grid md:grid-cols-2 gap-12 items-center ${alignment === 'right' ? 'md:flex-row-reverse' : ''}`}>
          {/* Content */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold" style={{ color: colors.primary }}>
              {title}
            </h2>
            
            <p className="text-lg opacity-80 leading-relaxed">
              {description}
            </p>

            {features && features.length > 0 && (
              <div className="space-y-4 mt-8">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2
                      className="h-6 w-6 flex-shrink-0 mt-1"
                      style={{ color: colors.primary }}
                    />
                    <div>
                      <h3 className="font-semibold text-lg">{feature.title}</h3>
                      <p className="opacity-70">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Image */}
          <div className="relative">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="rounded-2xl shadow-2xl w-full h-auto"
              />
            ) : (
              <div
                className="rounded-2xl shadow-2xl w-full h-96 flex items-center justify-center text-6xl font-bold"
                style={{
                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
                  color: '#ffffff',
                }}
              >
                {domainName.split('.')[0].charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
