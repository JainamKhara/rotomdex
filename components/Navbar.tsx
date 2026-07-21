'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Database, Menu, X } from 'lucide-react'
import { useState } from 'react'

function PokeballLogo() {
  return (
    <div className="relative group cursor-pointer">
      {/* Radial glow on hover */}
      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md"
        style={{ background: 'radial-gradient(circle, oklch(0.55 0.28 29.5 / 0.5) 0%, transparent 70%)' }}
      />
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        className="relative z-10 group-hover:scale-110 transition-transform duration-300"
      >
        {/* Top half — red */}
        <path
          d="M3 18 A15 15 0 0 1 33 18 Z"
          fill="oklch(0.55 0.28 29.5)"
          className="group-hover:-translate-y-0.5 transition-transform duration-300"
        />
        {/* Bottom half — white/dark */}
        <path
          d="M3 18 A15 15 0 0 0 33 18 Z"
          className="fill-white dark:fill-slate-800"
        />
        {/* Outer circle border */}
        <circle cx="18" cy="18" r="15" fill="none" stroke="#1a1a2e" strokeWidth="1.5" className="dark:stroke-slate-600" />
        {/* Center divider line */}
        <line x1="3" y1="18" x2="33" y2="18" stroke="#1a1a2e" strokeWidth="1.5" className="dark:stroke-slate-600" />
        {/* Center button ring */}
        <circle cx="18" cy="18" r="5" fill="none" stroke="#1a1a2e" strokeWidth="1.5" className="dark:stroke-slate-600" />
        {/* Center button fill */}
        <circle cx="18" cy="18" r="3.5" className="fill-white dark:fill-slate-200" />
        {/* Pulsing red inner orb */}
        <circle cx="18" cy="18" r="2" fill="oklch(0.55 0.28 29.5)" className="animate-pokeball-pulse" />
      </svg>
    </div>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'Pokédex', href: '/pokedex' },
    { name: 'Compare', href: '/compare' },
    { name: 'Teams', href: '/teams' },
  ]

  return (
    <div className="sticky top-4 z-50 px-4 md:px-6">
      <nav className="max-w-7xl mx-auto glass-panel rounded-2xl border border-border shadow-lg shadow-black/10 dark:shadow-black/40">
        <div className="flex items-center justify-between px-4 py-2.5 md:px-5">

          {/* LEFT — Logo + Wordmark */}
          <Link href="/" className="flex items-center gap-3 group">
            <PokeballLogo />
            <div className="flex flex-col leading-none">
              <span className="font-display font-black text-sm tracking-tight text-foreground">
                ROTOM
                <span style={{ color: 'oklch(0.55 0.28 29.5)' }}>DEX</span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                Pocket Database
              </span>
            </div>
          </Link>

          {/* CENTER/RIGHT — Nav Links (desktop) */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? 'border text-white'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  style={isActive ? {
                    backgroundColor: 'oklch(0.55 0.28 29.5)',
                    borderColor: 'oklch(0.48 0.27 29.5)',
                  } : {}}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* RIGHT — Actions */}
          <div className="flex items-center gap-2">
            {/* Database counter badge */}
            <Link
              href="/pokedex"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:text-foreground hover:border-brand-red transition-all duration-200"
            >
              <Database className="w-3.5 h-3.5" />
              <span>1,025 Entries</span>
            </Link>

            <ThemeToggle />

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(prev => !prev)}
              className="md:hidden h-9 w-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border px-4 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? 'text-white'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  style={isActive ? { backgroundColor: 'oklch(0.55 0.28 29.5)' } : {}}
                >
                  {item.name}
                </Link>
              )
            })}
            <Link
              href="/pokedex"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, oklch(0.55 0.28 29.5), oklch(0.55 0.22 50))' }}
            >
              Launch Database
            </Link>
          </div>
        )}
      </nav>
    </div>
  )
}
