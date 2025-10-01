'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Share2, Twitter, Copy, Code, CheckCircle2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface ShareButtonsProps {
  domainName: string;
  price?: string;
  currency?: string;
  description?: string;
  url?: string;
}

export default function ShareButtons({ 
  domainName, 
  price, 
  currency = 'ETH', 
  description,
  url 
}: ShareButtonsProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = `Check out ${domainName} on Domanzo! ${price ? `Listed for ${price} ${currency}` : 'Available now'}`;
  const twitterText = encodeURIComponent(shareText);
  const twitterUrl = `https://twitter.com/intent/tweet?text=${twitterText}&url=${encodeURIComponent(shareUrl)}`;

  const embedCode = `<iframe src="${shareUrl}?embed=true" width="600" height="400" frameborder="0"></iframe>`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success(`${type} copied to clipboard!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${domainName} - Premium Domain`,
          text: shareText,
          url: shareUrl,
        });
        toast.success('Shared successfully!');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      copyToClipboard(shareUrl, 'Link');
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleNativeShare}
        className="gap-2"
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            More Options
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Share {domainName}</DialogTitle>
            <DialogDescription>
              Share this domain with your network
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Social Media Sharing */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Share on Social Media</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => window.open(twitterUrl, '_blank')}
                >
                  <Twitter className="h-4 w-4" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={handleNativeShare}
                >
                  <Share2 className="h-4 w-4" />
                  More
                </Button>
              </div>
            </div>

            {/* Copy Link */}
            <div className="space-y-2">
              <Label htmlFor="share-url" className="text-sm font-semibold">
                Copy Link
              </Label>
              <div className="flex gap-2">
                <Input
                  id="share-url"
                  value={shareUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(shareUrl, 'Link')}
                >
                  {copied === 'Link' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Embed Code */}
            <div className="space-y-2">
              <Label htmlFor="embed-code" className="text-sm font-semibold">
                Embed Code
              </Label>
              <div className="space-y-2">
                <Textarea
                  id="embed-code"
                  value={embedCode}
                  readOnly
                  rows={3}
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => copyToClipboard(embedCode, 'Embed code')}
                >
                  {copied === 'Embed code' ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Code className="h-4 w-4" />
                      Copy Embed Code
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Custom Message */}
            <div className="space-y-2">
              <Label htmlFor="custom-message" className="text-sm font-semibold">
                Custom Message
              </Label>
              <Textarea
                id="custom-message"
                placeholder="Add a personal message..."
                rows={3}
              />
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => {
                  const message = (document.getElementById('custom-message') as HTMLTextAreaElement)?.value;
                  const fullText = message ? `${message}\n\n${shareUrl}` : shareUrl;
                  copyToClipboard(fullText, 'Message');
                }}
              >
                <Copy className="h-4 w-4" />
                Copy with Message
              </Button>
            </div>

            {/* QR Code (Future Enhancement) */}
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                Share this domain to help increase its visibility and value
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ShareButton({ 
  domainName, 
  price, 
  currency,
  variant = 'outline',
  size = 'default',
  fullWidth = false,
}: ShareButtonsProps & { 
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  fullWidth?: boolean;
}) {
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Check out ${domainName} on Domanzo! ${price ? `Listed for ${price} ${currency}` : 'Available now'}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${domainName} - Premium Domain`,
          text: shareText,
          url: shareUrl,
        });
        toast.success('Shared successfully!');
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <Button 
      variant={variant}
      size={size}
      onClick={handleShare}
      className={fullWidth ? 'w-full gap-2' : 'gap-2'}
    >
      <Share2 className="h-4 w-4" />
      Share
    </Button>
  );
}
