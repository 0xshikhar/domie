'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { usePrivy } from '@privy-io/react-auth';

interface CreateDealModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateDealModal({ open, onClose }: CreateDealModalProps) {
  const { authenticated, login } = usePrivy();
  const [formData, setFormData] = useState({
    domainName: '',
    title: '',
    description: '',
    targetPrice: '',
    minContribution: '',
    maxParticipants: '10',
    duration: '7',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [dealId, setDealId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!authenticated) {
      login();
      return;
    }

    // Validation
    if (!formData.domainName || !formData.title || !formData.targetPrice) {
      setError('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // TODO: Implement actual deal creation
      await new Promise(resolve => setTimeout(resolve, 1500));
      setDealId('deal_' + Math.random().toString(36).substr(2, 9));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create deal');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAndClose = () => {
    setFormData({
      domainName: '',
      title: '',
      description: '',
      targetPrice: '',
      minContribution: '',
      maxParticipants: '10',
      duration: '7',
    });
    setDealId(null);
    setError(null);
    setIsProcessing(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Community Deal</DialogTitle>
          <DialogDescription>
            Start a group buy for a premium domain
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Domain Name */}
          <div className="space-y-2">
            <Label htmlFor="domain-name">Domain Name *</Label>
            <Input
              id="domain-name"
              placeholder="e.g., premium.doma"
              value={formData.domainName}
              onChange={(e) => setFormData({ ...formData, domainName: e.target.value })}
              disabled={isProcessing || !!dealId}
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Deal Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Group Buy: premium.doma"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={isProcessing || !!dealId}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe why this domain is worth buying..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isProcessing || !!dealId}
              rows={3}
            />
          </div>

          {/* Target Price */}
          <div className="space-y-2">
            <Label htmlFor="target-price">Target Price (ETH) *</Label>
            <Input
              id="target-price"
              type="number"
              step="0.1"
              placeholder="5.0"
              value={formData.targetPrice}
              onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
              disabled={isProcessing || !!dealId}
            />
          </div>

          {/* Min Contribution */}
          <div className="space-y-2">
            <Label htmlFor="min-contribution">Minimum Contribution (ETH)</Label>
            <Input
              id="min-contribution"
              type="number"
              step="0.01"
              placeholder="0.5"
              value={formData.minContribution}
              onChange={(e) => setFormData({ ...formData, minContribution: e.target.value })}
              disabled={isProcessing || !!dealId}
            />
          </div>

          {/* Max Participants */}
          <div className="space-y-2">
            <Label htmlFor="max-participants">Maximum Participants</Label>
            <Input
              id="max-participants"
              type="number"
              placeholder="10"
              value={formData.maxParticipants}
              onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
              disabled={isProcessing || !!dealId}
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (days)</Label>
            <select
              id="duration"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              disabled={isProcessing || !!dealId}
            >
              <option value="3">3 days</option>
              <option value="7">7 days</option>
              <option value="14">14 days</option>
              <option value="30">30 days</option>
            </select>
          </div>

          {/* Success State */}
          {dealId && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Deal created successfully! Share it with your community.
              </AlertDescription>
            </Alert>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={resetAndClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={isProcessing || !!dealId}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : dealId ? (
                'Created'
              ) : (
                'Create Deal'
              )}
            </Button>
          </div>

          {!authenticated && (
            <p className="text-xs text-center text-muted-foreground">
              You&apos;ll need to connect your wallet to create a deal
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
