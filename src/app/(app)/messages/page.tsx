'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Search, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useXMTP } from '@/components/messaging/XMTPProvider';
import { usePrivy } from '@privy-io/react-auth';
import TradeCard from '@/components/messaging/TradeCard';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createTransactionReceipt } from '@/lib/xmtp/trading';
import { parseTradeCardMessage, isTradeCardMessage } from '@/lib/xmtp/client';

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

// Storage keys
const CONVERSATIONS_STORAGE_KEY = 'doma_conversations';
const MESSAGES_STORAGE_KEY = 'doma_messages';

// Loading skeleton component
function MessagesSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <Card>
            <CardContent className="p-4 space-y-4">
              <Skeleton className="h-10 w-full" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-0">
              <div className="p-4 border-b">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-32 mt-1" />
              </div>
              <div className="p-4 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className={`h-16 ${i % 2 === 0 ? 'w-48' : 'w-32'}`} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Helper functions for localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
    return defaultValue;
  }
};

const saveToStorage = (key: string, value: any) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

// Component that uses useSearchParams
function MessagesContent() {
  const searchParams = useSearchParams();
  const peerAddress = searchParams.get('peer');
  const tradeCardParam = searchParams.get('tradeCard');
  const { 
    client, 
    isLoading: xmtpLoading, 
    error: xmtpError,
    sendMessage: xmtpSendMessage,
    getOrCreateDm 
  } = useXMTP();
  const { authenticated, login, user } = usePrivy();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [selectedXmtpConv, setSelectedXmtpConv] = useState<any>(null); // XMTP conversation object
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const [tradeCardSent, setTradeCardSent] = useState(false);

  // Load conversations and messages from localStorage on mount
  useEffect(() => {
    if (authenticated && !isInitialized) {
      const storedConversations = loadFromStorage<Conversation[]>(CONVERSATIONS_STORAGE_KEY, []);
      const storedMessages = loadFromStorage<Record<string, Message[]>>(MESSAGES_STORAGE_KEY, {});
      
      setConversations(storedConversations);
      
      // If there are stored conversations, select the first one
      if (storedConversations.length > 0) {
        const firstConv = storedConversations[0];
        setSelectedConversation(firstConv);
        setMessages(storedMessages[firstConv.id] || []);
      }
      
      setIsInitialized(true);
    }
  }, [authenticated, isInitialized]);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (isInitialized && conversations.length > 0) {
      saveToStorage(CONVERSATIONS_STORAGE_KEY, conversations);
    }
  }, [conversations, isInitialized]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (isInitialized && selectedConversation && messages.length > 0) {
      const allMessages = loadFromStorage<Record<string, Message[]>>(MESSAGES_STORAGE_KEY, {});
      allMessages[selectedConversation.id] = messages;
      saveToStorage(MESSAGES_STORAGE_KEY, allMessages);
    }
  }, [messages, selectedConversation, isInitialized]);

  // Handle opening conversation with specific peer from URL
  useEffect(() => {
    const initConversation = async () => {
      if (peerAddress && authenticated && isInitialized && client) {
        // Check if conversation already exists
        const existingConv = conversations.find(c => c.peerAddress.toLowerCase() === peerAddress.toLowerCase());
        
        if (existingConv) {
          setSelectedConversation(existingConv);
          // Load messages for this conversation
          const allMessages = loadFromStorage<Record<string, Message[]>>(MESSAGES_STORAGE_KEY, {});
          setMessages(allMessages[existingConv.id] || []);
          
          // Try to get XMTP conversation
          try {
            const xmtpConv = await getOrCreateDm(peerAddress);
            setSelectedXmtpConv(xmtpConv);
          } catch (err) {
            console.error('Failed to get XMTP conversation:', err);
          }
          
          toast.success('Conversation loaded');
        } else {
          // Try to create XMTP DM first
          try {
            const xmtpConv = await getOrCreateDm(peerAddress);
            
            // Create new local conversation
            const newConv: Conversation = {
              id: xmtpConv?.id || Date.now().toString(),
              peerAddress,
              peerName: peerAddress.slice(0, 10) + '...',
              lastMessage: 'New conversation',
              timestamp: new Date(),
              unread: 0,
            };
            const updatedConversations = [newConv, ...conversations];
            setConversations(updatedConversations);
            setSelectedConversation(newConv);
            setSelectedXmtpConv(xmtpConv);
            setMessages([]);
            toast.success('Started new conversation');
          } catch (err) {
            console.error('Failed to create XMTP conversation:', err);
            // Fall back to local-only conversation
            const newConv: Conversation = {
              id: Date.now().toString(),
              peerAddress,
              peerName: peerAddress.slice(0, 10) + '...',
              lastMessage: 'New conversation',
              timestamp: new Date(),
              unread: 0,
            };
            const updatedConversations = [newConv, ...conversations];
            setConversations(updatedConversations);
            setSelectedConversation(newConv);
            setMessages([]);
            toast.info('Started local conversation (XMTP unavailable)');
          }
        }
      }
    };

    initConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [peerAddress, authenticated, isInitialized, client]);

  // Auto-send trade card if provided in URL
  useEffect(() => {
    const sendTradeCard = async () => {
      if (tradeCardParam && selectedConversation && !tradeCardSent && isInitialized) {
        try {
          const decodedTradeCard = decodeURIComponent(tradeCardParam);
          
          // Parse trade card to get data
          const tradeCardData = parseTradeCardMessage(decodedTradeCard);
          
          if (tradeCardData && isTradeCardMessage(decodedTradeCard)) {
            // Create message with trade card
            const tradeCardMessage: Message = {
              id: Date.now().toString(),
              content: decodedTradeCard,
              senderAddress: user?.wallet?.address || 'unknown',
              timestamp: new Date(),
              isTradeCard: true,
              tradeCardData,
            };

            // Add to messages
            const updatedMessages = [...messages, tradeCardMessage];
            setMessages(updatedMessages);

            // Update conversation
            const updatedConversations = conversations.map(conv =>
              conv.id === selectedConversation.id
                ? { ...conv, lastMessage: `Trade card: ${tradeCardData.domainName}`, timestamp: new Date() }
                : conv
            );
            setConversations(updatedConversations);

            // Send via XMTP
            if (client && selectedXmtpConv) {
              try {
                await xmtpSendMessage(selectedXmtpConv.id, decodedTradeCard);
                toast.success('Trade card sent!');
              } catch (error) {
                console.error('Failed to send trade card via XMTP:', error);
              }
            }

            setTradeCardSent(true);
          }
        } catch (error) {
          console.error('Failed to send trade card:', error);
          toast.error('Failed to send trade card');
        }
      }
    };

    sendTradeCard();
  }, [tradeCardParam, selectedConversation, tradeCardSent, isInitialized, messages, conversations, client, selectedXmtpConv, xmtpSendMessage, user]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      senderAddress: user?.wallet?.address || 'unknown',
      timestamp: new Date(),
    };

    // Optimistically add message to UI
    const updatedMessages = [...messages, message];
    setMessages(updatedMessages);
    
    // Update conversation's last message
    const updatedConversations = conversations.map(conv =>
      conv.id === selectedConversation.id
        ? { ...conv, lastMessage: newMessage, timestamp: new Date() }
        : conv
    );
    setConversations(updatedConversations);
    
    const messageContent = newMessage;
    setNewMessage('');

    // Send via XMTP
    if (client && selectedXmtpConv) {
      try {
        await xmtpSendMessage(selectedXmtpConv.id, messageContent);
        toast.success('Message sent via XMTP');
      } catch (error) {
        console.error('Failed to send message via XMTP:', error);
        toast.error('Failed to send via XMTP, but saved locally');
      }
    } else {
      toast.info('Message saved locally (XMTP not connected)');
    }
  };

  const handleTransactionComplete = async (hash?: string, tradeData?: any) => {
    if (!selectedConversation || !hash) return;

    // Create transaction receipt message
    const receiptContent = createTransactionReceipt(
      tradeData?.action || 'buy',
      tradeData?.domainName || 'Domain',
      tradeData?.price || tradeData?.amount || '0',
      tradeData?.currency || 'ETH',
      hash,
      undefined // explorerUrl will be added by the function
    );

    const receiptMessage: Message = {
      id: Date.now().toString(),
      content: receiptContent,
      senderAddress: user?.wallet?.address || 'unknown',
      timestamp: new Date(),
    };

    // Add receipt to messages
    const updatedMessages = [...messages, receiptMessage];
    setMessages(updatedMessages);

    // Update conversation
    const updatedConversations = conversations.map(conv =>
      conv.id === selectedConversation.id
        ? { ...conv, lastMessage: '✅ Transaction completed', timestamp: new Date() }
        : conv
    );
    setConversations(updatedConversations);

    // Send via XMTP
    if (client && selectedXmtpConv) {
      try {
        await xmtpSendMessage(selectedXmtpConv.id, receiptContent);
      } catch (error) {
        console.error('Failed to send receipt via XMTP:', error);
      }
    }
  };

  const handleConversationSelect = async (conv: Conversation) => {
    setSelectedConversation(conv);
    // Load messages for this conversation
    const allMessages = loadFromStorage<Record<string, Message[]>>(MESSAGES_STORAGE_KEY, {});
    setMessages(allMessages[conv.id] || []);
    
    // Try to get XMTP conversation
    if (client && conv.peerAddress) {
      try {
        const xmtpConv = await getOrCreateDm(conv.peerAddress);
        setSelectedXmtpConv(xmtpConv);
      } catch (err) {
        console.error('Failed to get XMTP conversation:', err);
        setSelectedXmtpConv(null);
      }
    }
    
    // Mark as read
    if (conv.unread > 0) {
      const updatedConversations = conversations.map(c =>
        c.id === conv.id ? { ...c, unread: 0 } : c
      );
      setConversations(updatedConversations);
    }
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor(diff / 60000);

    if (hours < 1) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return dateObj.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv =>
    searchQuery === '' ||
    conv.peerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.peerAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto">
            <Card>
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
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">Messages</h1>
              <p className="text-muted-foreground">
                Chat with domain owners and traders
              </p>
            </div>
            {/* XMTP Status Indicator */}
            <div className="flex items-center gap-2">
              {xmtpLoading ? (
                <Badge variant="outline" className="gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                  Connecting XMTP...
                </Badge>
              ) : client ? (
                <Badge variant="outline" className="gap-2">
                  <Wifi className="h-3 w-3 text-green-500" />
                  XMTP Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-2">
                  <WifiOff className="h-3 w-3 text-muted-foreground" />
                  Local Only
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* XMTP Error Alert */}
        {xmtpError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              XMTP Connection Issue: {xmtpError}. Messages will be saved locally only.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          {/* Conversations Sidebar */}
          <Card>
            <CardContent className="p-0">
              {/* Search */}
              <div className="p-4 border-b">
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
              <div className="max-h-[600px] overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No conversations yet</p>
                    <p className="text-xs mt-1">Start a chat from a domain profile</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedConversation?.id === conv.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => handleConversationSelect(conv)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className="font-semibold truncate">{conv.peerName || conv.peerAddress}</p>
                        {conv.unread > 0 && (
                          <Badge variant="default" className="h-5 px-2 shrink-0 ml-2">
                            {conv.unread}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{conv.lastMessage}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatTime(conv.timestamp)}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card>
            <CardContent className="p-0">
              {selectedConversation ? (
                <div className="flex flex-col h-[700px]">
                  {/* Chat Header */}
                  <div className="p-4 border-b flex justify-between items-center shrink-0">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate">
                        {selectedConversation.peerName || selectedConversation.peerAddress}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">{selectedConversation.peerAddress}</p>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0 ml-4">
                      View Profile
                    </Button>
                  </div>

                  {/* Messages - Fixed height with scroll */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                    {messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>No messages yet</p>
                          <p className="text-sm mt-1">Send a message to start the conversation</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {messages.map((message) => {
                          const isOwn = message.senderAddress === user?.wallet?.address;

                          return (
                            <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                                {message.isTradeCard && message.tradeCardData ? (
                                  <TradeCard 
                                    data={message.tradeCardData}
                                    onTransactionComplete={(hash) => handleTransactionComplete(hash, message.tradeCardData)}
                                  />
                                ) : (
                                  <div
                                    className={`rounded-lg px-4 py-2 ${
                                      isOwn
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted'
                                    }`}
                                  >
                                    <p className="break-words whitespace-pre-wrap">{message.content}</p>
                                  </div>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatTime(message.timestamp)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Message Input - Always visible at bottom */}
                  <div className="p-4 border-t shrink-0 bg-background">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[700px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a conversation to start messaging</p>
                    <p className="text-sm mt-2">or visit a domain profile to start a new chat</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesSkeleton />}>
      <MessagesContent />
    </Suspense>
  );
}
