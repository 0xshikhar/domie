'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { LandingPageSection } from '@/types/landing-page';
import { ChevronDown, ChevronUp, Trash2, GripVertical } from 'lucide-react';

interface SectionEditorProps {
  section: LandingPageSection;
  onUpdate: (updates: Partial<LandingPageSection>) => void;
  onDelete: () => void;
}

export default function SectionEditor({ section, onUpdate, onDelete }: SectionEditorProps) {
  const [expanded, setExpanded] = useState(false);

  const updateConfig = (key: string, value: any) => {
    onUpdate({
      config: {
        ...section.config,
        [key]: value,
      },
    });
  };

  const renderConfigFields = () => {
    switch (section.type) {
      case 'hero':
        return (
          <>
            <div>
              <Label>Title</Label>
              <Input
                value={section.config.title || ''}
                onChange={(e) => updateConfig('title', e.target.value)}
                placeholder="Hero title"
              />
            </div>
            <div>
              <Label>Subtitle</Label>
              <Input
                value={section.config.subtitle || ''}
                onChange={(e) => updateConfig('subtitle', e.target.value)}
                placeholder="Subtitle"
              />
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                className="w-full mt-2 p-2 border rounded-md"
                rows={3}
                value={section.config.description || ''}
                onChange={(e) => updateConfig('description', e.target.value)}
                placeholder="Hero description"
              />
            </div>
            <div>
              <Label>CTA Button Text</Label>
              <Input
                value={section.config.ctaText || ''}
                onChange={(e) => updateConfig('ctaText', e.target.value)}
                placeholder="Get Started"
              />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={section.config.imageUrl || ''}
                onChange={(e) => updateConfig('imageUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </>
        );

      case 'about':
        return (
          <>
            <div>
              <Label>Title</Label>
              <Input
                value={section.config.title || ''}
                onChange={(e) => updateConfig('title', e.target.value)}
                placeholder="About title"
              />
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                className="w-full mt-2 p-2 border rounded-md"
                rows={4}
                value={section.config.description || ''}
                onChange={(e) => updateConfig('description', e.target.value)}
                placeholder="About description"
              />
            </div>
          </>
        );

      case 'features':
        return (
          <>
            <div>
              <Label>Title</Label>
              <Input
                value={section.config.title || ''}
                onChange={(e) => updateConfig('title', e.target.value)}
                placeholder="Features title"
              />
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                className="w-full mt-2 p-2 border rounded-md"
                rows={2}
                value={section.config.description || ''}
                onChange={(e) => updateConfig('description', e.target.value)}
                placeholder="Features description"
              />
            </div>
          </>
        );

      case 'stats':
        return (
          <>
            <div>
              <Label>Title</Label>
              <Input
                value={section.config.title || ''}
                onChange={(e) => updateConfig('title', e.target.value)}
                placeholder="Stats title"
              />
            </div>
          </>
        );

      case 'cta':
        return (
          <>
            <div>
              <Label>Title</Label>
              <Input
                value={section.config.title || ''}
                onChange={(e) => updateConfig('title', e.target.value)}
                placeholder="CTA title"
              />
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                className="w-full mt-2 p-2 border rounded-md"
                rows={2}
                value={section.config.description || ''}
                onChange={(e) => updateConfig('description', e.target.value)}
                placeholder="CTA description"
              />
            </div>
            <div>
              <Label>Button Text</Label>
              <Input
                value={section.config.ctaText || ''}
                onChange={(e) => updateConfig('ctaText', e.target.value)}
                placeholder="Buy Now"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
          <div>
            <h4 className="font-semibold capitalize">{section.type} Section</h4>
            <p className="text-sm text-muted-foreground">Order: {section.order}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={section.enabled}
            onCheckedChange={(enabled) => onUpdate({ enabled })}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-4 border-t pt-4">
          {renderConfigFields()}
        </div>
      )}
    </Card>
  );
}
