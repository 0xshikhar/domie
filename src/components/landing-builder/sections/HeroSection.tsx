'use client';

import { Button } from '@/components/ui/button';
import { SectionConfig } from '@/types/landing-page';
import { ArrowRight, Play } from 'lucide-react';

interface HeroSectionProps {
  config: SectionConfig;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  domainName: string;
  onCTA?: () => void;
}

export default function HeroSection({ config, colors, domainName, onCTA }: HeroSectionProps) {
  const {
    title = `Own ${domainName}`,
    subtitle = 'Premium Domain Name',
    description = 'Secure this valuable digital asset for your brand or project.',
    imageUrl,
    videoUrl,
    ctaText = 'Get Started',
    alignment = 'center',
  } = config;

  const alignmentClass = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  }[alignment];

  return (
    <section
      className="relative min-h-[600px] flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: config.backgroundColor || colors.secondary,
        color: config.textColor || '#ffffff',
      }}
    >
      {/* Background Image/Video */}
      {videoUrl && (
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-30"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        </div>
      )}
      {!videoUrl && imageUrl && (
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      )}

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.accent}20 100%)`,
        }}
      />

      {/* Content */}
      <div className={`relative z-10 max-w-5xl mx-auto px-6 py-20 flex flex-col gap-6 ${alignmentClass}`}>
        {subtitle && (
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
            style={{
              backgroundColor: `${colors.primary}30`,
              color: colors.primary,
            }}
          >
            {subtitle}
          </div>
        )}

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          {title}
        </h1>

        {description && (
          <p className="text-xl md:text-2xl opacity-90 max-w-3xl">
            {description}
          </p>
        )}

        <div className="flex flex-wrap gap-4 mt-4">
          <Button
            size="lg"
            onClick={onCTA}
            style={{
              backgroundColor: colors.primary,
              color: '#ffffff',
            }}
            className="text-lg px-8 hover:opacity-90 transition-opacity"
          >
            {ctaText}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          {videoUrl && (
            <Button
              size="lg"
              variant="outline"
              style={{
                borderColor: colors.primary,
                color: colors.primary,
              }}
              className="text-lg px-8"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
