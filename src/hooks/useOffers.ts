'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Offer } from '@/lib/doma/types';

interface UseOffersOptions {
  domainId?: string;
  userId?: string;
  status?: string;
}

export function useOffers(options: UseOffersOptions = {}) {
  return useQuery({
    queryKey: ['offers', options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.domainId) params.append('domainId', options.domainId);
      if (options.userId) params.append('userId', options.userId);
      if (options.status) params.append('status', options.status);

      const response = await fetch(`/api/offers?${params}`);
      if (!response.ok) throw new Error('Failed to fetch offers');
      return response.json() as Promise<Offer[]>;
    },
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create offer');
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['offers'] });
      queryClient.invalidateQueries({ queryKey: ['domain', variables.domainId] });
    },
  });
}
