'use client';

import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchNames, fetchName, fetchOffers, fetchNameStatistics } from '@/lib/doma/client';
import { toast } from 'sonner';

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
      const vars = {
        skip: pageParam,
        take: options.limit || 20,
        name: options.search || undefined,
        // Only filter by listed when explicitly true; otherwise undefined means no filter
        listed: options.isListed === true ? true : undefined,
        tlds: options.tlds && options.tlds.length ? options.tlds : undefined,
      };
      try {
        console.debug('[useDomains][queryFn] vars', vars);
        const result = await fetchNames(vars);
        console.debug('[useDomains][result] meta', {
          currentPage: result?.currentPage,
          hasNextPage: result?.hasNextPage,
          pageSize: result?.pageSize,
          totalCount: result?.totalCount,
          items: result?.items?.length ?? 0,
        });
        return result;
      } catch (error: any) {
        toast.error('Failed to load domains', {
          description: error?.message || 'Unknown error while fetching domains',
        });
        throw error;
      }
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.hasNextPage) return undefined;
      const nextSkip = (lastPage.currentPage ?? 1) * (lastPage.pageSize ?? options.limit ?? 20);
      return nextSkip;
    },
    initialPageParam: 0,
    retry: 1,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useDomain(name: string) {
  return useQuery({
    queryKey: ['domain', name],
    queryFn: async () => {
      try {
        console.debug('[useDomain] fetching', name);
        const data = await fetchName(name);
        console.debug('[useDomain] success', { hasTokens: !!data?.tokens?.length });
        return data;
      } catch (error: any) {
        toast.error('Failed to load domain', { description: error?.message });
        throw error;
      }
    },
    enabled: !!name,
  });
}

export function useDomainOffers(tokenId: string, limit = 20) {
  return useInfiniteQuery({
    queryKey: ['domain-offers', tokenId],
    queryFn: async ({ pageParam = 0 }) => {
      try {
        console.debug('[useDomainOffers] fetching', { tokenId, skip: pageParam, take: limit });
        const data = await fetchOffers(tokenId, pageParam, limit);
        return data;
      } catch (error: any) {
        toast.error('Failed to load offers', { description: error?.message });
        throw error;
      }
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
      try {
        console.debug('[useDomainStats] fetching', tokenId);
        return await fetchNameStatistics(tokenId);
      } catch (error: any) {
        toast.error('Failed to load domain stats', { description: error?.message });
        throw error;
      }
    },
    enabled: !!tokenId,
  });
}
