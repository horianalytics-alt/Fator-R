import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  variant: 'card' | 'list' | 'detail';
}

export function LoadingSkeleton({ variant }: LoadingSkeletonProps) {
  if (variant === 'card') {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col space-y-3 rounded-xl border p-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-24 w-full rounded-md" />
            <div className="flex space-x-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center space-x-4 border-b pb-4 last:border-0">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
            <Skeleton className="h-8 w-16 rounded-md hidden sm:block" />
          </div>
        ))}
      </div>
    );
  }

  // detail variant
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-2/3 max-w-md" />
        <Skeleton className="h-4 w-1/3 max-w-sm" />
      </div>
      <div className="flex items-center space-x-4 py-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
