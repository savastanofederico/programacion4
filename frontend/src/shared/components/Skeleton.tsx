interface SkeletonProps {
  cantidad?: number;
}

export function Skeleton({ cantidad = 6 }: SkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: cantidad }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 animate-pulse"
        >
          <div className="h-44 bg-slate-200 rounded-lg" />
          <div className="h-5 bg-slate-200 rounded w-3/4" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-1/2" />
          <div className="h-9 bg-slate-200 rounded-lg w-full mt-2" />
        </div>
      ))}
    </div>
  );
}
