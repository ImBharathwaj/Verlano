export default function ProductLoading() {
  return (
    <main className="flex flex-1 flex-col py-12">
      <div className="h-4 w-24 animate-pulse rounded bg-gray-soft/50" />
      <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,1.7fr),minmax(0,1fr)]">
        <div className="animate-pulse space-y-6">
          <div className="aspect-[4/5] rounded-2xl bg-gray-soft/50" />
          <div className="h-4 w-32 rounded bg-gray-soft/40" />
          <div className="h-8 w-48 rounded bg-gray-soft/40" />
          <div className="h-4 w-full rounded bg-gray-soft/30" />
        </div>
        <div className="animate-pulse space-y-4 rounded-2xl border border-gray-soft bg-white p-6">
          <div className="h-4 w-20 rounded bg-gray-soft/40" />
          <div className="h-6 w-3/4 rounded bg-gray-soft/50" />
          <div className="h-4 w-full rounded bg-gray-soft/30" />
          <div className="h-4 w-full rounded bg-gray-soft/30" />
        </div>
      </div>
    </main>
  );
}
