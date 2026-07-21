import { PokemonGrid } from '@/components/PokemonGrid'
import { Suspense } from 'react'

export const metadata = {
  title: 'Pokédex Database · RotomDex',
  description: 'Complete national Pokémon database — search, filter by type & generation, sort by stats. 1,025 entries.',
}

export default function PokedexPage() {
  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8">

      {/* Page header */}
      <div className="mb-8 space-y-1">
        <h1 className="font-display font-black text-3xl text-foreground">Pokédex Database</h1>
        <p className="text-sm text-muted-foreground font-medium">
          Query the national dataset, sort by parameters, and examine competitive statistics.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-56 rounded-2xl bg-card animate-pulse border border-border" />
            ))}
          </div>
        }
      >
        <PokemonGrid />
      </Suspense>
    </div>
  )
}
