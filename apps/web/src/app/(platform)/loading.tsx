function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-white/10 ${className}`} />
  );
}

export default function PlatformLoading() {
  return (
    <div className="mx-auto max-w-6xl">
      <section className="overflow-hidden rounded-[2rem] border border-white/15 bg-gradient-to-br from-indigo-950/70 via-violet-950/60 to-fuchsia-900/35 p-6 shadow-2xl shadow-indigo-950/30 md:p-9">
        <SkeletonBlock className="h-4 w-32 bg-violet-200/20" />
        <SkeletonBlock className="mt-4 h-10 w-72" />
        <SkeletonBlock className="mt-4 h-4 w-full max-w-xl" />
        <SkeletonBlock className="mt-2 h-4 w-3/5" />
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-white/15 bg-white/10 p-5 shadow-xl shadow-indigo-950/10 backdrop-blur"
          >
            <SkeletonBlock className="h-4 w-28 bg-indigo-100/15" />
            <SkeletonBlock className="mt-4 h-8 w-36" />
            <SkeletonBlock className="mt-5 h-10 w-full" />
          </div>
        ))}
      </section>

      <section className="mt-12">
        <div className="mb-5 flex items-center justify-between gap-4">
          <SkeletonBlock className="h-7 w-40" />
          <SkeletonBlock className="h-4 w-24" />
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="rounded-3xl border border-white/10 bg-white/[0.06] p-5"
            >
              <SkeletonBlock className="h-5 w-3/4" />
              <SkeletonBlock className="mt-4 h-4 w-full" />
              <SkeletonBlock className="mt-2 h-4 w-4/5" />
              <div className="mt-5 flex gap-2">
                <SkeletonBlock className="h-7 w-20 rounded-full" />
                <SkeletonBlock className="h-7 w-24 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
