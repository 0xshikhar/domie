'use client';

import { Client } from '@xmtp/browser-sdk';
import { createDealGroup, addParticipantToGroup, sendMilestoneNotification } from './groups';

/**
 * Create XMTP group when a new deal is created
 */
export async function createDealGroupOnCreation(
  client: Client,
  dealId: string,
  dealName: string,
  targetPrice: string,
  creatorAddress: string
): Promise<string | null> {
  try {
    const group = await createDealGroup(client, {
      dealId,
      dealName,
      targetPrice,
      creatorAddress,
    });

    if (!group) {
      console.error('Failed to create XMTP group for deal');
      return null;
    }

    // Store group ID in database
    // TODO: Call API to update deal with xmtpGroupId
    await fetch(`/api/deals/${dealId}/xmtp-group`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ xmtpGroupId: group.id }),
    }).catch(err => console.error('Failed to save group ID:', err));

    return group.id;
  } catch (error) {
    console.error('Error creating deal group:', error);
    return null;
  }
}

/**
 * Add participant to XMTP group when they contribute
 */
export async function addParticipantOnContribution(
  client: Client,
  dealId: string,
  xmtpGroupId: string,
  participantAddress: string,
  contribution: string,
  currentAmount: string,
  targetPrice: string
): Promise<boolean> {
  try {
    // Add participant to group
    const success = await addParticipantToGroup(
      client,
      xmtpGroupId,
      participantAddress,
      contribution
    );

    if (!success) {
      console.error('Failed to add participant to group');
      return false;
    }

    // Check if target reached
    const current = parseFloat(currentAmount);
    const target = parseFloat(targetPrice);
    const progress = (current / target) * 100;

    // Send milestone notifications
    if (progress >= 100) {
      await sendMilestoneNotification(client, xmtpGroupId, 'funded', {
        targetPrice,
        domainName: '', // TODO: Pass domain name
      });
    } else if (progress >= 75) {
      await client.conversations.getConversationById(xmtpGroupId).then(group => {
        if (group) {
          group.send(`🎯 **75% Funded!**\n\nWe're almost there! ${currentAmount}/${targetPrice} ETH raised`);
        }
      });
    } else if (progress >= 50) {
      await client.conversations.getConversationById(xmtpGroupId).then(group => {
        if (group) {
          group.send(`🎯 **Halfway There!**\n\nWe've reached 50% of our target! ${currentAmount}/${targetPrice} ETH raised`);
        }
      });
    } else if (progress >= 25) {
      await client.conversations.getConversationById(xmtpGroupId).then(group => {
        if (group) {
          group.send(`🚀 **25% Funded!**\n\nGreat start! ${currentAmount}/${targetPrice} ETH raised`);
        }
      });
    }

    return true;
  } catch (error) {
    console.error('Error adding participant:', error);
    return false;
  }
}

/**
 * Send notification when domain is purchased
 */
export async function notifyDomainPurchased(
  client: Client,
  xmtpGroupId: string,
  domainName: string,
  tokenId: string
): Promise<boolean> {
  try {
    return await sendMilestoneNotification(client, xmtpGroupId, 'purchased', {
      domainName,
      tokenId,
    });
  } catch (error) {
    console.error('Error sending purchase notification:', error);
    return false;
  }
}

/**
 * Send notification when fractional tokens are distributed
 */
export async function notifyTokensDistributed(
  client: Client,
  xmtpGroupId: string,
  domainName: string
): Promise<boolean> {
  try {
    return await sendMilestoneNotification(client, xmtpGroupId, 'distributed', {
      domainName,
    });
  } catch (error) {
    console.error('Error sending distribution notification:', error);
    return false;
  }
}

/**
 * Helper to get or create deal group
 */
export async function getOrCreateDealGroup(
  client: Client,
  dealId: string,
  dealName: string,
  targetPrice: string,
  creatorAddress: string,
  existingGroupId?: string
): Promise<string | null> {
  // If group already exists, return it
  if (existingGroupId) {
    try {
      const group = await client.conversations.getConversationById(existingGroupId);
      if (group) return existingGroupId;
    } catch (error) {
      console.error('Existing group not found, creating new one');
    }
  }

  // Create new group
  return await createDealGroupOnCreation(
    client,
    dealId,
    dealName,
    targetPrice,
    creatorAddress
  );
}
