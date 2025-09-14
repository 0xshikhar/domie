'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Deal, DealStatus } from '@/lib/doma/types';

interface UseDealsOptions {
  status?: DealStatus;
  domainId?: string;
}

export function useDeals(options: UseDealsOptions = {}) {
  return useQuery({
    queryKey: ['deals', options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.status) params.append('status', options.status);
      if (options.domainId) params.append('domainId', options.domainId);

      const response = await fetch(`/api/deals?${params}`);
      if (!response.ok) throw new Error('Failed to fetch deals');
      return response.json() as Promise<Deal[]>;
    },
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create deal');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
    },
  });
}

export function useParticipateDeal(dealId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { userId: string; contribution: string }) => {
      const response = await fetch(`/api/deals/${dealId}/participate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to participate in deal');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] });
      queryClient.invalidateQueries({ queryKey: ['deals', dealId] });
    },
  });
}
