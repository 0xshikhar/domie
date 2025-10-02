export interface LandingPageSection {
  id: string;
  type: SectionType;
  order: number;
  enabled: boolean;
  config: SectionConfig;
}

export type SectionType =
  | 'hero'
  | 'about'
  | 'features'
  | 'stats'
  | 'pricing'
  | 'testimonials'
  | 'faq'
  | 'contact'
  | 'cta';

export interface SectionConfig {
  // Hero Section
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  
  // Features Section
  features?: Feature[];
  
  // Stats Section
  stats?: Stat[];
  
  // Testimonials Section
  testimonials?: Testimonial[];
  
  // FAQ Section
  faqs?: FAQ[];
  
  // Custom styling
  backgroundColor?: string;
  textColor?: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface Feature {
  icon?: string;
  title: string;
  description: string;
}

export interface Stat {
  label: string;
  value: string;
  suffix?: string;
  prefix?: string;
}

export interface Testimonial {
  name: string;
  role?: string;
  avatar?: string;
  content: string;
  rating?: number;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface LandingPageTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  sections: LandingPageSection[];
}

export interface LandingPageData {
  id: string;
  domainId: string;
  ownerId: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoUrl?: string;
  heroImageUrl?: string;
  heroVideoUrl?: string;
  fontFamily: string;
  customTitle?: string;
  customDescription?: string;
  customOgImage?: string;
  customKeywords: string[];
  sections: LandingPageSection[];
  template: string;
  isPublished: boolean;
  showOrderbook: boolean;
  showAnalytics: boolean;
  showOffers: boolean;
  primaryCTA: string;
  secondaryCTA: string;
  createdAt: string;
  updatedAt: string;
}
