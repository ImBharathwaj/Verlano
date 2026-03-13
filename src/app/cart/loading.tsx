export default function CartLoading() {
  return (
    <main className="flex flex-1 flex-col py-12">
      <div className="h-8 w-32 animate-pulse rounded bg-gray-soft/50" />
      <div className="mt-8 flex animate-pulse gap-8">
        <div className="flex-1 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 rounded-2xl border border-gray-soft bg-white p-4">
              <div className="h-24 w-20 rounded-lg bg-gray-soft/50" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-gray-soft/40" />
                <div className="h-3 w-1/2 rounded bg-gray-soft/30" />
              </div>
            </div>
          ))}
        </div>
        <div className="w-80 rounded-2xl border border-gray-soft bg-white p-6">
          <div className="h-4 w-20 rounded bg-gray-soft/40" />
          <div className="mt-4 h-6 w-24 rounded bg-gray-soft/50" />
        </div>
      </div>
    </main>
  );
}
