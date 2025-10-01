'use client';

import { usePrivy } from '@privy-io/react-auth';
import ActivityFeed from '@/components/activity/ActivityFeed';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, User } from 'lucide-react';

export default function ActivityPage() {
  const { authenticated, user } = usePrivy();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold mb-2">Activity Feed</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest marketplace activities
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              All Activity
            </TabsTrigger>
            <TabsTrigger 
              value="my" 
              className="flex items-center gap-2"
              disabled={!authenticated}
            >
              <User className="h-4 w-4" />
              My Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <ActivityFeed showFilters={true} limit={50} />
          </TabsContent>

          <TabsContent value="my" className="mt-6">
            {authenticated && user?.wallet?.address ? (
              <ActivityFeed 
                userId={user.wallet.address} 
                showFilters={true} 
                limit={50} 
              />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Connect Wallet</CardTitle>
                  <CardDescription>
                    Connect your wallet to view your activity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Please connect your wallet to see your personal activity feed.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
