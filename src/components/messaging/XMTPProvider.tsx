'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Client } from '@xmtp/browser-sdk';
import { useWalletClient } from 'wagmi';

interface XMTPClient {
  address: string;
  conversations: any[];
  sendMessage?: (peerAddress: string, content: string) => Promise<void>;
  listConversations?: () => Promise<any[]>;
  getMessages?: (peerAddress: string) => Promise<any[]>;
  client?: Client;
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
  const { data: walletClient } = useWalletClient();
  const [client, setClient] = useState<XMTPClient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeClient = async () => {
    if (!authenticated || !user?.wallet?.address) {
      setError('User not authenticated');
      return;
    }

    if (!walletClient) {
      setError('Wallet client not available');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Initializing XMTP client...');
      
      // Note: XMTP browser SDK requires a signer, but for now we'll provide a simplified implementation
      // In production, you'd need to properly integrate with the wallet signer
      // For demonstration, create a wrapper with the required functionality
      
      const clientWrapper: XMTPClient = {
        address: user.wallet.address,
        conversations: [],
        
        // Helper to send a message
        sendMessage: async (peerAddress: string, content: string) => {
          try {
            console.log(`Sending message to ${peerAddress}:`, content);
            // TODO: Implement actual XMTP message sending
            // This requires proper signer setup with the wallet
            // const conversation = await xmtpClient.conversations.newConversation(peerAddress);
            // await conversation.send(content);
          } catch (err) {
            console.error('Failed to send message:', err);
            throw err;
          }
        },
        
        // Helper to list conversations
        listConversations: async () => {
          try {
            // TODO: Implement actual conversation listing
            // const convos = await xmtpClient.conversations.list();
            console.log('Listing conversations...');
            return [];
          } catch (err) {
            console.error('Failed to list conversations:', err);
            return [];
          }
        },
        
        // Helper to get messages from a conversation
        getMessages: async (peerAddress: string) => {
          try {
            // TODO: Implement actual message fetching
            // const conversation = await xmtpClient.conversations.newConversation(peerAddress);
            // const messages = await conversation.messages();
            console.log(`Getting messages from ${peerAddress}...`);
            return [];
          } catch (err) {
            console.error('Failed to get messages:', err);
            return [];
          }
        },
      };
      
      setClient(clientWrapper);
      console.log('XMTP client wrapper initialized (requires proper signer setup for full functionality)');
    } catch (err) {
      console.error('Error initializing XMTP:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize XMTP');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated && user?.wallet?.address && walletClient && !client) {
      initializeClient();
    }
  }, [authenticated, user?.wallet?.address, walletClient]);

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
