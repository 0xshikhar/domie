'use client';

import { LandingPageData, LandingPageSection } from '@/types/landing-page';
import HeroSection from './sections/HeroSection';
import AboutSection from './sections/AboutSection';
import FeaturesSection from './sections/FeaturesSection';
import StatsSection from './sections/StatsSection';
import CTASection from './sections/CTASection';

interface CustomLandingPageProps {
  landingPage: LandingPageData;
  domainName: string;
  onBuyNow?: () => void;
  onMakeOffer?: () => void;
  onContact?: () => void;
}

export default function CustomLandingPage({
  landingPage,
  domainName,
  onBuyNow,
  onMakeOffer,
  onContact,
}: CustomLandingPageProps) {
  const colors = {
    primary: landingPage.primaryColor,
    secondary: landingPage.secondaryColor,
    accent: landingPage.accentColor,
  };

  const sections = (landingPage.sections as LandingPageSection[])
    .filter((section) => section.enabled)
    .sort((a, b) => a.order - b.order);

  const renderSection = (section: LandingPageSection) => {
    const commonProps = {
      config: section.config,
      colors,
      domainName,
    };

    switch (section.type) {
      case 'hero':
        return <HeroSection key={section.id} {...commonProps} onCTA={onBuyNow} />;
      case 'about':
        return <AboutSection key={section.id} {...commonProps} />;
      case 'features':
        return <FeaturesSection key={section.id} {...commonProps} />;
      case 'stats':
        return <StatsSection key={section.id} {...commonProps} />;
      case 'cta':
        return (
          <CTASection
            key={section.id}
            {...commonProps}
            onPrimaryCTA={onBuyNow}
            onSecondaryCTA={onContact}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{
        fontFamily: landingPage.fontFamily,
      }}
    >
      {/* Custom Logo */}
      {landingPage.logoUrl && (
        <div className="fixed top-6 left-6 z-50">
          <img
            src={landingPage.logoUrl}
            alt="Logo"
            className="h-12 w-auto"
          />
        </div>
      )}

      {/* Render Sections */}
      {sections.map((section) => renderSection(section))}
    </div>
  );
}
