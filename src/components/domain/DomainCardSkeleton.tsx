import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DomainCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        {/* Domain Name */}
        <div className="mb-4">
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-5 w-16" />
        </div>

        {/* Price */}
        <div className="mb-4">
          <Skeleton className="h-4 w-12 mb-1" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Stats */}
        <div className="flex justify-between mb-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Status Badge */}
        <Skeleton className="h-6 w-24" />
      </CardContent>
    </Card>
  );
}
