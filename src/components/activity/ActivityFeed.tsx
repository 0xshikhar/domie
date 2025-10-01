'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, ShoppingCart, MessageSquare, Users, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface Activity {
  id: string;
  type: 'DOMAIN_LISTED' | 'DOMAIN_SOLD' | 'OFFER_MADE' | 'DEAL_CREATED' | 'DEAL_FUNDED';
  title: string;
  description: string | null;
  createdAt: string;
  userId: string | null;
  domainId: string | null;
  domain?: {
    name: string;
    price: string | null;
    currency: string;
  };
}

interface ActivityFeedProps {
  userId?: string;
  domainId?: string;
  limit?: number;
  showFilters?: boolean;
}

const activityIcons = {
  DOMAIN_LISTED: ShoppingCart,
  DOMAIN_SOLD: TrendingUp,
  OFFER_MADE: MessageSquare,
  DEAL_CREATED: Users,
  DEAL_FUNDED: Users,
};

const activityColors = {
  DOMAIN_LISTED: 'text-blue-500',
  DOMAIN_SOLD: 'text-green-500',
  OFFER_MADE: 'text-yellow-500',
  DEAL_CREATED: 'text-purple-500',
  DEAL_FUNDED: 'text-emerald-500',
};

export default function ActivityFeed({ userId, domainId, limit = 20, showFilters = true }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (userId) params.append('userId', userId);
        if (domainId) params.append('domainId', domainId);
        if (filter !== 'all') params.append('type', filter);
        params.append('limit', limit.toString());

        const response = await fetch(`/api/activity?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch activities');
        
        const data = await response.json();
        setActivities(data.activities || []);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [userId, domainId, filter, limit]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
          <CardDescription>Loading recent activities...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Activity Feed</CardTitle>
            <CardDescription>Recent marketplace activities</CardDescription>
          </div>
          {showFilters && (
            <Filter className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <Tabs value={filter} onValueChange={setFilter} className="mb-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="DOMAIN_LISTED">Listed</TabsTrigger>
              <TabsTrigger value="DOMAIN_SOLD">Sold</TabsTrigger>
              <TabsTrigger value="OFFER_MADE">Offers</TabsTrigger>
              <TabsTrigger value="DEAL_CREATED">Deals</TabsTrigger>
              <TabsTrigger value="DEAL_FUNDED">Funded</TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No activities yet</p>
            </div>
          ) : (
            activities.map((activity) => {
              const Icon = activityIcons[activity.type];
              const colorClass = activityColors[activity.type];

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className={`h-10 w-10 rounded-full bg-muted flex items-center justify-center ${colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm">{activity.title}</p>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.description}
                          </p>
                        )}
                        {activity.domain && (
                          <Link
                            href={`/domain/${activity.domain.name}`}
                            className="text-sm text-primary hover:underline mt-2 inline-block"
                          >
                            {activity.domain.name}
                          </Link>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs whitespace-nowrap">
                        {activity.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
