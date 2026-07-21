'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { Swords, Award, Search } from 'lucide-react'

const BRAND = 'oklch(0.55 0.28 29.5)'

interface Pokemon {
  id: number
  name: string
  types: string[]
  imageUrl: string
  hp: number
  attack: number
  defense: number
  spAtk: number
  spDef: number
  speed: number
  generation?: number
  height?: number
  weight?: number
  baseExp?: number
  catchRate?: number
  legend?: boolean
  mythical?: boolean
}

const TYPE_COLORS: Record<string, string> = {
  fire: '#F08030', water: '#6890F0', grass: '#78C850', electric: '#F7D02C',
  ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0', ground: '#E0C068',
  flying: '#A890F0', psychic: '#F85888', bug: '#A8B820', rock: '#B8A038',
  ghost: '#705898', dragon: '#7038F8', dark: '#705848', steel: '#B8B8D0',
  fairy: '#EE99AC', normal: '#A8A878',
}
const getTypeColor = (type: string) => TYPE_COLORS[type?.toLowerCase()] ?? '#A8A878'

const typeMatchups: Record<string, Record<string, number>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
}

function getEffMult(atk: string, defTypes: string[]) {
  let m = 1
  const match = typeMatchups[atk?.toLowerCase()]
  if (!match) return 1
  for (const d of defTypes) { const v = match[d?.toLowerCase()]; if (v !== undefined) m *= v }
  return m
}

const STATS = [
  { label: 'HP', key: 'hp' as keyof Pokemon },
  { label: 'Attack', key: 'attack' as keyof Pokemon },
  { label: 'Defense', key: 'defense' as keyof Pokemon },
  { label: 'Sp. Atk', key: 'spAtk' as keyof Pokemon },
  { label: 'Sp. Def', key: 'spDef' as keyof Pokemon },
  { label: 'Speed', key: 'speed' as keyof Pokemon },
]

function PokemonSelector({
  label,
  selected,
  pokemonList,
  onSelect,
}: {
  label: string
  selected: Pokemon | undefined
  pokemonList: Pokemon[]
  onSelect: (id: number) => void
}) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const filtered = pokemonList.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || String(p.id).includes(search)
  ).slice(0, 6)

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</label>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          placeholder="Search Pokémon..."
          value={open ? search : (selected ? `${selected.name} · #${String(selected.id).padStart(4, '0')}` : '')}
          onChange={e => { setSearch(e.target.value); setOpen(true) }}
          onFocus={() => { setSearch(''); setOpen(true) }}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-background/60 text-foreground text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:border-brand-red transition-all capitalize"
        />
        {open && filtered.length > 0 && (
          <div className="absolute top-full mt-1 left-0 right-0 glass-panel rounded-xl border border-border shadow-2xl z-50 overflow-hidden">
            {filtered.map(p => (
              <div
                key={p.id}
                onMouseDown={() => { onSelect(p.id); setOpen(false) }}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <span className="text-xs font-black text-muted-foreground font-fira w-12">#{String(p.id).padStart(4, '0')}</span>
                <span className="text-sm font-bold capitalize text-foreground flex-1">{p.name}</span>
                <div className="flex gap-1">
                  {p.types.map(t => (
                    <span key={t} className="w-2 h-2 rounded-full" style={{ backgroundColor: getTypeColor(t) }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PokemonCard({ pokemon, compareTarget, slot }: { pokemon: Pokemon; compareTarget: Pokemon | undefined; slot: 1 | 2 }) {
  const primaryColor = getTypeColor(pokemon.types[0])
  const bst = STATS.reduce((acc, s) => acc + (Number(pokemon[s.key]) || 0), 0)
  const targetBst = compareTarget ? STATS.reduce((acc, s) => acc + (Number(compareTarget[s.key]) || 0), 0) : 0

  return (
    <div
      className="glass-panel rounded-3xl border p-6 flex flex-col gap-5 transition-all duration-300"
      style={{ borderColor: `${primaryColor}30` }}
    >
      {/* Artwork */}
      <div className="relative flex items-center justify-center h-44 rounded-2xl"
        style={{ background: `radial-gradient(circle, ${primaryColor}25 0%, transparent 70%)` }}>
        <Image
          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
          alt={pokemon.name}
          width={160}
          height={160}
          className="object-contain drop-shadow-xl hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Info */}
      <div className="text-center space-y-2">
        <span className="text-xs font-black text-muted-foreground font-fira">#{String(pokemon.id).padStart(4, '0')}</span>
        <h2 className="font-display font-black text-2xl text-foreground capitalize">{pokemon.name}</h2>
        <div className="flex gap-1.5 justify-center">
          {pokemon.types.map(t => (
            <span key={t} className="px-3 py-1 rounded-full text-[10px] font-black uppercase text-white"
              style={{ backgroundColor: getTypeColor(t) }}>
              {t}
            </span>
          ))}
        </div>
        {(pokemon.legend || pokemon.mythical) && (
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black text-white ${pokemon.legend ? 'bg-amber-500' : 'bg-purple-500'}`}>
            {pokemon.legend ? 'Legendary' : 'Mythical'}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="space-y-2.5">
        {STATS.map(stat => {
          const myVal = Number(pokemon[stat.key]) || 0
          const theirVal = compareTarget ? (Number(compareTarget[stat.key]) || 0) : 0
          const isWinner = compareTarget ? myVal > theirVal : false
          const maxVal = Math.max(myVal, theirVal, 1)
          const pct = (myVal / 255) * 100
          return (
            <div key={stat.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-semibold w-14">{stat.label}</span>
                <span className={`font-black font-fira ${isWinner ? '' : 'text-muted-foreground'}`}
                  style={isWinner ? { color: BRAND } : {}}>
                  {myVal}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: isWinner ? BRAND : primaryColor, opacity: isWinner ? 1 : 0.6 }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* BST */}
      <div className="border-t border-border pt-3 flex items-center justify-between">
        <span className="text-xs font-bold text-muted-foreground">Base Stat Total</span>
        <span className={`font-fira font-black text-sm ${bst > targetBst ? 'text-foreground' : 'text-muted-foreground'}`}
          style={bst > targetBst ? { color: BRAND } : {}}>
          {bst}
        </span>
      </div>
    </div>
  )
}

export default function ComparePage() {
  const [pokeId1, setPokeId1] = useState<number>(1)
  const [pokeId2, setPokeId2] = useState<number>(4)

  const { data: listRes } = useQuery({
    queryKey: ['pokemon-list-compare'],
    queryFn: async () => {
      const res = await fetch('/api/pokemon?limit=1025')
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
  })
  const pokemonList: Pokemon[] = listRes?.data || []

  const { data: detailsRes } = useQuery({
    queryKey: ['pokemon-details-compare', pokeId1, pokeId2],
    queryFn: async () => {
      const res = await fetch(`/api/pokemon?ids=${pokeId1},${pokeId2}`)
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
    enabled: !!pokeId1 && !!pokeId2,
  })
  const detailsList: Pokemon[] = detailsRes?.data || []
  const pokemon1 = detailsList.find(p => p.id === pokeId1) || pokemonList.find(p => p.id === pokeId1)
  const pokemon2 = detailsList.find(p => p.id === pokeId2) || pokemonList.find(p => p.id === pokeId2)

  const mult1 = pokemon1 && pokemon2 ? getEffMult(pokemon1.types[0], pokemon2.types) : null
  const mult2 = pokemon1 && pokemon2 ? getEffMult(pokemon2.types[0], pokemon1.types) : null
  const bst1 = pokemon1 ? STATS.reduce((a, s) => a + (Number(pokemon1[s.key]) || 0), 0) : 0
  const bst2 = pokemon2 ? STATS.reduce((a, s) => a + (Number(pokemon2[s.key]) || 0), 0) : 0

  let verdict = ''
  let verdictWinner = ''
  if (pokemon1 && pokemon2 && mult1 !== null && mult2 !== null) {
    if (mult1 > mult2) {
      verdictWinner = pokemon1.name
      verdict = `${pokemon1.name} holds the elemental advantage — its ${pokemon1.types[0]} attacks deal ${mult1}× damage while receiving only ${mult2}× in return.`
    } else if (mult2 > mult1) {
      verdictWinner = pokemon2.name
      verdict = `${pokemon2.name} holds the elemental advantage — its ${pokemon2.types[0]} attacks deal ${mult2}× damage while receiving only ${mult1}× in return.`
    } else if (bst1 > bst2) {
      verdictWinner = pokemon1.name
      verdict = `Type matchup is equal (${mult1}× each). ${pokemon1.name} wins on base stat total (+${bst1 - bst2} BST).`
    } else if (bst2 > bst1) {
      verdictWinner = pokemon2.name
      verdict = `Type matchup is equal (${mult1}× each). ${pokemon2.name} wins on base stat total (+${bst2 - bst1} BST).`
    } else {
      verdictWinner = 'Draw'
      verdict = 'Absolute deadlock — both Pokémon share identical type effectiveness and Base Stat Total.'
    }
  }

  return (
    <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-8 space-y-8">

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/15">
          <Swords className="w-7 h-7 text-blue-400" />
        </div>
        <h1 className="font-display font-black text-3xl md:text-4xl text-foreground">Compare Arena</h1>
        <p className="text-sm text-muted-foreground font-medium max-w-lg mx-auto">
          Select two combatants to pit their stats and elemental types head-to-head.
        </p>
      </div>

      {/* Selector panel */}
      <div className="glass-panel rounded-3xl border border-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PokemonSelector
            label="Combatant Slot 1"
            selected={pokemon1}
            pokemonList={pokemonList}
            onSelect={setPokeId1}
          />
          <PokemonSelector
            label="Combatant Slot 2"
            selected={pokemon2}
            pokemonList={pokemonList}
            onSelect={setPokeId2}
          />
        </div>
      </div>

      {/* Profile cards */}
      {pokemon1 && pokemon2 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Card 1 */}
            <div className="md:col-span-5">
              <PokemonCard pokemon={pokemon1} compareTarget={pokemon2} slot={1} />
            </div>

            {/* VS divider */}
            <div className="md:col-span-2 flex flex-col items-center justify-center gap-4 py-4">
              <span className="font-display font-black text-4xl text-foreground">VS.</span>
              {mult1 !== null && mult2 !== null && (
                <div className="flex flex-col gap-2 text-center">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border glass-panel text-xs font-bold">
                    <span className="text-muted-foreground capitalize">{pokemon1.types[0]}</span>
                    <span className="font-fira" style={{ color: mult1 > 1 ? '#22c55e' : mult1 < 1 ? '#ef4444' : 'inherit' }}>
                      {mult1}×
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border glass-panel text-xs font-bold">
                    <span className="text-muted-foreground capitalize">{pokemon2.types[0]}</span>
                    <span className="font-fira" style={{ color: mult2 > 1 ? '#22c55e' : mult2 < 1 ? '#ef4444' : 'inherit' }}>
                      {mult2}×
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Card 2 */}
            <div className="md:col-span-5">
              <PokemonCard pokemon={pokemon2} compareTarget={pokemon1} slot={2} />
            </div>
          </div>

          {/* Type Offensive Coverage */}
          <div className="glass-panel rounded-3xl border border-border p-6 space-y-4">
            <h2 className="font-display font-black text-lg text-foreground">Type Offensive Coverage</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Combatant 1 offensive effectiveness against Combatant 2 */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {pokemon1.name} Attacks vs. {pokemon2.name}
                </h3>
                <div className="space-y-2">
                  {pokemon1.types.map(atkType => {
                    const mult = getEffMult(atkType, pokemon2.types)
                    return (
                      <div key={atkType} className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-muted/5">
                        <span className="px-3 py-1 rounded-lg text-xs font-black text-white uppercase tracking-wider"
                          style={{ backgroundColor: getTypeColor(atkType) }}>
                          {atkType}
                        </span>
                        <div className="flex items-center gap-1.5 font-fira">
                          <span className="text-xs text-muted-foreground">Effectiveness:</span>
                          <span className={`text-sm font-black ${
                            mult > 1 ? 'text-emerald-400' :
                            mult < 1 ? 'text-rose-400' :
                            'text-foreground'
                          }`}>
                            {mult}×
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Combatant 2 offensive effectiveness against Combatant 1 */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {pokemon2.name} Attacks vs. {pokemon1.name}
                </h3>
                <div className="space-y-2">
                  {pokemon2.types.map(atkType => {
                    const mult = getEffMult(atkType, pokemon1.types)
                    return (
                      <div key={atkType} className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-muted/5">
                        <span className="px-3 py-1 rounded-lg text-xs font-black text-white uppercase tracking-wider"
                          style={{ backgroundColor: getTypeColor(atkType) }}>
                          {atkType}
                        </span>
                        <div className="flex items-center gap-1.5 font-fira">
                          <span className="text-xs text-muted-foreground">Effectiveness:</span>
                          <span className={`text-sm font-black ${
                            mult > 1 ? 'text-emerald-400' :
                            mult < 1 ? 'text-rose-400' :
                            'text-foreground'
                          }`}>
                            {mult}×
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Battle verdict */}
          {verdict && (
            <div className="glass-panel rounded-3xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-amber-400" />
                <h2 className="font-display font-black text-xl text-foreground">Battle Verdict</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {verdict.split(verdictWinner).map((part, i, arr) => (
                  <React.Fragment key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <strong className="text-foreground font-black capitalize">{verdictWinner}</strong>
                    )}
                  </React.Fragment>
                ))}
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="glass-panel rounded-3xl border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground text-sm font-semibold">Loading combatant data…</p>
        </div>
      )}
    </div>
  )
}
