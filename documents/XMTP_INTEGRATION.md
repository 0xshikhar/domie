# XMTP Integration Guide

## Overview

The Domanzo app now has a **fully functional XMTP (Extensible Message Transport Protocol)** integration for decentralized, end-to-end encrypted messaging between wallet addresses.

## What Changed

### 1. **XMTPProvider** (`src/components/messaging/XMTPProvider.tsx`)

Completely rewritten to use the official `@xmtp/browser-sdk`:

#### Key Features:
- ✅ **Proper Wallet Signer Integration**: Uses Privy wallet to sign XMTP messages
- ✅ **Real XMTP Client Creation**: Creates actual XMTP client connected to the network
- ✅ **DM Management**: Create and retrieve direct messages with wallet addresses
- ✅ **Message Sending**: Send actual on-network encrypted messages
- ✅ **Message Streaming**: Stream incoming messages in real-time
- ✅ **Conversation Sync**: Sync conversations from XMTP network
- ✅ **Error Handling**: Graceful fallback to local-only mode if XMTP fails

#### API Methods Exposed:
```typescript
{
  client: Client | null;              // XMTP client instance
  isLoading: boolean;                 // Loading state during init
  error: string | null;               // Error message if any
  initializeClient: () => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  listConversations: () => Promise<Conversation[]>;
  getOrCreateDm: (peerAddress: string) => Promise<Conversation | null>;
  streamMessages: (conversationId: string, onMessage: (message: XMTPMessage) => void) => Promise<void>;
}
```

### 2. **Messages Page** (`src/app/(app)/messages/page.tsx`)

Updated to integrate with real XMTP:

#### Improvements:
- ✅ **Real XMTP Conversations**: Creates actual XMTP DMs when chatting with addresses
- ✅ **Hybrid Storage**: Combines localStorage (for persistence) with XMTP (for real messaging)
- ✅ **XMTP Status Indicators**: Shows connection status (Connected/Connecting/Local Only)
- ✅ **Automatic DM Creation**: Automatically creates XMTP DM when messaging a new address
- ✅ **Graceful Fallback**: If XMTP fails, messages still save locally

## How It Works

### Initialization Flow

1. **User connects wallet** (via Privy)
2. **XMTPProvider automatically initializes**:
   ```typescript
   // Creates signer from wallet
   const signer: Signer = {
     type: 'EOA',
     getIdentifier: () => ({ identifier: walletAddress }),
     signMessage: async (message) => await walletClient.signMessage({ message })
   };
   
   // Creates XMTP client
   const client = await Client.create(signer, { env: 'dev' });
   ```
3. **Client syncs existing conversations**
4. **Ready to send/receive messages**

### Messaging Flow

1. **User visits `/messages?peer=0x123...`**
2. **System checks for existing DM** with that address
3. **If no DM exists**, creates new XMTP DM:
   ```typescript
   const xmtpConv = await getOrCreateDm(peerAddress);
   ```
4. **User types and sends message**
5. **Message is sent via XMTP**:
   ```typescript
   await xmtpSendMessage(conversationId, content);
   ```
6. **Message also saved to localStorage** for persistence
7. **XMTP delivers message** to recipient's XMTP client

### Message Persistence

- **localStorage**: Stores all messages locally for fast loading
- **XMTP Network**: Delivers messages through decentralized network
- **Hybrid Approach**: Best of both worlds - fast UI + real messaging

## XMTP Environment

Currently configured for `dev` environment:

```typescript
const client = await Client.create(signer, {
  env: 'dev', // Use 'production' for mainnet
});
```

### Changing to Production:

In `src/components/messaging/XMTPProvider.tsx`, line 93:
```typescript
env: 'production', // For mainnet XMTP
```

## Testing XMTP

### Prerequisites:
- Two wallet addresses
- Both wallets connected to Domanzo app
- XMTP client successfully initialized (check console logs)

### Test Steps:

1. **User A** visits `/messages?peer=<User B's address>`
2. **Check console** for:
   ```
   Initializing XMTP client for address: 0x...
   Creating XMTP client...
   ✅ XMTP client created successfully!
   Inbox ID: ...
   Installation ID: ...
   Syncing conversations...
   Creating new DM with: 0x...
   ```

3. **Send a message** from User A
4. **Check console** for:
   ```
   Message sent via XMTP
   ```

5. **User B** opens `/messages`
6. **Should see** conversation with User A
7. **Message delivered** via XMTP network

### Debugging:

Check browser console for:
- ✅ XMTP client creation success
- ❌ Any XMTP errors
- 🟢 Connection status

XMTP status badge in UI shows:
- **🟢 XMTP Connected** - Working properly
- **🟡 Connecting XMTP...** - Initializing
- **⚪ Local Only** - XMTP unavailable (fallback mode)

## Known Limitations

1. **Message History**: Only loads messages that were created after XMTP client initialization
2. **Group Chats**: Currently only supports 1-on-1 DMs
3. **Attachments**: Text messages only (can be extended)
4. **Notifications**: No push notifications yet

## Future Enhancements

- [ ] Load historical messages from XMTP network
- [ ] Support group conversations
- [ ] File attachments support
- [ ] Push notifications
- [ ] Message read receipts
- [ ] Typing indicators
- [ ] Message reactions

## Resources

- [XMTP Documentation](https://docs.xmtp.org/)
- [Browser SDK](https://docs.xmtp.org/chat-apps/sdks/browser)
- [XMTP Chat Example](https://xmtp.chat/)

## Dependencies

```json
{
  "@xmtp/browser-sdk": "^4.3.0",
  "@xmtp/content-type-reaction": "^2.0.2",
  "@xmtp/content-type-reply": "^2.0.2",
  "@xmtp/content-type-text": "^2.0.2"
}
```

All dependencies are already installed in the project.

---

## Summary

✅ **XMTP is now fully functional** in Domanzo
✅ **Real decentralized messaging** between wallet addresses
✅ **End-to-end encrypted** conversations
✅ **Persistent storage** with localStorage backup
✅ **Clean UI** with status indicators
✅ **Graceful fallbacks** if network issues occur

The messaging system now provides a **production-ready** foundation for web3 communication in your domain marketplace!
