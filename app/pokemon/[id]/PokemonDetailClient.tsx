'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, ShieldAlert, Shield, Info, Ruler, Weight,
  Sparkles, Dna, Swords, MapPin, Star, ChevronRight, Loader2, HelpCircle
} from 'lucide-react'

const BRAND = 'oklch(0.55 0.28 29.5)'
const BRAND_DARK = 'oklch(0.48 0.27 29.5)'

const TYPE_COLORS: Record<string, string> = {
  fire: '#F08030', water: '#6890F0', grass: '#78C850', electric: '#F7D02C',
  ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0', ground: '#E0C068',
  flying: '#A890F0', psychic: '#F85888', bug: '#A8B820', rock: '#B8A038',
  ghost: '#705898', dragon: '#7038F8', dark: '#705848', steel: '#B8B8D0',
  fairy: '#EE99AC', normal: '#A8A878',
}
const getTypeColor = (type: string) => TYPE_COLORS[type.toLowerCase()] ?? '#A8A878'

const GEN_ROMAN: Record<number, string> = {
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX'
}

const NATURES = [
  { label: 'Neutral', atk: 1, def: 1, spAtk: 1, spDef: 1, spd: 1 },
  { label: 'Adamant (+Atk / -SpAtk)', atk: 1.1, def: 1, spAtk: 0.9, spDef: 1, spd: 1 },
  { label: 'Modest (+SpAtk / -Atk)', atk: 0.9, def: 1, spAtk: 1.1, spDef: 1, spd: 1 },
  { label: 'Jolly (+Spd / -SpAtk)', atk: 1, def: 1, spAtk: 0.9, spDef: 1, spd: 1.1 },
  { label: 'Timid (+Spd / -Atk)', atk: 0.9, def: 1, spAtk: 1, spDef: 1, spd: 1.1 },
  { label: 'Bold (+Def / -Atk)', atk: 0.9, def: 1.1, spAtk: 1, spDef: 1, spd: 1 },
  { label: 'Calm (+SpDef / -Atk)', atk: 0.9, def: 1, spAtk: 1, spDef: 1.1, spd: 1 },
  { label: 'Impish (+Def / -SpAtk)', atk: 1, def: 1.1, spAtk: 0.9, spDef: 1, spd: 1 },
  { label: 'Careful (+SpDef / -SpAtk)', atk: 1, def: 1, spAtk: 0.9, spDef: 1.1, spd: 1 },
]

interface EVPreset {
  label: string
  ivs: number[]
  evs: number[]
}

const EV_PRESETS: EVPreset[] = [
  { label: 'Uninvested', ivs: [31,31,31,31,31,31], evs: [0,0,0,0,0,0] },
  { label: 'Physical Sweeper', ivs: [31,31,31,31,31,31], evs: [252,252,0,0,0,4] },
  { label: 'Special Sweeper', ivs: [31,31,31,31,31,31], evs: [252,0,0,252,0,4] },
  { label: 'Bulky Tank', ivs: [31,31,31,31,31,31], evs: [252,0,128,0,128,0] },
]

function calcHP(base: number, iv: number, ev: number, level: number) {
  if (base === 1) return 1  // Shedinja
  return Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + level + 10
}
function calcStat(base: number, iv: number, ev: number, level: number, nature: number) {
  return Math.floor((Math.floor(((2 * base + iv + Math.floor(ev / 4)) * level) / 100) + 5) * nature)
}

interface PokemonData {
  id: number
  name: string
  generation: number
  types: string[]
  height: number
  weight: number
  baseExp: number | null
  imageUrl: string | null
  shinyImageUrl: string | null
  description: string
  jpName: string
  isLegendary: boolean
  isMythical: boolean
  isBaby: boolean
  stats: { label: string; val: number }[]
  totalStats: number
  primaryType: string
  abilities: { name: string; isHidden: boolean }[]
  evolutionSteps: { name: string; id: string; level: number | null; item: string | null }[]
  moves: { name: string; type: string; power: number | null; learnMethod: string; level: number }[]
  weaknesses: [string, number][]
  resistances: [string, number][]
  cries: any
  sprites: { frontDefault: string | null; backDefault: string | null; frontShiny: string | null; backShiny: string | null }
}

const TABS = ['Overview', 'Stats & Calculator', 'Moveset', 'Sprites Grid', 'Locations', 'Matchups'] as const
type Tab = typeof TABS[number]

export function PokemonDetailClient({ pokemon }: { pokemon: PokemonData }) {
  const [activeTab, setActiveTab] = useState<Tab>('Overview')
  const [showShiny, setShowShiny] = useState(false)
  const [level, setLevel] = useState(50)
  const [natureIndex, setNatureIndex] = useState(0)
  const [evPresetIndex, setEvPresetIndex] = useState(0)
  const [moveSearch, setMoveSearch] = useState('')
  const [moveCategory, setMoveCategory] = useState<'level-up' | 'machine' | 'tutor' | 'egg'>('level-up')

  const [speciesData, setSpeciesData] = useState<any>(null)
  const [loadingSpecies, setLoadingSpecies] = useState(false)
  const [spritesData, setSpritesData] = useState<any>(null)
  const [loadingSprites, setLoadingSprites] = useState(false)
  const [locationsData, setLocationsData] = useState<any>(null)
  const [loadingLocations, setLoadingLocations] = useState(false)

  const [abilityDetails, setAbilityDetails] = useState<Record<string, string>>({})
  const [loadingAbilityName, setLoadingAbilityName] = useState<string | null>(null)

  const [expandedMove, setExpandedMove] = useState<string | null>(null)
  const [moveDetails, setMoveDetails] = useState<Record<string, any>>({})
  const [loadingMoveName, setLoadingMoveName] = useState<string | null>(null)

  useEffect(() => {
    if (activeTab === 'Overview' && !speciesData && !loadingSpecies) {
      setLoadingSpecies(true)
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`)
        .then(res => res.json())
        .then(data => {
          setSpeciesData(data)
          setLoadingSpecies(false)
        })
        .catch(err => {
          console.error(err)
          setLoadingSpecies(false)
        })
    } else if (activeTab === 'Sprites Grid' && !spritesData && !loadingSprites) {
      setLoadingSprites(true)
      fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`)
        .then(res => res.json())
        .then(data => {
          setSpritesData(data.sprites)
          setLoadingSprites(false)
        })
        .catch(err => {
          console.error(err)
          setLoadingSprites(false)
        })
    } else if (activeTab === 'Locations' && !locationsData && !loadingLocations) {
      setLoadingLocations(true)
      fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}/encounters`)
        .then(res => res.json())
        .then(data => {
          setLocationsData(data)
          setLoadingLocations(false)
        })
        .catch(err => {
          console.error(err)
          setLoadingLocations(false)
        })
    }
  }, [activeTab, pokemon.id, speciesData, spritesData, locationsData])

  const fetchAbilityEffect = (abilityName: string) => {
    if (abilityDetails[abilityName] || loadingAbilityName) return
    setLoadingAbilityName(abilityName)
    fetch(`https://pokeapi.co/api/v2/ability/${abilityName}`)
      .then(res => res.json())
      .then(data => {
        const entry = (data.effect_entries ?? []).find((e: any) => e.language.name === 'en') ||
                      (data.flavor_text_entries ?? []).find((e: any) => e.language.name === 'en')
        const effectText = entry ? (entry.effect || entry.flavor_text) : 'No description available.'
        setAbilityDetails(prev => ({ ...prev, [abilityName]: effectText }))
        setLoadingAbilityName(null)
      })
      .catch(err => {
        console.error(err)
        setLoadingAbilityName(null)
      })
  }

  const toggleMoveExpansion = (moveName: string) => {
    if (expandedMove === moveName) {
      setExpandedMove(null)
      return
    }
    setExpandedMove(moveName)
    if (moveDetails[moveName] || loadingMoveName) return
    setLoadingMoveName(moveName)
    fetch(`https://pokeapi.co/api/v2/move/${moveName.toLowerCase().replace(/\s+/g, '-')}`)
      .then(res => res.json())
      .then(data => {
        const entry = (data.effect_entries ?? []).find((e: any) => e.language.name === 'en') ||
                      (data.flavor_text_entries ?? []).find((e: any) => e.language.name === 'en')
        const desc = entry ? (entry.effect || entry.flavor_text) : 'No description available.'
        setMoveDetails(prev => ({
          ...prev,
          [moveName]: {
            power: data.power,
            accuracy: data.accuracy,
            pp: data.pp,
            category: data.damage_class?.name || 'status',
            type: data.type?.name || 'normal',
            description: desc
          }
        }))
        setLoadingMoveName(null)
      })
      .catch(err => {
        console.error(err)
        setLoadingMoveName(null)
      })
  }

  const primaryTypeColor = getTypeColor(pokemon.primaryType)
  const nature = NATURES[natureIndex]
  const preset = EV_PRESETS[evPresetIndex]

  const artwork = showShiny
    ? (pokemon.shinyImageUrl || pokemon.imageUrl)
    : pokemon.imageUrl
  const artworkUrl = artwork || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`

  // Calculated stats
  const calcStats = pokemon.stats.map((s, i) => {
    if (s.label === 'HP') return calcHP(s.val, preset.ivs[i], preset.evs[i], level)
    const natureMultiplier = [
      1, nature.atk, nature.def, nature.spAtk, nature.spDef, nature.spd
    ][i] ?? 1
    return calcStat(s.val, preset.ivs[i], preset.evs[i], level, natureMultiplier)
  })

  // Filtered moves
  const moveCategoryMap: Record<string, string> = {
    'level-up': 'level-up', machine: 'machine', tutor: 'tutor', egg: 'egg'
  }
  const filteredMoves = pokemon.moves.filter(m =>
    m.learnMethod === moveCategoryMap[moveCategory] &&
    m.name.toLowerCase().includes(moveSearch.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto w-full px-4 md:px-8 py-8 space-y-6">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link
          href="/pokedex"
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Return to Database
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          {pokemon.isLegendary && (
            <span className="px-3 py-1 rounded-full text-xs font-black text-white"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #eab308)' }}>
              Legendary
            </span>
          )}
          {pokemon.isMythical && (
            <span className="px-3 py-1 rounded-full text-xs font-black text-white"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
              Mythical
            </span>
          )}
          {pokemon.isBaby && (
            <span className="px-3 py-1 rounded-full text-xs font-black border border-emerald-500 text-emerald-400 bg-emerald-500/10">
              Baby
            </span>
          )}
          <span className="px-3 py-1 rounded-full text-xs font-black border border-border text-muted-foreground">
            Gen {GEN_ROMAN[pokemon.generation] || pokemon.generation}
          </span>
        </div>
      </div>

      {/* ── Profile Deck ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        {/* Left: Artwork panel */}
        <div className="lg:col-span-5 space-y-3">
          <div
            className="glass-panel rounded-3xl border border-border p-6 flex flex-col items-center justify-center min-h-[360px] relative overflow-hidden"
          >
            {/* Type-colored radial glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-72 h-72 rounded-full blur-3xl opacity-20"
                style={{ backgroundColor: primaryTypeColor }} />
            </div>

            {/* Artwork */}
            <img
              src={artworkUrl}
              alt={pokemon.name}
              key={artworkUrl}
              className="relative z-10 h-64 w-64 object-contain drop-shadow-2xl transition-all duration-500 select-none pointer-events-none"
            />
          </div>

          {/* Shiny switcher */}
          <div className="glass-panel rounded-2xl border border-border px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">Artwork Render</span>
            <div className="flex gap-1">
              {(['Default', 'Shiny'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setShowShiny(mode === 'Shiny')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    (mode === 'Shiny') === showShiny
                      ? 'text-white'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  style={(mode === 'Shiny') === showShiny ? { backgroundColor: BRAND } : {}}
                >
                  {mode === 'Shiny' && <Sparkles className="w-3 h-3" />}
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Info sheet */}
        <div className="lg:col-span-7">
          <div className="glass-panel rounded-3xl border border-border p-6 space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                National Dex <span className="font-fira">#{String(pokemon.id).padStart(4, '0')}</span>
              </p>
              <h1 className="font-display font-black text-4xl md:text-5xl text-foreground capitalize mt-1 tracking-tight">
                {pokemon.name}
              </h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {pokemon.jpName && (
                  <span className="px-2.5 py-0.5 rounded-lg border border-border text-xs font-bold text-muted-foreground">
                    {pokemon.jpName}
                  </span>
                )}
              </div>
            </div>

            {/* Type badges */}
            <div className="flex gap-2">
              {pokemon.types.map(type => (
                <span
                  key={type}
                  className="px-3.5 py-1.5 rounded-full text-xs font-black text-white uppercase tracking-wider"
                  style={{ backgroundColor: getTypeColor(type) }}
                >
                  {type}
                </span>
              ))}
            </div>

            {/* Flavor text */}
            {pokemon.description && (
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  &ldquo;{pokemon.description}&rdquo;
                </p>
              </div>
            )}

            {/* Physical specs */}
            <div className="grid grid-cols-3 gap-3 border-t border-border pt-4">
              {[
                { icon: <Ruler className="w-4 h-4" />, label: 'Height', value: `${(pokemon.height / 10).toFixed(1)} m` },
                { icon: <Weight className="w-4 h-4" />, label: 'Weight', value: `${(pokemon.weight / 10).toFixed(1)} kg` },
                { icon: <Star className="w-4 h-4" />, label: 'Base Exp', value: pokemon.baseExp ? `${pokemon.baseExp} XP` : '—' },
              ].map(spec => (
                <div key={spec.label} className="glass-panel rounded-xl border border-border p-3 text-center">
                  <div className="flex justify-center mb-1 text-muted-foreground">{spec.icon}</div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{spec.label}</p>
                  <p className="text-sm font-black text-foreground mt-0.5">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="border-b border-border overflow-x-auto no-scrollbar">
        <div className="flex gap-1 min-w-max">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-bold whitespace-nowrap transition-all duration-200 border-b-2 ${
                activeTab === tab
                  ? 'border-b-2 text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              style={activeTab === tab ? { borderBottomColor: BRAND, color: BRAND } : {}}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ══ TAB CONTENT ══ */}

      {/* OVERVIEW */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Biological Metrics */}
          <div className="glass-panel rounded-3xl border border-border p-6 space-y-4">
            <h2 className="font-display font-black text-lg text-foreground">Biological Metrics</h2>
            {loadingSpecies ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: BRAND }} />
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {/* Gender Ratio */}
                <div className="py-3 flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Gender Ratio</span>
                  {(() => {
                    const gr = speciesData?.gender_rate ?? -1
                    if (gr === -1) {
                      return <span className="text-sm font-bold text-foreground">Genderless</span>
                    }
                    const femalePct = (gr / 8) * 100
                    const malePct = 100 - femalePct
                    return (
                      <div className="space-y-1.5">
                        <div className="h-2 w-full bg-pink-500 rounded-full overflow-hidden flex">
                          <div className="h-full bg-blue-500" style={{ width: `${malePct}%` }} />
                        </div>
                        <p className="text-xs font-bold text-foreground">
                          {malePct}% ♂ / {femalePct}% ♀
                        </p>
                      </div>
                    )
                  })()}
                </div>

                {/* Base Happiness */}
                <div className="py-3 flex items-center justify-between text-sm">
                  <span className="font-bold text-muted-foreground">Base Happiness</span>
                  <span className="font-black text-foreground font-fira">
                    {speciesData?.base_happiness ?? '—'} / 255
                  </span>
                </div>

                {/* Growth Rate */}
                <div className="py-3 flex items-center justify-between text-sm">
                  <span className="font-bold text-muted-foreground">Growth Rate</span>
                  <span className="font-black text-foreground capitalize">
                    {speciesData?.growth_rate?.name?.replace(/-/g, ' ') ?? '—'}
                  </span>
                </div>

                {/* Egg Groups */}
                <div className="py-3 flex items-center justify-between text-sm">
                  <span className="font-bold text-muted-foreground">Egg Groups</span>
                  <span className="font-black text-foreground capitalize">
                    {speciesData?.egg_groups?.map((g: any) => g.name).join(', ') ?? '—'}
                  </span>
                </div>

                {/* Hatch Time */}
                <div className="py-3 flex items-center justify-between text-sm">
                  <span className="font-bold text-muted-foreground">Egg Cycles / Hatch Time</span>
                  <span className="font-black text-foreground">
                    {speciesData ? `${speciesData.hatch_counter} cycles (${speciesData.hatch_counter * 256} steps)` : '—'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Abilities Index */}
          <div className="glass-panel rounded-3xl border border-border p-6 space-y-4">
            <h2 className="font-display font-black text-lg text-foreground">Abilities Index</h2>
            <div className="space-y-3">
              {pokemon.abilities.length > 0 ? pokemon.abilities.map(ability => {
                const isShowingEffect = !!abilityDetails[ability.name]
                return (
                  <div key={ability.name} className="rounded-2xl border border-border p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-black capitalize text-foreground">{ability.name.replace(/-/g, ' ')}</p>
                      </div>
                      {ability.isHidden && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0" style={{ backgroundColor: `${BRAND}15`, color: BRAND }}>
                          Hidden
                        </span>
                      )}
                      <button
                        onClick={() => fetchAbilityEffect(ability.name)}
                        className="p-1 rounded hover:bg-muted/50 transition-colors shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Show effect"
                      >
                        {loadingAbilityName === ability.name ? (
                          <Loader2 className="w-4 h-4 animate-spin animate-infinite" />
                        ) : (
                          <Info className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {isShowingEffect && (
                      <p className="text-xs text-muted-foreground leading-relaxed italic border-t border-border/60 pt-2 mt-1">
                        &ldquo;{abilityDetails[ability.name]}&rdquo;
                      </p>
                    )}
                  </div>
                )
              }) : (
                <p className="text-sm text-muted-foreground italic">No ability data available.</p>
              )}
            </div>
          </div>

          {/* Evolution Pathway */}
          {pokemon.evolutionSteps.length > 0 && (
            <div className="glass-panel rounded-3xl border border-border p-6 space-y-4 md:col-span-2">
              <h2 className="font-display font-black text-lg text-foreground">Evolution Pathway</h2>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                {pokemon.evolutionSteps.map((step, idx) => {
                  const isCurrent = Number(step.id) === pokemon.id
                  return (
                    <React.Fragment key={step.name}>
                      <div className="flex flex-col items-center gap-1.5">
                        {isCurrent ? (
                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center p-1 border-2"
                            style={{ borderColor: BRAND, background: `${BRAND}15` }}>
                            <img
                              src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${step.id}.png`}
                              alt={step.name}
                              className="w-12 h-12 object-contain select-none pointer-events-none"
                            />
                          </div>
                        ) : (
                          <Link href={`/pokemon/${step.id}`}>
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center p-1 border border-border bg-card hover:border-brand-red transition-all cursor-pointer">
                              <img
                                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${step.id}.png`}
                                alt={step.name}
                                className="w-12 h-12 object-contain select-none pointer-events-none"
                              />
                            </div>
                          </Link>
                        )}
                        <span className="text-xs font-bold capitalize text-foreground">{step.name}</span>
                        {(step.level || step.item) && (
                          <span className="text-[10px] font-semibold text-muted-foreground capitalize">
                            {step.level ? `Lv. ${step.level}` : step.item?.replace(/-/g, ' ')}
                          </span>
                        )}
                      </div>
                      {idx < pokemon.evolutionSteps.length - 1 && (
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 rotate-90 md:rotate-0" />
                      )}
                    </React.Fragment>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
 
      {/* STATS & CALCULATOR */}
      {activeTab === 'Stats & Calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Stats gauges */}
          <div className="lg:col-span-7 glass-panel rounded-3xl border border-border p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-black text-lg text-foreground">Fighter Stats Calculator</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Calculated at level {level} with current modifiers</p>
              </div>
              <span className="font-fira px-3 py-1.5 rounded-lg border border-border text-xs font-black text-muted-foreground">
                BST: {pokemon.totalStats}
              </span>
            </div>

            <div className="space-y-4">
              {pokemon.stats.map((stat, i) => {
                const calcVal = calcStats[i]
                const pct = Math.min(100, (stat.val / 255) * 100)
                return (
                  <div key={stat.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-muted-foreground w-16">{stat.label}</span>
                      <span className="text-muted-foreground">
                        Base: {stat.val} |{' '}
                        <span className="font-black" style={{ color: BRAND }}>{calcVal}</span>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, backgroundColor: primaryTypeColor }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <p className="flex items-center gap-2 text-[10px] text-muted-foreground border-t border-border pt-4">
              <Info className="w-3.5 h-3.5 shrink-0" />
              HP utilizes an independent formula. Shedinja is hardlocked to 1 HP.
            </p>
          </div>

          {/* Control modifiers */}
          <div className="lg:col-span-5 glass-panel rounded-3xl border border-border p-6 space-y-5">
            <h2 className="font-display font-black text-lg text-foreground">Control Modifiers</h2>

            {/* Level slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                <span>Level</span>
                <span className="font-fira" style={{ color: BRAND }}>Lvl {level}</span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={level}
                onChange={e => setLevel(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ accentColor: BRAND }}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
                <span>1</span><span>50</span><span>100</span>
              </div>
            </div>

            {/* Nature */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nature</label>
              <select
                value={natureIndex}
                onChange={e => setNatureIndex(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background/50 text-foreground text-sm font-medium focus:outline-none focus:border-brand-red transition-all cursor-pointer"
              >
                {NATURES.map((n, i) => (
                  <option key={n.label} value={i}>{n.label}</option>
                ))}
              </select>
            </div>

            {/* Training presets */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Training Presets</label>
              <div className="grid grid-cols-2 gap-2">
                {EV_PRESETS.map((preset, i) => (
                  <button
                    key={preset.label}
                    onClick={() => setEvPresetIndex(i)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold text-left transition-all border ${
                      evPresetIndex === i
                        ? 'text-white border-transparent'
                        : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                    }`}
                    style={evPresetIndex === i ? { backgroundColor: BRAND } : {}}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MOVESET */}
      {activeTab === 'Moveset' && (
        <div className="glass-panel rounded-3xl border border-border p-6 space-y-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-display font-black text-lg text-foreground">Moveset Log</h2>
              <p className="text-xs text-muted-foreground mt-0.5">All recorded moves for this Pokémon</p>
            </div>
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search moves..."
                value={moveSearch}
                onChange={e => setMoveSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl border border-border bg-background/50 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand-red transition-all"
              />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {(['level-up', 'machine', 'tutor', 'egg'] as const).map(cat => (
              <button
                key={cat}
                onClick={() => setMoveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all capitalize border ${
                  moveCategory === cat
                    ? 'text-white border-transparent'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
                style={moveCategory === cat ? { backgroundColor: BRAND } : {}}
              >
                {cat === 'level-up' ? 'Level Up' : cat === 'machine' ? 'TM · HM' : cat === 'tutor' ? 'Tutor Moves' : 'Egg Moves'}
              </button>
            ))}
          </div>

          {/* Move table list */}
          <div className="overflow-y-auto max-h-87.5 custom-scrollbar border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/20 border-b border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {moveCategory === 'level-up' && <th className="px-4 py-3 w-16">Lvl</th>}
                  <th className="px-4 py-3">Move Name</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredMoves.length === 0 ? (
                  <tr>
                    <td colSpan={moveCategory === 'level-up' ? 3 : 2} className="px-4 py-8 text-center text-sm text-muted-foreground italic">
                      No moves recorded matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredMoves.map((move, i) => {
                    const isExpanded = expandedMove === move.name
                    const details = moveDetails[move.name]
                    const isLoading = loadingMoveName === move.name
                    return (
                      <React.Fragment key={`${move.name}-${i}`}>
                        <tr
                          onClick={() => toggleMoveExpansion(move.name)}
                          className="hover:bg-muted/30 transition-all cursor-pointer"
                        >
                          {moveCategory === 'level-up' && (
                            <td className="px-4 py-3 text-xs font-black font-fira text-muted-foreground">
                              {move.level || '—'}
                            </td>
                          )}
                          <td className="px-4 py-3 text-sm font-bold capitalize text-foreground">
                            {move.name.replace(/-/g, ' ')}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-xs font-bold transition-colors" style={{ color: BRAND }}>
                              {isExpanded ? 'Collapse' : 'Details'}
                            </span>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={moveCategory === 'level-up' ? 3 : 2} className="bg-muted/10 px-4 py-4">
                              {isLoading ? (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold py-2">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: BRAND }} />
                                  <span>Fetching Move Profile from Archive...</span>
                                </div>
                              ) : details ? (
                                <div className="space-y-3">
                                  <div className="flex gap-2 flex-wrap items-center">
                                    <span className="px-2.5 py-0.5 rounded text-[9px] font-black uppercase text-white"
                                      style={{ backgroundColor: getTypeColor(details.type) }}>
                                      {details.type}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded text-[9px] font-black uppercase bg-muted text-muted-foreground">
                                      {details.category}
                                    </span>
                                    <span className="text-xs font-semibold text-muted-foreground font-fira">
                                      Power: <strong className="text-foreground">{details.power ?? '—'}</strong>
                                    </span>
                                    <span className="text-xs font-semibold text-muted-foreground font-fira">
                                      Accuracy: <strong className="text-foreground">{details.accuracy ?? '—'}%</strong>
                                    </span>
                                    <span className="text-xs font-semibold text-muted-foreground font-fira">
                                      PP: <strong className="text-foreground">{details.pp ?? '—'}</strong>
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground leading-relaxed italic border-t border-border/40 pt-2">
                                    &ldquo;{details.description}&rdquo;
                                  </p>
                                </div>
                              ) : (
                                <span className="text-xs text-rose-400 font-semibold">Failed to load move details.</span>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SPRITES GRID */}
      {activeTab === 'Sprites Grid' && (
        <div className="glass-panel rounded-3xl border border-border p-6 space-y-4">
          <div>
            <h2 className="font-display font-black text-lg text-foreground">Pixel Sprites Registry</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Pixel render assets extracted from archives</p>
          </div>

          {loadingSprites ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND }} />
            </div>
          ) : spritesData ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 justify-items-center">
              {[
                { key: 'front_default', label: 'Front Default' },
                { key: 'back_default', label: 'Back Default' },
                { key: 'front_shiny', label: 'Front Shiny' },
                { key: 'back_shiny', label: 'Back Shiny' },
                { key: 'front_female', label: 'Front Female' },
                { key: 'back_female', label: 'Back Female' },
                { key: 'front_shiny_female', label: 'Shiny Female Front' },
                { key: 'back_shiny_female', label: 'Shiny Female Back' },
              ].map(item => {
                const url = spritesData[item.key]
                if (!url) return null
                return (
                  <div key={item.key} className="glass-panel rounded-2xl border border-border p-4 flex flex-col items-center justify-center w-36 h-36 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-24 h-24 rounded-xl bg-muted/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <img src={url} alt={item.label} className="w-20 h-20 object-contain pixelated" />
                    </div>
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider mt-2.5 text-center">
                      {item.label}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic py-6 text-center">No pixel sprites available.</p>
          )}
        </div>
      )}

      {/* LOCATIONS */}
      {activeTab === 'Locations' && (
        <div className="glass-panel rounded-3xl border border-border p-6 space-y-4">
          <div>
            <h2 className="font-display font-black text-lg text-foreground">Wild Encounter Locations</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Known coordinate grids and native regions</p>
          </div>

          {loadingLocations ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND }} />
            </div>
          ) : locationsData && locationsData.length > 0 ? (
            <div className="overflow-y-auto max-h-87.5 custom-scrollbar space-y-2 pr-1">
              {locationsData.map((loc: any, i: number) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-border bg-card/45 hover:bg-muted/10 transition-all">
                  <span className="text-xs font-bold capitalize text-foreground">
                    {loc.location_area?.name?.replace(/-/g, ' ')}
                  </span>
                  <div className="flex gap-1 flex-wrap">
                    {loc.version_details?.map((v: any) => (
                      <span key={v.version?.name} className="px-2 py-0.5 rounded text-[8px] font-black uppercase bg-muted text-muted-foreground border border-border/80">
                        {v.version?.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <HelpCircle className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground italic">
                No wild encounter locations recorded in base archives. Likely evolved or event-only.
              </p>
            </div>
          )}
        </div>
      )}

      {/* MATCHUPS */}
      {activeTab === 'Matchups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Weaknesses */}
          <div className="glass-panel rounded-3xl border border-border p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" style={{ color: BRAND }} />
              <h2 className="font-display font-black text-lg text-foreground">Weaknesses</h2>
            </div>
            <p className="text-xs text-muted-foreground">Types that deal double or quadruple damage to this Pokémon.</p>
            {pokemon.weaknesses.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {pokemon.weaknesses.map(([type, mult]) => (
                  <div key={type} className="flex items-center gap-2 p-2 rounded-xl border border-border">
                    <span
                      className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase text-white flex-1"
                      style={{ backgroundColor: getTypeColor(type) }}
                    >
                      {type}
                    </span>
                    <span className="text-xs font-black shrink-0" style={{ color: BRAND }}>{mult}×</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No significant weaknesses.</p>
            )}
          </div>

          {/* Resistances & Immunities */}
          <div className="glass-panel rounded-3xl border border-border p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h2 className="font-display font-black text-lg text-foreground">Resistances &amp; Immunities</h2>
            </div>
            <p className="text-xs text-muted-foreground">Types that deal reduced or zero damage to this Pokémon.</p>
            {pokemon.resistances.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {pokemon.resistances.map(([type, mult]) => (
                  <div key={type} className="flex items-center gap-2 p-2 rounded-xl border border-border">
                    <span
                      className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase text-white flex-1"
                      style={{ backgroundColor: getTypeColor(type) }}
                    >
                      {type}
                    </span>
                    <span className={`text-xs font-black shrink-0 ${mult === 0 ? 'text-blue-400' : 'text-emerald-400'}`}>
                      {mult}×
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">No resistances or immunities.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
