'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Search } from 'lucide-react';
import { useXMTP } from '@/components/messaging/XMTPProvider';
import { usePrivy } from '@privy-io/react-auth';
import TradeCard from '@/components/messaging/TradeCard';

interface Conversation {
  id: string;
  peerAddress: string;
  peerName?: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
}

interface Message {
  id: string;
  content: string;
  senderAddress: string;
  timestamp: Date;
  isTradeCard?: boolean;
  tradeCardData?: any;
}

// Mock data
const mockConversations: Conversation[] = [
  {
    id: '1',
    peerAddress: '0x1234...5678',
    peerName: 'alice.doma',
    lastMessage: 'Interested in buying alice.doma?',
    timestamp: new Date(Date.now() - 3600000),
    unread: 2,
  },
  {
    id: '2',
    peerAddress: '0x2345...6789',
    peerName: 'bob.doma',
    lastMessage: 'Thanks for the offer!',
    timestamp: new Date(Date.now() - 7200000),
    unread: 0,
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Hi, I\'m interested in alice.doma',
    senderAddress: '0x9999...9999',
    timestamp: new Date(Date.now() - 7200000),
  },
  {
    id: '2',
    content: 'Great! Here\'s the listing',
    senderAddress: '0x1234...5678',
    timestamp: new Date(Date.now() - 7000000),
  },
  {
    id: '3',
    content: '{"type":"trade_card","domainName":"alice.doma","tokenId":"123","price":"2.5","currency":"ETH","action":"buy"}',
    senderAddress: '0x1234...5678',
    timestamp: new Date(Date.now() - 6800000),
    isTradeCard: true,
    tradeCardData: {
      domainName: 'alice.doma',
      tokenId: '123',
      price: '2.5',
      currency: 'ETH',
      action: 'buy',
    },
  },
  {
    id: '4',
    content: 'Would you accept 2.2 ETH?',
    senderAddress: '0x9999...9999',
    timestamp: new Date(Date.now() - 3600000),
  },
];

export default function MessagesPage() {
  const { client, isLoading } = useXMTP();
  const { authenticated, login, user } = usePrivy();
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
    mockConversations[0]
  );
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      senderAddress: user?.wallet?.address || '0x9999...9999',
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // TODO: Send via XMTP
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor(diff / 60000);

    if (hours < 1) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <h2 className="text-2xl font-bold mb-2">Connect to Message</h2>
              <p className="text-muted-foreground">
                Connect your wallet to start messaging with domain owners
              </p>
            </div>
            <Button onClick={login} size="lg">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex">
      {/* Conversations List */}
      <div className="w-80 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedConversation?.id === conv.id ? 'bg-muted' : ''
              }`}
              onClick={() => setSelectedConversation(conv)}
            >
              <div className="flex justify-between items-start mb-1">
                <p className="font-semibold">{conv.peerName || conv.peerAddress}</p>
                {conv.unread > 0 && (
                  <Badge variant="default" className="h-5 px-2">
                    {conv.unread}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
              <p className="text-xs text-muted-foreground mt-1">{formatTime(conv.timestamp)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h3 className="font-semibold">
                  {selectedConversation.peerName || selectedConversation.peerAddress}
                </h3>
                <p className="text-xs text-muted-foreground">{selectedConversation.peerAddress}</p>
              </div>
              <Button variant="outline" size="sm">
                View Profile
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isOwn = message.senderAddress === user?.wallet?.address;

                return (
                  <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                      {message.isTradeCard && message.tradeCardData ? (
                        <TradeCard data={message.tradeCardData} />
                      ) : (
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            isOwn
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p>{message.content}</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
