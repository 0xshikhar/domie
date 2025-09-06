'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePrivy } from '@privy-io/react-auth';

// XMTP types (will be replaced with actual SDK when installed)
interface XMTPClient {
  address: string;
  conversations: any[];
}

interface XMTPContextType {
  client: XMTPClient | null;
  isLoading: boolean;
  error: string | null;
  initializeClient: () => Promise<void>;
}

const XMTPContext = createContext<XMTPContextType>({
  client: null,
  isLoading: false,
  error: null,
  initializeClient: async () => {},
});

export function useXMTP() {
  const context = useContext(XMTPContext);
  if (!context) {
    throw new Error('useXMTP must be used within XMTPProvider');
  }
  return context;
}

interface XMTPProviderProps {
  children: ReactNode;
}

export function XMTPProvider({ children }: XMTPProviderProps) {
  const { user, authenticated } = usePrivy();
  const [client, setClient] = useState<XMTPClient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeClient = async () => {
    if (!authenticated || !user?.wallet?.address) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Initialize XMTP client when SDK is installed
      // const xmtpClient = await Client.create(signer, {
      //   env: process.env.NEXT_PUBLIC_XMTP_ENV as 'dev' | 'production',
      // });
      
      // For now, create a mock client
      const mockClient: XMTPClient = {
        address: user.wallet.address,
        conversations: [],
      };
      
      setClient(mockClient);
      console.log('XMTP client initialized (mock)');
    } catch (err) {
      console.error('Error initializing XMTP:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize XMTP');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated && user?.wallet?.address && !client) {
      initializeClient();
    }
  }, [authenticated, user?.wallet?.address]);

  const value: XMTPContextType = {
    client,
    isLoading,
    error,
    initializeClient,
  };

  return (
    <XMTPContext.Provider value={value}>
      {children}
    </XMTPContext.Provider>
  );
}
