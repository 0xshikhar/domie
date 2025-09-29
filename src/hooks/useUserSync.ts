import { useEffect, useRef, useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

export function useUserSync() {
    const { authenticated, user, ready } = usePrivy();
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);
    const hasSyncedRef = useRef(false);

    useEffect(() => {
        const syncUser = async () => {
            // Only sync if:
            // 1. Privy is ready
            // 2. User is authenticated
            // 3. We have a wallet address
            // 4. We haven't synced yet in this session
            if (!ready || !authenticated || !user?.wallet?.address || hasSyncedRef.current) {
                return;
            }

            setIsSyncing(true);
            setSyncError(null);

            try {
                const response = await fetch('/api/user/sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        walletAddress: user.wallet.address,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to sync user profile');
                }

                const data = await response.json();
                
                if (data.created) {
                    console.log('✅ New user profile created');
                } else {
                    console.log('✅ User profile synced');
                }

                hasSyncedRef.current = true;
            } catch (error) {
                console.error('Error syncing user:', error);
                setSyncError(error instanceof Error ? error.message : 'Failed to sync user');
            } finally {
                setIsSyncing(false);
            }
        };

        syncUser();
    }, [ready, authenticated, user?.wallet?.address]);

    // Reset sync flag when user logs out
    useEffect(() => {
        if (!authenticated) {
            hasSyncedRef.current = false;
        }
    }, [authenticated]);

    return {
        isSyncing,
        syncError,
    };
}
