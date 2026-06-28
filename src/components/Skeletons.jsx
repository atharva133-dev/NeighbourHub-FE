export function PageLoader() {
  return (
    <div className="app-shell flex min-h-screen items-center justify-center px-4">
      <div className="glass-card w-full max-w-md p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="skeleton h-11 w-11 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-36" />
            <div className="skeleton h-3 w-24" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="skeleton h-3 w-full" />
          <div className="skeleton h-3 w-5/6" />
          <div className="skeleton h-3 w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function NoticeListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="glass-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <div className="skeleton h-6 w-20 rounded-full" />
            <div className="skeleton h-6 w-24 rounded-full" />
          </div>
          <div className="skeleton mb-3 h-5 w-2/3" />
          <div className="space-y-2">
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-11/12" />
            <div className="skeleton h-3 w-4/6" />
          </div>
          <div className="mt-5 flex items-center justify-between">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-4 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CommentSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="rounded-lg border border-white/10 bg-white/5 p-3">
          <div className="mb-2 flex justify-between gap-3">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton h-3 w-16" />
          </div>
          <div className="skeleton h-3 w-10/12" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="glass-card p-5">
            <div className="skeleton mb-4 h-4 w-24" />
            <div className="skeleton h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-card p-5">
          <div className="skeleton mb-5 h-5 w-40" />
          <div className="skeleton h-72 w-full" />
        </div>
        <div className="glass-card p-5">
          <div className="skeleton mb-5 h-5 w-40" />
          <div className="skeleton h-72 w-full" />
        </div>
      </div>
    </div>
  );
}
