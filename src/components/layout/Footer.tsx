export function Footer() {
  return (
    <footer className="border-t border-gray-soft bg-ink text-gray-soft">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-xs">
        <span>© {new Date().getFullYear()} Verlano. All rights reserved.</span>
        <span className="uppercase tracking-[0.25em] text-gray-soft/80">
          Luxury within reach
        </span>
      </div>
    </footer>
  );
}


