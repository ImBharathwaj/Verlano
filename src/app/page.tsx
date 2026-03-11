export default function Home() {
  return (
    <main className="flex flex-1 flex-col justify-center py-20">
      <section className="rounded-3xl border border-gray-soft bg-white/80 px-10 py-14 shadow-sm">
        <div className="space-y-6">
          <p className="text-sm uppercase tracking-[0.3em] text-gray-deep/70">
            Verlano
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Luxury surplus fashion,
            <br />
            <span className="text-gray-deep/80">at insider prices.</span>
          </h1>
          <p className="max-w-xl text-base text-gray-deep/80">
            Curated surplus garments from premium brands in India. Minimal,
            elegant, and accessible – designed for young professionals and
            students who refuse to compromise on style.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/shop"
              className="rounded-full bg-ink px-6 py-2 text-sm font-medium text-white transition hover:bg-ink/90"
            >
              Browse collection
            </a>
            <a
              href="/account"
              className="rounded-full border border-ink px-6 py-2 text-sm font-medium text-ink transition hover:bg-gray-soft/60"
            >
              Sign in
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
