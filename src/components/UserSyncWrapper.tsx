'use client';

import { useUserSync } from '@/hooks/useUserSync';
import { ReactNode } from 'react';

interface UserSyncWrapperProps {
    children: ReactNode;
}

/**
 * Wrapper component that automatically syncs user profile to database
 * when they connect their wallet via Privy
 */
export function UserSyncWrapper({ children }: UserSyncWrapperProps) {
    const { isSyncing, syncError } = useUserSync();

    // Optionally show a loading state or error
    // For now, we'll just silently sync in the background
    if (syncError) {
        console.error('User sync error:', syncError);
    }

    return <>{children}</>;
}
