'use client'

import React, { useState, useTransition, useRef, useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, ArrowUpDown, RefreshCw } from 'lucide-react'

const PAGE_SIZE = 48
const BRAND = 'oklch(0.55 0.28 29.5)'

interface Pokemon {
  id: number
  name: string
  types: string[]
  imageUrl: string
  hp: number
  attack: number
  defense: number
  generation: number
}

const ALL_TYPES = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice',
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug',
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
]

const GENERATIONS = [
  { label: 'All Generations', value: '' },
  { label: 'Gen 1 (Kanto)', value: '1' },
  { label: 'Gen 2 (Johto)', value: '2' },
  { label: 'Gen 3 (Hoenn)', value: '3' },
  { label: 'Gen 4 (Sinnoh)', value: '4' },
  { label: 'Gen 5 (Unova)', value: '5' },
  { label: 'Gen 6 (Kalos)', value: '6' },
  { label: 'Gen 7 (Alola)', value: '7' },
  { label: 'Gen 8 (Galar/Hisui)', value: '8' },
  { label: 'Gen 9 (Paldea)', value: '9' },
]

const SORT_OPTIONS = [
  { label: 'Number (Low-High)', value: 'id_asc' },
  { label: 'Number (High-Low)', value: 'id_desc' },
  { label: 'Name (A-Z)', value: 'name_asc' },
  { label: 'Name (Z-A)', value: 'name_desc' },
  { label: 'Stat: HP', value: 'hp' },
  { label: 'Stat: Attack', value: 'attack' },
  { label: 'Stat: Defense', value: 'defense' },
  { label: 'Stat: Speed', value: 'speed' },
]

const TYPE_COLORS: Record<string, string> = {
  fire: '#F08030', water: '#6890F0', grass: '#78C850', electric: '#F7D02C',
  ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0', ground: '#E0C068',
  flying: '#A890F0', psychic: '#F85888', bug: '#A8B820', rock: '#B8A038',
  ghost: '#705898', dragon: '#7038F8', dark: '#705848', steel: '#B8B8D0',
  fairy: '#EE99AC', normal: '#A8A878',
}
const getTypeColor = (type: string) => TYPE_COLORS[type.toLowerCase()] ?? '#A8A878'

const GEN_ROMAN: Record<string, string> = {
  '1': 'I', '2': 'II', '3': 'III', '4': 'IV', '5': 'V',
  '6': 'VI', '7': 'VII', '8': 'VIII', '9': 'IX'
}

export function PokemonGrid() {
  const [isPending, startTransition] = useTransition()
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    generation: '',
    sortBy: 'id',
    sortOrder: 'asc'
  })

  const loadMoreRef = useRef<HTMLDivElement>(null)

  const selectedTypes = filters.type ? filters.type.split(',') : []

  const currentSortKey =
    filters.sortBy === 'id' && filters.sortOrder === 'asc' ? 'id_asc' :
    filters.sortBy === 'id' && filters.sortOrder === 'desc' ? 'id_desc' :
    filters.sortBy === 'name' && filters.sortOrder === 'asc' ? 'name_asc' :
    filters.sortBy === 'name' && filters.sortOrder === 'desc' ? 'name_desc' :
    filters.sortBy

  const isSortingByStat = ['hp', 'attack', 'defense', 'speed'].includes(filters.sortBy)

  const {
    data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['pokemon', filters],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.type) params.append('type', filters.type)
      if (filters.generation) params.append('generation', filters.generation)
      params.append('sort', filters.sortBy)
      params.append('order', filters.sortOrder)
      params.append('limit', String(PAGE_SIZE))
      params.append('offset', String(pageParam))
      const res = await fetch(`/api/pokemon?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((acc, p) => acc + p.data.length, 0)
      return loaded < lastPage.pagination.total ? loaded : undefined
    },
    staleTime: 5 * 60 * 60 * 1000,
  })

  const pokemonList: Pokemon[] = data?.pages.flatMap((p) => p.data) ?? []
  const total: number = data?.pages[0]?.pagination.total ?? 0

  useEffect(() => {
    const el = loadMoreRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    startTransition(() => {
      setFilters(prev => {
        const next = { ...prev, [key]: value }
        if (key === 'sortBy') {
          if (value === 'name_asc') { next.sortBy = 'name'; next.sortOrder = 'asc' }
          else if (value === 'name_desc') { next.sortBy = 'name'; next.sortOrder = 'desc' }
          else if (value === 'id_desc') { next.sortBy = 'id'; next.sortOrder = 'desc' }
          else if (['hp', 'attack', 'defense', 'speed'].includes(value)) { next.sortBy = value; next.sortOrder = 'desc' }
          else { next.sortBy = 'id'; next.sortOrder = 'asc' }
        }
        return next
      })
    })
  }

  const handleTypeSelect = (type: string) => {
    let newTypes = [...selectedTypes]
    if (newTypes.includes(type)) {
      newTypes = newTypes.filter(t => t !== type)
    } else if (newTypes.length < 2) {
      newTypes = [...newTypes, type]
    }
    handleFilterChange('type', newTypes.join(','))
  }

  const resetAll = () => {
    startTransition(() => {
      setFilters({ search: '', type: '', generation: '', sortBy: 'id', sortOrder: 'asc' })
    })
  }

  return (
    <div className="space-y-6">

      {/* ── Filter Panel ── */}
      <div className="glass-panel rounded-2xl border border-border p-5 space-y-5">

        {/* Row 1: Search + Sort */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search — 8 cols */}
          <div className="md:col-span-8 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or national number..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background/50 text-foreground text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/30 transition-all"
            />
          </div>

          {/* Sort — 4 cols */}
          <div className="md:col-span-4 relative">
            <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <select
              value={currentSortKey}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-border bg-background/50 text-foreground text-sm font-medium focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/30 transition-all appearance-none cursor-pointer"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Generation filter pills */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Generations:</span>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {GENERATIONS.map((gen) => {
              const isActive = filters.generation === gen.value
              return (
                <button
                  key={gen.value}
                  onClick={() => handleFilterChange('generation', gen.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
                    isActive
                      ? 'text-white border border-transparent'
                      : 'border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                  }`}
                  style={isActive ? { backgroundColor: BRAND, borderColor: BRAND } : {}}
                >
                  {gen.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Row 3: Type filter pills */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Elemental Filter (Select up to 2):
            </span>
            {selectedTypes.length > 0 && (
              <button
                onClick={() => handleFilterChange('type', '')}
                className="text-[10px] font-bold uppercase tracking-wider transition-colors"
                style={{ color: BRAND }}
              >
                Reset Types
              </button>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {ALL_TYPES.map((type) => {
              const isSelected = selectedTypes.includes(type)
              const isDisabled = selectedTypes.length >= 2 && !isSelected
              const typeColor = getTypeColor(type)
              return (
                <button
                  key={type}
                  onClick={() => !isDisabled && handleTypeSelect(type)}
                  disabled={isDisabled}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all duration-200 ${
                    isDisabled ? 'opacity-25 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  style={isSelected
                    ? { backgroundColor: typeColor, color: '#fff', border: `1px solid ${typeColor}` }
                    : { border: '1px solid var(--border)', color: 'var(--muted-foreground)' }
                  }
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: typeColor }}
                  />
                  {type}
                </button>
              )
            })}
          </div>
        </div>

        {/* Stat sort notice */}
        {isSortingByStat && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Sorting by stat — loading batch details from database…</span>
          </div>
        )}

        {/* Results count */}
        {!isLoading && (
          <div className="text-xs text-muted-foreground font-semibold flex items-center justify-between">
            <span>
              Showing <span className="text-foreground font-bold">{pokemonList.length}</span> of{' '}
              <span className="text-foreground font-bold">{total}</span> Pokémon
            </span>
            {(filters.search || filters.type || filters.generation) && (
              <button onClick={resetAll} className="text-xs font-bold transition-colors" style={{ color: BRAND }}>
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Grid ── */}
      {isLoading || isPending ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl border border-border" />
          ))}
        </div>
      ) : pokemonList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-2xl gap-4 text-center">
          <p className="text-muted-foreground text-sm font-semibold">No entries found matching filters.</p>
          <button
            onClick={resetAll}
            className="px-5 py-2 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: BRAND }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {pokemonList.map((pokemon: Pokemon, index: number) => {
              const primaryType = pokemon.types[0] || 'normal'
              const typeColor = getTypeColor(primaryType)
              const isEager = index < 12
              const genRoman = GEN_ROMAN[String(pokemon.generation)] || String(pokemon.generation)

              return (
                <Link key={pokemon.id} href={`/pokemon/${pokemon.id}`} className="group block">
                  <div
                    className="relative rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-300 cursor-pointer h-full border select-none overflow-hidden bg-card"
                    style={{ borderColor: `${typeColor}25` }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = typeColor
                      e.currentTarget.style.transform = 'translateY(-5px)'
                      e.currentTarget.style.boxShadow = `0 12px 32px ${typeColor}35`
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = `${typeColor}25`
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                    }}
                  >
                    {/* Top row */}
                    <div className="w-full flex justify-between items-center mb-2">
                      <span className="text-[9px] font-extrabold uppercase text-muted-foreground">
                        Gen {genRoman}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground font-fira">
                        #{String(pokemon.id).padStart(4, '0')}
                      </span>
                    </div>

                    {/* Artwork */}
                    <div className="w-24 h-24 relative flex items-center justify-center mb-3 rounded-xl"
                      style={{ backgroundColor: `${typeColor}12` }}>
                      {/* Subtle oval shadow */}
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-16 h-3 rounded-full blur-md opacity-25"
                        style={{ backgroundColor: typeColor }} />
                      {pokemon.imageUrl ? (
                        <Image
                          src={pokemon.imageUrl}
                          alt={pokemon.name}
                          width={88}
                          height={88}
                          priority={isEager}
                          loading={isEager ? 'eager' : 'lazy'}
                          sizes="(max-width: 640px) 50vw, 16vw"
                          className="w-20 h-20 object-contain drop-shadow-md select-none pointer-events-none group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">No Image</span>
                      )}
                    </div>

                    {/* Name */}
                    <h3
                      className="text-sm font-extrabold capitalize mb-2 tracking-normal truncate w-full text-foreground transition-colors duration-200 group-hover:text-brand-red"
                    >
                      {pokemon.name}
                    </h3>

                    {/* Type badges */}
                    <div className="flex gap-1 justify-center flex-wrap">
                      {pokemon.types.map((type) => (
                        <span
                          key={type}
                          className="px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider text-white"
                          style={{ backgroundColor: getTypeColor(type) }}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={loadMoreRef} className="flex flex-col items-center gap-3 py-6">
            {isFetchingNextPage && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-56 rounded-2xl border border-border" />
                ))}
              </div>
            )}
            {hasNextPage && !isFetchingNextPage && (
              <button
                onClick={() => fetchNextPage()}
                className="px-8 py-2.5 rounded-xl text-sm font-bold border border-border text-foreground hover:bg-muted/30 transition-all"
              >
                Load More Pokémon
              </button>
            )}
            {!hasNextPage && pokemonList.length > 0 && (
              <p className="text-xs text-muted-foreground font-semibold">
                All {total} Pokémon loaded ✓
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}
