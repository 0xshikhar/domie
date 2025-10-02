'use client';

import { useState, useEffect, useRef } from 'react';
import { useXMTP } from '@/components/messaging/XMTPProvider';
import { getGroupMessages, streamGroupMessages, GroupMessage } from '@/lib/xmtp/groups';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Send, Users, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatEther } from 'viem';

interface DealRoomProps {
  dealId: string;
  xmtpGroupId: string;
  dealName: string;
  targetPrice: string;
  currentAmount: string;
  participants: Array<{
    id: string;
    walletAddress: string;
    contribution: string;
    sharePercentage: number;
  }>;
  status: string;
  endDate: Date;
}

export function DealRoom({
  dealId,
  xmtpGroupId,
  dealName,
  targetPrice,
  currentAmount,
  participants,
  status,
  endDate,
}: DealRoomProps) {
  const { client, sendMessage: xmtpSendMessage } = useXMTP();
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Calculate progress
  const progress = (parseFloat(currentAmount) / parseFloat(targetPrice)) * 100;
  const timeRemaining = formatDistanceToNow(endDate, { addSuffix: true });

  // Load messages on mount
  useEffect(() => {
    if (!client || !xmtpGroupId) return;

    const loadMessages = async () => {
      setIsLoading(true);
      try {
        const groupMessages = await getGroupMessages(client, xmtpGroupId, 100);
        setMessages(groupMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [client, xmtpGroupId]);

  // Stream new messages
  useEffect(() => {
    if (!client || !xmtpGroupId) return;

    let cleanup: (() => void) | undefined;

    const startStream = async () => {
      cleanup = await streamGroupMessages(client, xmtpGroupId, (message) => {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      });
    };

    startStream();

    return () => {
      if (cleanup) cleanup();
    };
  }, [client, xmtpGroupId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !client || !xmtpGroupId || isSending) return;

    setIsSending(true);
    try {
      await xmtpSendMessage(xmtpGroupId, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-blue-500';
      case 'FUNDED':
        return 'bg-green-500';
      case 'COMPLETED':
        return 'bg-purple-500';
      case 'CANCELLED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Chat Area */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">{dealName}</CardTitle>
              <Badge className={getStatusColor(status)}>{status}</Badge>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold">
                  {currentAmount} / {targetPrice} ETH
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{progress.toFixed(1)}% funded</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeRemaining}
                </span>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            {/* Messages */}
            <ScrollArea className="h-[500px] p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">Loading messages...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isSystem = message.content.includes('🎉') || 
                                    message.content.includes('👋') || 
                                    message.content.includes('✅');
                    
                    return (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${isSystem ? 'justify-center' : ''}`}
                      >
                        {!isSystem && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {message.senderAddress?.slice(2, 4).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`flex-1 ${isSystem ? 'text-center' : ''}`}>
                          {!isSystem && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">
                                {formatAddress(message.senderAddress || message.senderInboxId)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(message.sentAt, { addSuffix: true })}
                              </span>
                            </div>
                          )}
                          <div
                            className={`${
                              isSystem
                                ? 'inline-block bg-muted px-4 py-2 rounded-lg text-sm'
                                : 'bg-secondary p-3 rounded-lg'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSending || !client}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending || !client}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              {!client && (
                <p className="text-xs text-muted-foreground mt-2">
                  XMTP not connected. Messages will be sent once connected.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Participants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Participants ({participants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {participant.walletAddress.slice(2, 4).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {formatAddress(participant.walletAddress)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {participant.contribution} ETH
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {participant.sharePercentage.toFixed(1)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Deal Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Deal Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Target Price</span>
              <span className="font-semibold">{targetPrice} ETH</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Current Amount</span>
              <span className="font-semibold">{currentAmount} ETH</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Remaining</span>
              <span className="font-semibold">
                {(parseFloat(targetPrice) - parseFloat(currentAmount)).toFixed(4)} ETH
              </span>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Participants</span>
              <span className="font-semibold">{participants.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge className={getStatusColor(status)}>{status}</Badge>
            </div>
            {status === 'FUNDED' && (
              <div className="mt-4 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Target Reached!</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ready to purchase the domain
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
