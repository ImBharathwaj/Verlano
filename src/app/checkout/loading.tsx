export default function CheckoutLoading() {
  return (
    <main className="flex flex-1 flex-col py-12">
      <div className="h-8 w-40 animate-pulse rounded bg-gray-soft/50" />
      <div className="mt-6 h-4 w-64 animate-pulse rounded bg-gray-soft/40" />
      <div className="mt-8 grid animate-pulse gap-10 md:grid-cols-[1fr,340px]">
        <div className="h-64 rounded-2xl border border-gray-soft bg-white" />
        <div className="h-48 rounded-2xl border border-gray-soft bg-white" />
      </div>
    </main>
  );
}
