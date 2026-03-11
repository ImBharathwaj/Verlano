export default function AccountPage() {
  return (
    <main className="flex flex-1 flex-col py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Your account</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Sign-in, orders and saved details will live here.
      </p>
      <div className="mt-8 rounded-2xl border border-dashed border-zinc-200 bg-white/40 p-10 text-sm text-zinc-500">
        Authentication and account management will be implemented in a later
        phase.
      </div>
    </main>
  );
}

