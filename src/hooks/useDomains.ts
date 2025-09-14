'use client';

import { useQuery } from '@tanstack/react-query';
import { Domain } from '@/lib/doma/types';

interface UseDomainsOptions {
  search?: string;
  isListed?: boolean;
  limit?: number;
  offset?: number;
}

export function useDomains(options: UseDomainsOptions = {}) {
  return useQuery({
    queryKey: ['domains', options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.search) params.append('search', options.search);
      if (options.isListed !== undefined) params.append('isListed', String(options.isListed));
      if (options.limit) params.append('limit', String(options.limit));
      if (options.offset) params.append('offset', String(options.offset));

      const response = await fetch(`/api/domains?${params}`);
      if (!response.ok) throw new Error('Failed to fetch domains');
      return response.json();
    },
  });
}

export function useDomain(id: string) {
  return useQuery({
    queryKey: ['domain', id],
    queryFn: async () => {
      const response = await fetch(`/api/domains/${id}`);
      if (!response.ok) throw new Error('Failed to fetch domain');
      return response.json() as Promise<Domain>;
    },
    enabled: !!id,
  });
}
