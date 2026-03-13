export default function ShopLoading() {
  return (
    <main className="flex flex-1 flex-col py-16">
      <div className="animate-pulse space-y-10">
        <section className="rounded-3xl border border-gray-soft bg-white px-6 py-8 sm:px-10 sm:py-10">
          <div className="h-4 w-24 rounded bg-gray-soft/60" />
          <div className="mt-4 h-8 w-48 rounded bg-gray-soft/60" />
          <div className="mt-2 h-4 max-w-md rounded bg-gray-soft/40" />
          <div className="mt-6 flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-20 rounded-full bg-gray-soft/50" />
            ))}
          </div>
        </section>
        <section className="space-y-4">
          <div className="h-10 w-full max-w-xs rounded-2xl bg-gray-soft/40" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[4/5] rounded-2xl bg-gray-soft/50" />
                <div className="h-3 w-3/4 rounded bg-gray-soft/40" />
                <div className="h-4 w-1/2 rounded bg-gray-soft/40" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
