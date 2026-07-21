'use client'

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card/60 backdrop-blur-sm py-3 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p
          className="text-[10px] font-bold tracking-widest uppercase"
          style={{ color: 'var(--muted-foreground)' }}
        >
          RotomDex © 2026 &bull; Under License of Silph Co.
        </p>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span
            className="text-[10px] font-bold tracking-widest uppercase"
            style={{ color: 'var(--muted-foreground)' }}
          >
            All Channels Online
          </span>
        </div>
      </div>
    </footer>
  )
}
