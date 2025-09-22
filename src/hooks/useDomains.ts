'use client';

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchNames, fetchName, fetchOffers, fetchNameStatistics } from '@/lib/doma/client';

interface UseDomainsOptions {
  search?: string;
  isListed?: boolean;
  limit?: number;
  tlds?: string[];
}

export function useDomains(options: UseDomainsOptions = {}) {
  return useInfiniteQuery({
    queryKey: ['domains', options],
    queryFn: async ({ pageParam = 0 }) => {
      return await fetchNames({
        skip: pageParam,
        take: options.limit || 20,
        name: options.search || undefined,
        listed: options.isListed,
        tlds: options.tlds || undefined,
      });
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.currentPage * (options.limit || 20) : undefined;
    },
    initialPageParam: 0,
  });
}

export function useDomain(name: string) {
  return useQuery({
    queryKey: ['domain', name],
    queryFn: async () => {
      return await fetchName(name);
    },
    enabled: !!name,
  });
}

export function useDomainOffers(tokenId: string, limit = 20) {
  return useInfiniteQuery({
    queryKey: ['domain-offers', tokenId],
    queryFn: async ({ pageParam = 0 }) => {
      return await fetchOffers(tokenId, pageParam, limit);
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.currentPage * limit : undefined;
    },
    initialPageParam: 0,
    enabled: !!tokenId,
  });
}

export function useDomainStats(tokenId: string) {
  return useQuery({
    queryKey: ['domain-stats', tokenId],
    queryFn: async () => {
      return await fetchNameStatistics(tokenId);
    },
    enabled: !!tokenId,
  });
}
