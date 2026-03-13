export function Footer() {
  return (
    <footer className="border-t border-gray-soft bg-ink text-gray-soft">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 text-xs sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <span className="block text-[11px] uppercase tracking-[0.24em] text-gray-soft/80">
            Verlano
          </span>
          <p className="max-w-xs text-[11px] text-gray-soft/80">
            Curated surplus from premium labels. Minimal, considered, and
            designed to live in your wardrobe for years.
          </p>
          <span className="block text-[11px] text-gray-soft/60">
            © {new Date().getFullYear()} Verlano. All rights reserved.
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-6 sm:flex-row sm:justify-end">
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-soft/80">
              Info
            </p>
            <nav className="flex flex-col gap-1">
              <a href="/about" className="text-[11px] text-gray-soft/80 hover:text-white">
                About
              </a>
              <a href="/shipping" className="text-[11px] text-gray-soft/80 hover:text-white">
                Shipping
              </a>
              <a href="/returns" className="text-[11px] text-gray-soft/80 hover:text-white">
                Returns
              </a>
              <a href="/contact" className="text-[11px] text-gray-soft/80 hover:text-white">
                Contact
              </a>
              <a href="/track-order" className="text-[11px] text-gray-soft/80 hover:text-white">
                Track order
              </a>
              <a href="/saved" className="text-[11px] text-gray-soft/80 hover:text-white">
                Saved
              </a>
            </nav>
          </div>
          <div className="space-y-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-soft/80">
              Follow
            </p>
            <div className="flex gap-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-soft/50 text-[10px] text-gray-soft/80">
                IG
              </span>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-soft/50 text-[10px] text-gray-soft/80">
                IN
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


