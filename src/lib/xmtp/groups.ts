'use client';

import { Client, Conversation } from '@xmtp/browser-sdk';

export interface DealGroupOptions {
  dealId: string;
  dealName: string;
  targetPrice: string;
  creatorAddress: string;
}

export interface VoteProposal {
  id: string;
  type: 'vote_proposal';
  proposalHash: string;
  title: string;
  description: string;
  options: string[];
  deadline: string;
  requiredThreshold: number;
  createdBy: string;
  createdAt: string;
}

export interface DealUpdate {
  type: 'deal_update';
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface GroupMessage {
  id: string;
  conversationId: string;
  senderInboxId: string;
  senderAddress?: string;
  content: string;
  contentType: string;
  sentAt: Date;
  isSystemMessage?: boolean;
}

/**
 * Create a new XMTP group for a community deal
 */
export async function createDealGroup(
  client: Client,
  options: DealGroupOptions
): Promise<Conversation | null> {
  try {
    console.log('Creating XMTP group for deal:', options.dealId);

    // Get creator's inbox ID
    const creatorInboxId = await getInboxIdFromAddress(client, options.creatorAddress);
    
    if (!creatorInboxId) {
      throw new Error('Could not resolve creator inbox ID');
    }

    // Create group with creator as initial member
    const group = await client.conversations.newGroup([creatorInboxId], {
      name: `Deal: ${options.dealName}`,
      description: `Community deal for ${options.dealName} - Target: ${options.targetPrice} ETH`,
    });

    console.log('✅ Deal group created:', group.id);

    // Send welcome message
    await group.send(
      `🎉 Deal room created for ${options.dealName}!\n\n` +
      `Target: ${options.targetPrice} ETH\n` +
      `Share this deal with others to start pooling funds together!`
    );

    return group;
  } catch (error) {
    console.error('Error creating deal group:', error);
    return null;
  }
}

/**
 * Add a participant to the deal group
 */
export async function addParticipantToGroup(
  client: Client,
  groupId: string,
  participantAddress: string,
  contribution: string
): Promise<boolean> {
  try {
    console.log('Adding participant to group:', participantAddress);

    const group = await client.conversations.getConversationById(groupId);
    
    if (!group) {
      throw new Error('Group not found');
    }

    // Get participant's inbox ID
    const participantInboxId = await getInboxIdFromAddress(client, participantAddress);
    
    if (!participantInboxId) {
      throw new Error('Could not resolve participant inbox ID');
    }

    // Add member to group (cast to any to bypass type check - SDK supports this)
    await (group as any).addMembers([participantInboxId]);

    // Send notification
    const shortAddress = formatAddress(participantAddress);
    await group.send(
      `👋 ${shortAddress} joined and contributed ${contribution} ETH!`
    );

    console.log('✅ Participant added to group');
    return true;
  } catch (error) {
    console.error('Error adding participant:', error);
    return false;
  }
}

/**
 * Remove a participant from the deal group
 */
export async function removeParticipantFromGroup(
  client: Client,
  groupId: string,
  participantAddress: string
): Promise<boolean> {
  try {
    const group = await client.conversations.getConversationById(groupId);
    
    if (!group) {
      throw new Error('Group not found');
    }

    const participantInboxId = await getInboxIdFromAddress(client, participantAddress);
    
    if (!participantInboxId) {
      throw new Error('Could not resolve participant inbox ID');
    }

    await (group as any).removeMembers([participantInboxId]);

    const shortAddress = formatAddress(participantAddress);
    await group.send(`👋 ${shortAddress} left the deal`);

    return true;
  } catch (error) {
    console.error('Error removing participant:', error);
    return false;
  }
}

/**
 * Send an automated deal update to the group
 */
export async function sendDealUpdate(
  client: Client,
  groupId: string,
  message: string,
  metadata?: Record<string, any>
): Promise<boolean> {
  try {
    const group = await client.conversations.getConversationById(groupId);
    
    if (!group) {
      throw new Error('Group not found');
    }

    const update: DealUpdate = {
      type: 'deal_update',
      message,
      timestamp: new Date().toISOString(),
      metadata,
    };

    // Send as text message (can be extended to custom content type)
    await group.send(message);

    return true;
  } catch (error) {
    console.error('Error sending deal update:', error);
    return false;
  }
}

/**
 * Create a vote proposal in the group
 */
export async function createVoteProposal(
  client: Client,
  groupId: string,
  proposal: Omit<VoteProposal, 'type' | 'createdAt'>
): Promise<boolean> {
  try {
    const group = await client.conversations.getConversationById(groupId);
    
    if (!group) {
      throw new Error('Group not found');
    }

    const voteProposal: VoteProposal = {
      ...proposal,
      type: 'vote_proposal',
      createdAt: new Date().toISOString(),
    };

    // Format proposal message
    const proposalMessage = 
      `📊 **New Vote Proposal**\n\n` +
      `**${proposal.title}**\n` +
      `${proposal.description}\n\n` +
      `Options: ${proposal.options.join(' / ')}\n` +
      `Threshold: ${proposal.requiredThreshold}%\n` +
      `Deadline: ${new Date(proposal.deadline).toLocaleString()}\n\n` +
      `Vote on the deal page to participate!`;

    await group.send(proposalMessage);

    return true;
  } catch (error) {
    console.error('Error creating vote proposal:', error);
    return false;
  }
}

/**
 * Get all messages from a group
 */
export async function getGroupMessages(
  client: Client,
  groupId: string,
  limit: number = 50
): Promise<GroupMessage[]> {
  try {
    const group = await client.conversations.getConversationById(groupId);
    
    if (!group) {
      throw new Error('Group not found');
    }

    await group.sync();
    const messages = await group.messages({ limit: BigInt(limit) });

    return messages.map((msg) => ({
      id: msg.id,
      conversationId: msg.conversationId,
      senderInboxId: msg.senderInboxId,
      content: msg.content as string,
      contentType: msg.contentType.typeId,
      sentAt: new Date(Number(msg.sentAtNs) / 1_000_000),
    }));
  } catch (error) {
    console.error('Error fetching group messages:', error);
    return [];
  }
}

/**
 * Stream messages from a group in real-time
 */
export async function streamGroupMessages(
  client: Client,
  groupId: string,
  onMessage: (message: GroupMessage) => void
): Promise<() => void> {
  try {
    const group = await client.conversations.getConversationById(groupId);
    
    if (!group) {
      throw new Error('Group not found');
    }

    // Stream messages (cast to any - SDK supports this for groups)
    const stream = await (group as any).streamMessages();
    
    // Process messages in background
    (async () => {
      for await (const message of stream) {
        const groupMessage: GroupMessage = {
          id: message.id,
          conversationId: message.conversationId,
          senderInboxId: message.senderInboxId,
          content: message.content as string,
          contentType: message.contentType.typeId,
          sentAt: new Date(Number(message.sentAtNs) / 1_000_000),
        };
        onMessage(groupMessage);
      }
    })();

    // Return cleanup function
    return () => {
      // Stream cleanup handled by XMTP SDK
      console.log('Stopped streaming messages for group:', groupId);
    };
  } catch (error) {
    console.error('Error streaming group messages:', error);
    return () => {};
  }
}

/**
 * Get group members
 */
export async function getGroupMembers(
  client: Client,
  groupId: string
): Promise<string[]> {
  try {
    const group = await client.conversations.getConversationById(groupId);
    
    if (!group) {
      throw new Error('Group not found');
    }

    const members = await group.members();
    
    // Extract addresses from members
    const addresses: string[] = [];
    for (const member of members) {
      const accountIds = member.accountIdentifiers || [];
      for (const id of accountIds) {
        if (id.identifier) {
          addresses.push(id.identifier);
        }
      }
    }

    return addresses;
  } catch (error) {
    console.error('Error fetching group members:', error);
    return [];
  }
}

/**
 * Check if user is a member of the group
 */
export async function isGroupMember(
  client: Client,
  groupId: string,
  userAddress: string
): Promise<boolean> {
  try {
    const members = await getGroupMembers(client, groupId);
    return members.some(addr => addr.toLowerCase() === userAddress.toLowerCase());
  } catch (error) {
    console.error('Error checking group membership:', error);
    return false;
  }
}

/**
 * Send automated milestone notifications
 */
export async function sendMilestoneNotification(
  client: Client,
  groupId: string,
  milestone: 'funded' | 'purchased' | 'distributed',
  data: Record<string, any>
): Promise<boolean> {
  const messages = {
    funded: `✅ **Target Reached!**\n\nThe deal is now fully funded at ${data.targetPrice} ETH!\nReady to purchase ${data.domainName}`,
    purchased: `🏆 **Domain Purchased!**\n\n${data.domainName} has been successfully purchased!\nToken ID: ${data.tokenId}\n\nFractional tokens will be distributed shortly.`,
    distributed: `💎 **Tokens Distributed!**\n\nFractional ownership tokens have been distributed to all participants.\nCheck your wallet to see your share of ${data.domainName}!`,
  };

  const message = messages[milestone];
  return sendDealUpdate(client, groupId, message, data);
}

// Helper functions

/**
 * Get inbox ID from Ethereum address
 */
async function getInboxIdFromAddress(
  client: Client,
  address: string
): Promise<string | null> {
  try {
    // Check if address can be resolved to inbox ID
    // This requires the address to be registered with XMTP
    const canMessage = await client.canMessage([address as any]);
    
    if (canMessage.get(address)) {
      // Return the address - XMTP will resolve it
      return address;
    }

    // If not found, return the address itself (XMTP will try to resolve)
    return address;
  } catch (error) {
    console.error('Error resolving inbox ID:', error);
    return address; // Fallback to address
  }
}

/**
 * Format Ethereum address for display
 */
function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Parse message content to check if it's a special message type
 */
export function parseMessageContent(content: string): {
  type: 'text' | 'vote_proposal' | 'deal_update';
  data: any;
} {
  try {
    const parsed = JSON.parse(content);
    if (parsed.type === 'vote_proposal' || parsed.type === 'deal_update') {
      return { type: parsed.type, data: parsed };
    }
  } catch {
    // Not JSON, treat as text
  }
  
  return { type: 'text', data: content };
}
