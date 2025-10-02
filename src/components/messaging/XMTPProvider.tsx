'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { Client, type Signer, type Conversation, ConsentState } from '@xmtp/browser-sdk';
import { useWalletClient } from 'wagmi';
import { toBytes } from 'viem';

interface XMTPMessage {
  id: string;
  conversationId: string;
  senderInboxId: string;
  sentAt: Date;
  content: string;
  contentType: string;
}

interface XMTPContextType {
  client: Client | null;
  isLoading: boolean;
  error: string | null;
  initializeClient: () => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  listConversations: () => Promise<Conversation[]>;
  getOrCreateDm: (peerAddress: string) => Promise<Conversation | null>;
  streamMessages: (conversationId: string, onMessage: (message: XMTPMessage) => void) => Promise<void>;
  // Group management
  createGroup: (name: string, description: string, memberAddresses: string[]) => Promise<Conversation | null>;
  addMembersToGroup: (groupId: string, memberAddresses: string[]) => Promise<boolean>;
  removeMembersFromGroup: (groupId: string, memberAddresses: string[]) => Promise<boolean>;
  getGroupById: (groupId: string) => Promise<Conversation | null>;
  listGroups: () => Promise<Conversation[]>;
}

const XMTPContext = createContext<XMTPContextType | null>(null);

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
  const [client, setClient] = useState<Client | null>(null);
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
      console.log('Initializing XMTP client for address:', user.wallet.address);
      
      // Create XMTP Signer from wallet
      const signer: Signer = {
        type: 'EOA',
        getIdentifier: () => ({
          identifier: user.wallet!.address.toLowerCase(),
          identifierKind: 'Ethereum',
        }),
        signMessage: async (message: string): Promise<Uint8Array> => {
          try {
            // Sign the message with the wallet
            const signature = await walletClient.signMessage({
              message,
              account: user.wallet!.address as `0x${string}`,
            });
            // Convert hex signature to Uint8Array
            return toBytes(signature);
          } catch (err) {
            console.error('Failed to sign message:', err);
            throw new Error('Failed to sign message for XMTP');
          }
        },
      };

      // Create XMTP client
      console.log('Creating XMTP client...');
      const xmtpClient = await Client.create(signer, {
        env: 'dev', // Use 'production' for mainnet
      });

      console.log('✅ XMTP client created successfully!');
      console.log('Inbox ID:', xmtpClient.inboxId);
      console.log('Installation ID:', xmtpClient.installationId);

      // Sync conversations
      console.log('Syncing conversations...');
      await xmtpClient.conversations.sync();

      setClient(xmtpClient);
      setError(null);
    } catch (err) {
      console.error('Error initializing XMTP:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize XMTP';
      setError(errorMessage);
      setClient(null);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!client) {
      throw new Error('XMTP client not initialized');
    }

    try {
      const conversation = await client.conversations.getConversationById(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }
      await conversation.send(content);
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    }
  };

  const listConversations = async (): Promise<Conversation[]> => {
    if (!client) {
      console.warn('XMTP client not initialized');
      return [];
    }

    try {
      await client.conversations.sync();
      const conversations = await client.conversations.list({
        consentStates: [ConsentState.Allowed, ConsentState.Unknown],
      });
      return conversations;
    } catch (err) {
      console.error('Failed to list conversations:', err);
      return [];
    }
  };

  const getOrCreateDm = async (peerAddress: string): Promise<Conversation | null> => {
    if (!client) {
      throw new Error('XMTP client not initialized');
    }

    try {
      // First, check if a DM already exists
      const dms = await client.conversations.listDms();
      
      // Check each DM for matching peer address
      for (const dm of dms) {
        const dmMembers = await dm.members();
        const hasPeer = dmMembers.some((member: any) => 
          member.accountIdentifiers.some((id: any) => 
            id.identifier.toLowerCase() === peerAddress.toLowerCase()
          )
        );
        
        if (hasPeer) {
          console.log('Found existing DM:', dm.id);
          return dm;
        }
      }

      // Create new DM
      console.log('Creating new DM with:', peerAddress);
      const newDm = await client.conversations.newDm(peerAddress.toLowerCase());
      return newDm;
    } catch (err) {
      console.error('Failed to get or create DM:', err);
      return null;
    }
  };

  const streamMessages = async (conversationId: string, onMessage: (message: XMTPMessage) => void) => {
    if (!client) {
      throw new Error('XMTP client not initialized');
    }

    try {
      const conversation = await client.conversations.getConversationById(conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Stream all messages from the client
      const stream = await client.conversations.streamAllMessages({
        consentStates: [ConsentState.Allowed, ConsentState.Unknown],
      });
      
      for await (const message of stream) {
        // Filter messages for this conversation only
        if (message.conversationId === conversationId) {
          const xmtpMessage: XMTPMessage = {
            id: message.id,
            conversationId: message.conversationId,
            senderInboxId: message.senderInboxId,
            sentAt: new Date(Number(message.sentAtNs) / 1_000_000), // Convert nanoseconds to milliseconds
            content: message.content as string,
            contentType: message.contentType.typeId,
          };
          onMessage(xmtpMessage);
        }
      }
    } catch (err) {
      console.error('Failed to stream messages:', err);
      throw err;
    }
  };

  const createGroup = async (name: string, description: string, memberAddresses: string[]): Promise<Conversation | null> => {
    if (!client) {
      throw new Error('XMTP client not initialized');
    }

    try {
      console.log('Creating XMTP group:', name);
      
      // Resolve member addresses to inbox IDs
      const inboxIds: string[] = [];
      for (const address of memberAddresses) {
        const canMessage = await client.canMessage([address.toLowerCase() as any]);
        if (canMessage.get(address.toLowerCase())) {
          inboxIds.push(address.toLowerCase());
        }
      }

      if (inboxIds.length === 0) {
        throw new Error('No valid members to add to group');
      }

      // Create group
      const group = await client.conversations.newGroup(inboxIds, {
        name: name,
        description: description,
      });

      console.log('✅ Group created:', group.id);
      return group;
    } catch (err) {
      console.error('Failed to create group:', err);
      return null;
    }
  };

  const addMembersToGroup = async (groupId: string, memberAddresses: string[]): Promise<boolean> => {
    if (!client) {
      throw new Error('XMTP client not initialized');
    }

    try {
      const group = await client.conversations.getConversationById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      // Resolve addresses to inbox IDs
      const inboxIds: string[] = [];
      for (const address of memberAddresses) {
        const canMessage = await client.canMessage([address.toLowerCase() as any]);
        if (canMessage.get(address.toLowerCase())) {
          inboxIds.push(address.toLowerCase());
        }
      }

      if (inboxIds.length > 0) {
        await (group as any).addMembers(inboxIds);
        console.log('✅ Members added to group');
        return true;
      }

      return false;
    } catch (err) {
      console.error('Failed to add members to group:', err);
      return false;
    }
  };

  const removeMembersFromGroup = async (groupId: string, memberAddresses: string[]): Promise<boolean> => {
    if (!client) {
      throw new Error('XMTP client not initialized');
    }

    try {
      const group = await client.conversations.getConversationById(groupId);
      if (!group) {
        throw new Error('Group not found');
      }

      // Resolve addresses to inbox IDs
      const inboxIds: string[] = [];
      for (const address of memberAddresses) {
        inboxIds.push(address.toLowerCase());
      }

      if (inboxIds.length > 0) {
        await (group as any).removeMembers(inboxIds);
        console.log('✅ Members removed from group');
        return true;
      }

      return false;
    } catch (err) {
      console.error('Failed to remove members from group:', err);
      return false;
    }
  };

  const getGroupById = async (groupId: string): Promise<Conversation | null> => {
    if (!client) {
      throw new Error('XMTP client not initialized');
    }

    try {
      const group = await client.conversations.getConversationById(groupId);
      return group || null;
    } catch (err) {
      console.error('Failed to get group:', err);
      return null;
    }
  };

  const listGroups = async (): Promise<Conversation[]> => {
    if (!client) {
      console.warn('XMTP client not initialized');
      return [];
    }

    try {
      await client.conversations.sync();
      const groups = await client.conversations.listGroups({
        consentStates: [ConsentState.Allowed, ConsentState.Unknown],
      });
      return groups;
    } catch (err) {
      console.error('Failed to list groups:', err);
      return [];
    }
  };

  // Auto-initialize when wallet is connected
  useEffect(() => {
    if (authenticated && user?.wallet?.address && walletClient && !client && !isLoading) {
      console.log('Auto-initializing XMTP client...');
      initializeClient();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, user?.wallet?.address, walletClient]);

  const value: XMTPContextType = {
    client,
    isLoading,
    error,
    initializeClient,
    sendMessage,
    listConversations,
    getOrCreateDm,
    streamMessages,
    createGroup,
    addMembersToGroup,
    removeMembersFromGroup,
    getGroupById,
    listGroups,
  };

  return (
    <XMTPContext.Provider value={value}>
      {children}
    </XMTPContext.Provider>
  );
}
