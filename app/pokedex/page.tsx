import { PokemonGrid } from '@/components/PokemonGrid'
import { Suspense } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'

export const metadata = {
  title: 'Pokédex - RotomDex',
  description: 'Complete Pokémon database with advanced search and filtering',
}

export default function PokedexPage() {
  return (
    <div className="min-h-screen flex flex-col text-slate-800 dark:text-slate-100">
      {/* TopNavBar */}
      <nav className="sticky top-0 w-full h-[72px] z-50 bg-white/85 dark:bg-slate-950/40 backdrop-blur-md border-b border-slate-200/60 dark:border-white/5">
        <div className="flex justify-between items-center px-6 w-full max-w-7xl mx-auto h-full">
          <Logo />
          <ul className="hidden md:flex gap-6 h-full items-center">
            <li className="h-full flex items-center">
              <Link className="text-sm text-slate-650 dark:text-slate-300 hover:text-brand-red font-semibold transition-colors h-full flex items-center" href="/">Home</Link>
            </li>
            <li className="h-full flex items-center">
              <Link className="text-sm text-brand-red font-bold border-b-2 border-brand-red h-full flex items-center" href="/pokedex">Pokédex</Link>
            </li>
            <li className="h-full flex items-center">
              <Link className="text-sm text-slate-650 dark:text-slate-300 hover:text-brand-red font-semibold transition-colors h-full flex items-center" href="/compare">Compare</Link>
            </li>
            <li className="h-full flex items-center">
              <Link className="text-sm text-slate-650 dark:text-slate-300 hover:text-brand-red font-semibold transition-colors h-full flex items-center" href="/teams">Teams</Link>
            </li>
            <li className="h-full flex items-center">
              <Link className="text-sm text-slate-650 dark:text-slate-300 hover:text-brand-red font-semibold transition-colors h-full flex items-center" href="/about">About</Link>
            </li>
          </ul>
          <div className="flex gap-4 items-center">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main content grid area */}
      <main className="max-w-7xl mx-auto w-full px-6 py-10 flex-1">
        <Suspense fallback={<div className="text-slate-500 dark:text-slate-400 text-lg">Loading grid...</div>}>
          <PokemonGrid />
        </Suspense>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 mt-12 border-t border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-slate-950/20 flex flex-col items-center justify-center text-center px-6">
        <Logo className="mb-3" />
        <div className="flex gap-6 mb-4 text-xs text-slate-500 dark:text-slate-400">
          <Link className="hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer" href="/">Home</Link>
          <Link className="hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer" href="/pokedex">Pokédex</Link>
          <Link className="hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer" href="/compare">Compare</Link>
          <Link className="hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer" href="/teams">Teams</Link>
          <Link className="hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer" href="/about">About</Link>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-2xl">
          Data provided by PokéAPI. Pokémon and Pokémon character names are trademarks of Nintendo.
        </p>
      </footer>
    </div>
  )
}
