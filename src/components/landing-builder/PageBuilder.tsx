'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LandingPageData, LandingPageSection, SectionType } from '@/types/landing-page';
import { Plus, Eye, Save, Palette, Layout, Settings, Sparkles } from 'lucide-react';
import CustomLandingPage from './CustomLandingPage';
import SectionEditor from './SectionEditor';
import { toast } from 'sonner';

interface PageBuilderProps {
  domainId: string;
  domainName: string;
  initialData?: Partial<LandingPageData>;
  onSave: (data: Partial<LandingPageData>) => Promise<void>;
}

const defaultSections: LandingPageSection[] = [
  {
    id: 'hero-1',
    type: 'hero',
    order: 0,
    enabled: true,
    config: {
      title: '',
      subtitle: 'Premium Domain Name',
      description: 'Secure this valuable digital asset for your brand or project.',
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
      description: 'Discover what makes this domain name a valuable asset.',
      features: [
        { icon: 'sparkles', title: 'Premium Quality', description: 'Short, memorable, and brandable' },
        { icon: 'shield', title: 'Secure Ownership', description: 'Blockchain-verified ownership' },
        { icon: 'zap', title: 'Instant Transfer', description: 'Quick and easy domain transfer' },
      ],
    },
  },
  {
    id: 'stats-1',
    type: 'stats',
    order: 2,
    enabled: true,
    config: {
      title: 'Domain Statistics',
      stats: [
        { label: 'Page Views', value: '10K', suffix: '+' },
        { label: 'Offers', value: '25', suffix: '' },
        { label: 'Watchers', value: '150', suffix: '+' },
        { label: 'Value', value: '5', prefix: '$', suffix: 'K' },
      ],
    },
  },
  {
    id: 'cta-1',
    type: 'cta',
    order: 3,
    enabled: true,
    config: {
      title: 'Ready to Own This Domain?',
      description: 'Secure this premium domain name today.',
      ctaText: 'Buy Now',
    },
  },
];

export default function PageBuilder({ domainId, domainName, initialData, onSave }: PageBuilderProps) {
  const [landingPage, setLandingPage] = useState<Partial<LandingPageData>>({
    domainId,
    primaryColor: initialData?.primaryColor || '#3b82f6',
    secondaryColor: initialData?.secondaryColor || '#1e293b',
    accentColor: initialData?.accentColor || '#8b5cf6',
    fontFamily: initialData?.fontFamily || 'Inter',
    sections: (initialData?.sections as LandingPageSection[]) || defaultSections,
    template: initialData?.template || 'default',
    isPublished: initialData?.isPublished || false,
    showOrderbook: initialData?.showOrderbook ?? true,
    showAnalytics: initialData?.showAnalytics ?? true,
    showOffers: initialData?.showOffers ?? true,
    primaryCTA: initialData?.primaryCTA || 'Buy Now',
    secondaryCTA: initialData?.secondaryCTA || 'Make Offer',
    customTitle: initialData?.customTitle || '',
    customDescription: initialData?.customDescription || '',
    customKeywords: initialData?.customKeywords || [],
    ...initialData,
  });

  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);

  const updateLandingPage = (updates: Partial<LandingPageData>) => {
    setLandingPage((prev) => ({ ...prev, ...updates }));
  };

  const updateSection = (sectionId: string, updates: Partial<LandingPageSection>) => {
    const sections = (landingPage.sections as LandingPageSection[]) || [];
    const updatedSections = sections.map((section) =>
      section.id === sectionId ? { ...section, ...updates } : section
    );
    updateLandingPage({ sections: updatedSections });
  };

  const addSection = (type: SectionType) => {
    const sections = (landingPage.sections as LandingPageSection[]) || [];
    const newSection: LandingPageSection = {
      id: `${type}-${Date.now()}`,
      type,
      order: sections.length,
      enabled: true,
      config: {},
    };
    updateLandingPage({ sections: [...sections, newSection] });
    toast.success('Section added');
  };

  const deleteSection = (sectionId: string) => {
    const sections = (landingPage.sections as LandingPageSection[]) || [];
    const updatedSections = sections.filter((s) => s.id !== sectionId);
    updateLandingPage({ sections: updatedSections });
    toast.success('Section deleted');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(landingPage);
      toast.success('Landing page saved successfully');
    } catch (error) {
      toast.error('Failed to save landing page');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      await onSave({ ...landingPage, isPublished: true });
      updateLandingPage({ isPublished: true });
      toast.success('Landing page published!');
    } catch (error) {
      toast.error('Failed to publish landing page');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (previewMode) {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Preview Mode</h2>
          <Button onClick={() => setPreviewMode(false)}>Exit Preview</Button>
        </div>
        <div className="pt-20">
          <CustomLandingPage
            landingPage={landingPage as LandingPageData}
            domainName={domainName}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Landing Page Builder</h1>
            <p className="text-sm text-muted-foreground">{domainName}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPreviewMode(true)}>
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
            <Button variant="outline" onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button onClick={handlePublish} disabled={saving}>
              <Sparkles className="mr-2 h-4 w-4" />
              Publish
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="design" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="design">
              <Palette className="mr-2 h-4 w-4" />
              Design
            </TabsTrigger>
            <TabsTrigger value="sections">
              <Layout className="mr-2 h-4 w-4" />
              Sections
            </TabsTrigger>
            <TabsTrigger value="seo">
              <Settings className="mr-2 h-4 w-4" />
              SEO
            </TabsTrigger>
          </TabsList>

          {/* Design Tab */}
          <TabsContent value="design" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Brand Colors</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Primary Color</Label>
                  <Input
                    type="color"
                    value={landingPage.primaryColor}
                    onChange={(e) => updateLandingPage({ primaryColor: e.target.value })}
                    className="h-12 cursor-pointer"
                  />
                </div>
                <div>
                  <Label>Secondary Color</Label>
                  <Input
                    type="color"
                    value={landingPage.secondaryColor}
                    onChange={(e) => updateLandingPage({ secondaryColor: e.target.value })}
                    className="h-12 cursor-pointer"
                  />
                </div>
                <div>
                  <Label>Accent Color</Label>
                  <Input
                    type="color"
                    value={landingPage.accentColor}
                    onChange={(e) => updateLandingPage({ accentColor: e.target.value })}
                    className="h-12 cursor-pointer"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Typography</h3>
              <div>
                <Label>Font Family</Label>
                <select
                  className="w-full mt-2 p-2 border rounded-md"
                  value={landingPage.fontFamily}
                  onChange={(e) => updateLandingPage({ fontFamily: e.target.value })}
                >
                  <option value="Inter">Inter</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Playfair Display">Playfair Display</option>
                </select>
              </div>
            </Card>
          </TabsContent>

          {/* Sections Tab */}
          <TabsContent value="sections" className="space-y-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Page Sections</h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => addSection('hero')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Hero
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => addSection('features')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Features
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => addSection('stats')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Stats
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {((landingPage.sections as LandingPageSection[]) || []).map((section) => (
                  <SectionEditor
                    key={section.id}
                    section={section}
                    onUpdate={(updates) => updateSection(section.id, updates)}
                    onDelete={() => deleteSection(section.id)}
                  />
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">SEO Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label>Custom Page Title</Label>
                  <Input
                    value={landingPage.customTitle || ''}
                    onChange={(e) => updateLandingPage({ customTitle: e.target.value })}
                    placeholder={`${domainName} - Premium Domain`}
                  />
                </div>
                <div>
                  <Label>Meta Description</Label>
                  <textarea
                    className="w-full mt-2 p-2 border rounded-md"
                    rows={3}
                    value={landingPage.customDescription || ''}
                    onChange={(e) => updateLandingPage({ customDescription: e.target.value })}
                    placeholder="Describe your domain..."
                  />
                </div>
                <div>
                  <Label>Keywords (comma-separated)</Label>
                  <Input
                    value={(landingPage.customKeywords || []).join(', ')}
                    onChange={(e) =>
                      updateLandingPage({
                        customKeywords: e.target.value.split(',').map((k) => k.trim()),
                      })
                    }
                    placeholder="domain, premium, web3"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
