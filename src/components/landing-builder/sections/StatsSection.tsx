'use client';

import { SectionConfig } from '@/types/landing-page';
import { TrendingUp, Users, Globe, Zap } from 'lucide-react';

interface StatsSectionProps {
  config: SectionConfig;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const iconMap = {
  trending: TrendingUp,
  users: Users,
  globe: Globe,
  zap: Zap,
};

export default function StatsSection({ config, colors }: StatsSectionProps) {
  const {
    title = 'Domain Statistics',
    stats = [
      { label: 'Page Views', value: '10K', prefix: '', suffix: '+' },
      { label: 'Offers Received', value: '25', prefix: '', suffix: '' },
      { label: 'Watchers', value: '150', prefix: '', suffix: '+' },
      { label: 'Market Value', value: '5', prefix: '$', suffix: 'K' },
    ],
  } = config;

  return (
    <section
      className="py-20 px-6"
      style={{
        backgroundColor: config.backgroundColor || colors.secondary,
        color: config.textColor || '#ffffff',
      }}
    >
      <div className="max-w-7xl mx-auto">
        {title && (
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            {title}
          </h2>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-xl backdrop-blur-sm"
              style={{
                backgroundColor: `${colors.primary}20`,
              }}
            >
              <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: colors.primary }}>
                {stat.prefix}{stat.value}{stat.suffix}
              </div>
              <div className="text-sm md:text-base opacity-80">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
