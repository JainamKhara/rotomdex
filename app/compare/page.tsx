'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Swords } from 'lucide-react'

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
  isFinal?: boolean
  isBaby?: boolean
}

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

const getEffectivenessMultiplier = (attackType: string, defenseTypes: string[]) => {
  let multiplier = 1
  const match = typeMatchups[attackType.toLowerCase()]
  if (!match) return 1
  for (const defType of defenseTypes) {
    const key = defType.toLowerCase()
    if (key in match) {
      multiplier *= match[key]
    }
  }
  return multiplier
}
const getEvolutionStatus = (pokemon: Pokemon) => {
  if (pokemon.legend || pokemon.mythical) return "Single Stage"
  const singleStageNames = ['arceus', 'mew', 'celebi', 'jirachi', 'deoxys', 'phione', 'manaphy', 'darkrai', 'shaymin', 'victini', 'keldeo', 'meloetta', 'genesect', 'diancie', 'hoopa', 'volcanion', 'magearna', 'marshadow', 'zeraora', 'meltan', 'melmetal', 'zarude', 'regieleki', 'regidrago', 'glastrier', 'spectrier', 'calyrex', 'enamorus', 'ditto', 'pinsir', 'tauros', 'lapras', 'aerodactyl', 'skarmory', 'miltank', 'girafarig', 'dunsparce', 'qwilfish', 'shuckle', 'corsola', 'delibird', 'stantler', 'smeargle', 'sableye', 'mawile', 'torkoal', 'spinda', 'zangoose', 'seviper', 'solrock', 'lunatone', 'castform', 'chimecho', 'luvdisc', 'relicanth', 'packirisu', 'buizel', 'ambipom', 'carnivine', 'chatot', 'spiritomb', 'rotom', 'audino', 'throh', 'sawk', 'basculin', 'maractus', 'sigilyph', 'emolga', 'alomomola', 'cryogonal', 'druddigon', 'bouffalant', 'heatmor', 'durant', 'stfisk', 'hawlucha', 'dedenne', 'klefki', 'carbink', 'drampa', 'turtonator', 'togedemaru', 'mimikyu', 'bruxish', 'dhelmise', 'pyukumuku', 'minior', 'komala', 'falinks', 'pincurchin', 'stonjourner', 'euduradon', 'morpeko', 'cramorant', 'duraludon', 'wishiwashi', 'comfey', 'passimian', 'oranguru']
  if (singleStageNames.includes(pokemon.name.toLowerCase())) {
    return "Single Stage"
  }
  if (pokemon.isFinal) return "Fully Evolved"
  if (pokemon.isBaby) return "Baby"
  return "Can Evolve"
}

export default function ComparePage() {
  const [pokeId1, setPokeId1] = useState<number>(1) // Bulbasaur
  const [pokeId2, setPokeId2] = useState<number>(4) // Charmander

  // Generation filter states
  const [leftGen, setLeftGen] = useState<number | 'all'>('all')
  const [rightGen, setRightGen] = useState<number | 'all'>('all')

  // Search states
  const [leftSearch, setLeftSearch] = useState<string>('')
  const [rightSearch, setRightSearch] = useState<string>('')

  // Combobox open states
  const [leftOpen, setLeftOpen] = useState<boolean>(false)
  const [rightOpen, setRightOpen] = useState<boolean>(false)

  // Fetch all available Pokémon (limit 1025 to cover all active generations)
  const { data: pokemonListRes } = useQuery({
    queryKey: ['pokemon-list-compare'],
    queryFn: async () => {
      const res = await fetch('/api/pokemon?limit=1025')
      if (!res.ok) throw new Error('Failed to fetch list')
      return res.json()
    },
  })

  const pokemonList: Pokemon[] = pokemonListRes?.data || []

  // Fetch full details only for the 2 compared combatant IDs (includes evolution branches check)
  const { data: detailsRes } = useQuery({
    queryKey: ['pokemon-details-compare', pokeId1, pokeId2],
    queryFn: async () => {
      const res = await fetch(`/api/pokemon?ids=${pokeId1},${pokeId2}`)
      if (!res.ok) throw new Error('Failed to fetch details')
      return res.json()
    },
    enabled: !!pokeId1 && !!pokeId2,
  })

  const detailsList: Pokemon[] = detailsRes?.data || []
  const pokemon1 = detailsList.find((p) => p.id === pokeId1) || pokemonList.find((p) => p.id === pokeId1)
  const pokemon2 = detailsList.find((p) => p.id === pokeId2) || pokemonList.find((p) => p.id === pokeId2)

  const handleLeftGenChange = (genVal: string) => {
    const gen = genVal === 'all' ? 'all' : Number(genVal)
    setLeftGen(gen)
    const filtered = pokemonList.filter(p => gen === 'all' || p.generation === gen)
    if (filtered.length > 0) {
      const exists = filtered.some(p => p.id === pokeId1)
      if (!exists) {
        setPokeId1(filtered[0].id)
      }
    }
  }

  const handleRightGenChange = (genVal: string) => {
    const gen = genVal === 'all' ? 'all' : Number(genVal)
    setRightGen(gen)
    const filtered = pokemonList.filter(p => gen === 'all' || p.generation === gen)
    if (filtered.length > 0) {
      const exists = filtered.some(p => p.id === pokeId2)
      if (!exists) {
        setPokeId2(filtered[0].id)
      }
    }
  }

  const filteredLeftOptions = pokemonList.filter(p => {
    const matchesGen = leftGen === 'all' || p.generation === leftGen
    const matchesSearch = p.name.toLowerCase().includes(leftSearch.toLowerCase()) || String(p.id).includes(leftSearch)
    return matchesGen && matchesSearch
  })

  const filteredRightOptions = pokemonList.filter(p => {
    const matchesGen = rightGen === 'all' || p.generation === rightGen
    const matchesSearch = p.name.toLowerCase().includes(rightSearch.toLowerCase()) || String(p.id).includes(rightSearch)
    return matchesGen && matchesSearch
  })

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'fire': return '#F08030'
      case 'water': return '#6890F0'
      case 'grass': return '#78C850'
      case 'electric': return '#F7D02C'
      case 'ice': return '#98D8D8'
      case 'fighting': return '#C03028'
      case 'poison': return '#A040A0'
      case 'ground': return '#E0C068'
      case 'flying': return '#A890F0'
      case 'psychic': return '#F85888'
      case 'bug': return '#A8B820'
      case 'rock': return '#B8A038'
      case 'ghost': return '#705898'
      case 'dragon': return '#7038F8'
      case 'dark': return '#705848'
      case 'steel': return '#B8B8D0'
      case 'fairy': return '#EE99AC'
      default: return '#A8A878'
    }
  }

  const stats = [
    { label: 'HP', key: 'hp' as keyof Pokemon },
    { label: 'Attack', key: 'attack' as keyof Pokemon },
    { label: 'Defense', key: 'defense' as keyof Pokemon },
    { label: 'Sp. Atk', key: 'spAtk' as keyof Pokemon },
    { label: 'Sp. Def', key: 'spDef' as keyof Pokemon },
    { label: 'Speed', key: 'speed' as keyof Pokemon },
  ]

  return (
    <div className="min-h-screen flex flex-col text-slate-800 dark:text-slate-100 font-sans">
      {/* TopNavBar */}
      <nav className="sticky top-0 w-full h-[72px] z-50 bg-white/80 dark:bg-slate-950/40 backdrop-blur-md border-b border-slate-200/60 dark:border-white/5">
        <div className="flex justify-between items-center px-6 w-full max-w-7xl mx-auto h-full">
          <Logo />
          <ul className="hidden md:flex gap-6 h-full items-center">
            <li className="h-full flex items-center">
              <Link className="text-sm text-slate-605 dark:text-slate-300 hover:text-brand-red font-semibold transition-colors h-full flex items-center" href="/">Home</Link>
            </li>
            <li className="h-full flex items-center">
              <Link className="text-sm text-slate-605 dark:text-slate-300 hover:text-brand-red font-semibold transition-colors h-full flex items-center" href="/pokedex">Pokédex</Link>
            </li>
            <li className="h-full flex items-center">
              <Link className="text-sm text-brand-red font-bold border-b-2 border-brand-red h-full flex items-center" href="/compare">Compare</Link>
            </li>
            <li className="h-full flex items-center">
              <Link className="text-sm text-slate-605 dark:text-slate-300 hover:text-brand-red font-semibold transition-colors h-full flex items-center" href="/teams">Teams</Link>
            </li>
            <li className="h-full flex items-center">
              <Link className="text-sm text-slate-605 dark:text-slate-300 hover:text-brand-red font-semibold transition-colors h-full flex items-center" href="/about">About</Link>
            </li>
          </ul>
          <div className="flex gap-4 items-center">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto w-full px-6 py-10 flex-1 space-y-8">
        <section className="text-center space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <Swords className="w-7 h-7 text-brand-red" /> Battle Arena Comparison
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Select two combatants to pit their stats and elemental types against each other.</p>
        </section>

        {/* Selection panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-none relative z-30">
          
          {/* Slot 1 Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end relative">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-450">Left Gen</label>
              <select
                value={leftGen}
                onChange={(e) => handleLeftGenChange(e.target.value)}
                className="w-full px-3.5 py-3 border rounded-2xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-white/10 focus:outline-none text-sm font-semibold capitalize cursor-pointer font-sans"
              >
                <option value="all">All Gen</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((genNum) => (
                  <option key={genNum} value={genNum}>Gen {genNum}</option>
                ))}
              </select>
            </div>
            
            {/* Searchable Select Bar */}
            <div className="flex flex-col gap-2 sm:col-span-2 relative">
              <label className="text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-450">Pokémon Left</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search and select Pokémon..."
                  value={leftOpen ? leftSearch : (pokemon1 ? `${pokemon1.name} (#${pokemon1.id})` : "")}
                  onChange={(e) => {
                    setLeftSearch(e.target.value)
                    if (!leftOpen) setLeftOpen(true)
                  }}
                  onFocus={() => {
                    setLeftSearch("")
                    setLeftOpen(true)
                  }}
                  onBlur={() => {
                    setTimeout(() => setLeftOpen(false), 250)
                  }}
                  className="w-full px-5 py-3 border rounded-2xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all cursor-pointer text-sm font-semibold capitalize font-sans"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none select-none">▼</span>
              </div>

              {/* Options list dropdown */}
              {leftOpen && (
                <div className="absolute top-[76px] left-0 w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl max-h-60 overflow-y-auto z-50 custom-scrollbar divide-y divide-slate-100 dark:divide-white/5">
                  {filteredLeftOptions.length > 0 ? (
                    filteredLeftOptions.map((p) => (
                      <div
                        key={p.id}
                        onMouseDown={() => {
                          setPokeId1(p.id)
                          setLeftOpen(false)
                        }}
                        className="px-5 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer capitalize flex items-center justify-between"
                      >
                        <span>{p.name}</span>
                        <span className="text-xs text-slate-400">#{p.id}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-5 py-3 text-xs text-slate-400 text-center">
                      No Pokémon found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Slot 2 Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end relative">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-450">Right Gen</label>
              <select
                value={rightGen}
                onChange={(e) => handleRightGenChange(e.target.value)}
                className="w-full px-3.5 py-3 border rounded-2xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-white/10 focus:outline-none text-sm font-semibold capitalize cursor-pointer font-sans"
              >
                <option value="all">All Gen</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((genNum) => (
                  <option key={genNum} value={genNum}>Gen {genNum}</option>
                ))}
              </select>
            </div>
            
            {/* Searchable Select Bar */}
            <div className="flex flex-col gap-2 sm:col-span-2 relative">
              <label className="text-xs font-black uppercase tracking-wider text-slate-450 dark:text-slate-450">Pokémon Right</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search and select Pokémon..."
                  value={rightOpen ? rightSearch : (pokemon2 ? `${pokemon2.name} (#${pokemon2.id})` : "")}
                  onChange={(e) => {
                    setRightSearch(e.target.value)
                    if (!rightOpen) setRightOpen(true)
                  }}
                  onFocus={() => {
                    setRightSearch("")
                    setRightOpen(true)
                  }}
                  onBlur={() => {
                    setTimeout(() => setRightOpen(false), 250)
                  }}
                  className="w-full px-5 py-3 border rounded-2xl bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all cursor-pointer text-sm font-semibold capitalize font-sans"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none select-none">▼</span>
              </div>

              {/* Options list dropdown */}
              {rightOpen && (
                <div className="absolute top-[76px] left-0 w-full bg-white dark:bg-slate-955 border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl max-h-60 overflow-y-auto z-50 custom-scrollbar divide-y divide-slate-100 dark:divide-white/5">
                  {filteredRightOptions.length > 0 ? (
                    filteredRightOptions.map((p) => (
                      <div
                        key={p.id}
                        onMouseDown={() => {
                          setPokeId2(p.id)
                          setRightOpen(false)
                        }}
                        className="px-5 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer capitalize flex items-center justify-between"
                      >
                        <span>{p.name}</span>
                        <span className="text-xs text-slate-400">#{p.id}</span>
                      </div>
                    ))
                  ) : (
                    <div className="px-5 py-3 text-xs text-slate-400 text-center">
                      No Pokémon found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

            {/* Side-by-Side Comparison details */}
        {pokemon1 && pokemon2 ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
            {/* Pokemon 1 details card */}
            <div 
              className="col-span-1 md:col-span-4 bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-none flex flex-col justify-between transition-all duration-300"
              style={{ 
                borderColor: `${getTypeColor(pokemon1.types[0])}30`,
                background: `linear-gradient(135deg, ${getTypeColor(pokemon1.types[0])}10 0%, transparent 100%)`
              }}
            >
              <div className="flex flex-col items-center">
                <div 
                  className="w-full h-48 rounded-2xl flex items-center justify-center relative mb-4"
                  style={{ backgroundColor: `${getTypeColor(pokemon1.types[0])}15` }}
                >
                  <Image src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon1.id}.png`} alt={pokemon1.name} width={140} height={140} className="object-contain drop-shadow-md hover:scale-105 transition-transform" />
                </div>
                <div className="space-y-1 text-center">
                  <span className="text-xs font-black text-slate-450 dark:text-slate-555 font-mono">#{String(pokemon1.id).padStart(4, '0')}</span>
                  <h2 className="text-3xl font-black capitalize text-slate-900 dark:text-white mt-0.5 tracking-tight">{pokemon1.name}</h2>
                  <div className="flex gap-1.5 justify-center mt-2">
                    {pokemon1.types.map(t => (
                      <span 
                        key={t}
                        className="text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm select-none"
                        style={{ backgroundColor: getTypeColor(t) }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Physical specifications inside card to avoid empty card layout */}
              <div className="w-full mt-6 space-y-3 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-650 dark:text-slate-350">
                  <span className="text-slate-450 uppercase text-[10px] font-black tracking-wider">Height</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{pokemon1.height ? `${(pokemon1.height / 10).toFixed(1)} m` : 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-650 dark:text-slate-350">
                  <span className="text-slate-450 uppercase text-[10px] font-black tracking-wider">Weight</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{pokemon1.weight ? `${(pokemon1.weight / 10).toFixed(1)} kg` : 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-650 dark:text-slate-350">
                  <span className="text-slate-450 uppercase text-[10px] font-black tracking-wider">Base EXP</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{pokemon1.baseExp ? pokemon1.baseExp : 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-650 dark:text-slate-350">
                  <span className="text-slate-455 uppercase text-[10px] font-black tracking-wider">Catch Rate</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{pokemon1.catchRate ? pokemon1.catchRate : 'Unknown'}</span>
                </div>
              </div>

              {/* Rarity & Evolution Status inside card */}
              <div className="mt-4 flex flex-wrap gap-1.5 justify-center w-full">
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-black uppercase px-2 py-1 rounded-md shadow-xs select-none">
                  {getEvolutionStatus(pokemon1)}
                </span>
                {pokemon1.legend && <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-2 py-1 rounded-md shadow-xs select-none">Legendary</span>}
                {pokemon1.mythical && <span className="bg-purple-500 text-white text-[9px] font-black uppercase px-2 py-1 rounded-md shadow-xs select-none">Mythical</span>}
              </div>
            </div>

            {/* Middle Stats comparison chart */}
            <div className="col-span-1 md:col-span-4 bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-none flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-center font-black text-slate-900 dark:text-white text-xs uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-3">
                  Base Stat Matchup
                </h3>
                <div className="space-y-4 pt-4">
                  {stats.map((stat) => {
                    const val1 = Number(pokemon1[stat.key]) || 0
                    const val2 = Number(pokemon2[stat.key]) || 0
                    const total = val1 + val2 === 0 ? 1 : val1 + val2
                    const percent1 = (val1 / total) * 100
                    const percent2 = (val2 / total) * 100

                    const color1 = getTypeColor(pokemon1.types[0])
                    const color2 = getTypeColor(pokemon2.types[0])

                    return (
                      <div key={stat.label} className="space-y-1.5 text-xs">
                        <div className="flex justify-between items-center font-mono">
                          <span className="font-black text-sm" style={{ color: val1 > val2 ? color1 : 'inherit' }}>
                            {val1}
                          </span>
                          <span className="text-slate-505 dark:text-slate-400 font-extrabold uppercase text-[10px] tracking-wider">
                            {stat.label}
                          </span>
                          <span className="font-black text-sm" style={{ color: val2 > val1 ? color2 : 'inherit' }}>
                            {val2}
                          </span>
                        </div>
                        <div className="h-3.5 w-full bg-slate-100 dark:bg-slate-950/60 rounded-full flex overflow-hidden border border-slate-200/50 dark:border-white/5 shadow-inner">
                          <div 
                            className="h-full transition-all duration-500 rounded-l-full"
                            style={{ 
                              width: `${percent1}%`,
                              backgroundColor: color1
                            }}
                          />
                          <div 
                            className="h-full transition-all duration-500 rounded-r-full"
                            style={{ 
                              width: `${percent2}%`,
                              backgroundColor: color2
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Display total advantage */}
              <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-150 dark:border-white/5 rounded-2xl p-4 text-center">
                <span className="text-[10px] font-black text-slate-455 dark:text-slate-500 uppercase tracking-widest block mb-1">Combat Rating Advantage</span>
                {(() => {
                  const t1 = pokemon1.hp + pokemon1.attack + pokemon1.defense + pokemon1.spAtk + pokemon1.spDef + pokemon1.speed
                  const t2 = pokemon2.hp + pokemon2.attack + pokemon2.defense + pokemon2.spAtk + pokemon2.spDef + pokemon2.speed
                  if (t1 > t2) {
                    return (
                      <span className="text-xs font-black text-slate-800 dark:text-white">
                        {pokemon1.name} leads by <span className="text-brand-blue font-bold">{t1 - t2}</span> BST points
                      </span>
                    )
                  } else if (t2 > t1) {
                    return (
                      <span className="text-xs font-black text-slate-800 dark:text-white">
                        {pokemon2.name} leads by <span className="text-brand-red font-bold">{t2 - t1}</span> BST points
                      </span>
                    )
                  }
                  return (
                    <span className="text-xs font-black text-slate-800 dark:text-white">
                      Perfect combat rating equality!
                    </span>
                  )
                })()}
              </div>
            </div>

            {/* Pokemon 2 details card */}
            <div 
              className="col-span-1 md:col-span-4 bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-none flex flex-col justify-between transition-all duration-300"
              style={{ 
                borderColor: `${getTypeColor(pokemon2.types[0])}30`,
                background: `linear-gradient(135deg, ${getTypeColor(pokemon2.types[0])}10 0%, transparent 100%)`
              }}
            >
              <div className="flex flex-col items-center">
                <div 
                  className="w-full h-48 rounded-2xl flex items-center justify-center relative mb-4"
                  style={{ backgroundColor: `${getTypeColor(pokemon2.types[0])}15` }}
                >
                  <Image src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon2.id}.png`} alt={pokemon2.name} width={140} height={140} className="object-contain drop-shadow-md hover:scale-105 transition-transform" />
                </div>
                <div className="space-y-1 text-center">
                  <span className="text-xs font-black text-slate-450 dark:text-slate-555 font-mono">#{String(pokemon2.id).padStart(4, '0')}</span>
                  <h2 className="text-3xl font-black capitalize text-slate-900 dark:text-white mt-0.5 tracking-tight">{pokemon2.name}</h2>
                  <div className="flex gap-1.5 justify-center mt-2">
                    {pokemon2.types.map(t => (
                      <span 
                        key={t}
                        className="text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm select-none"
                        style={{ backgroundColor: getTypeColor(t) }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Physical specifications inside card to avoid empty card layout */}
              <div className="w-full mt-6 space-y-3 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-650 dark:text-slate-350">
                  <span className="text-slate-450 uppercase text-[10px] font-black tracking-wider">Height</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{pokemon2.height ? `${(pokemon2.height / 10).toFixed(1)} m` : 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-650 dark:text-slate-350">
                  <span className="text-slate-450 uppercase text-[10px] font-black tracking-wider">Weight</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{pokemon2.weight ? `${(pokemon2.weight / 10).toFixed(1)} kg` : 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-650 dark:text-slate-350">
                  <span className="text-slate-455 uppercase text-[10px] font-black tracking-wider">Base EXP</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{pokemon2.baseExp ? pokemon2.baseExp : 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-650 dark:text-slate-350">
                  <span className="text-slate-450 uppercase text-[10px] font-black tracking-wider">Catch Rate</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{pokemon2.catchRate ? pokemon2.catchRate : 'Unknown'}</span>
                </div>
              </div>

              {/* Rarity & Evolution Status inside card */}
              <div className="mt-4 flex flex-wrap gap-1.5 justify-center w-full">
                <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-black uppercase px-2 py-1 rounded-md shadow-xs select-none">
                  {getEvolutionStatus(pokemon2)}
                </span>
                {pokemon2.legend && <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-2 py-1 rounded-md shadow-xs select-none">Legendary</span>}
                {pokemon2.mythical && <span className="bg-purple-500 text-white text-[9px] font-black uppercase px-2 py-1 rounded-md shadow-xs select-none">Mythical</span>}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-slate-500 dark:text-slate-400 text-sm py-10">Loading comparison details...</div>
        )}

        {/* Detailed Comparisons Grid */}
        {pokemon1 && pokemon2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            
            {/* Dimensions & Training Section */}
            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-none space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-3">
                📐 Size & Training Stats
              </h3>
              <div className="space-y-4">
                {/* Height Row */}
                <div className="flex justify-between items-center py-2 border-b border-slate-100/50 dark:border-white/5">
                  <div className="text-sm font-black text-slate-800 dark:text-slate-200 capitalize">
                    {pokemon1.height ? `${(pokemon1.height / 10).toFixed(1)}m` : 'Unknown'}
                  </div>
                  <div className="text-xs text-slate-400 font-extrabold uppercase tracking-wider text-center">
                    Height
                  </div>
                  <div className="text-sm font-black text-slate-800 dark:text-slate-200 capitalize text-right">
                    {pokemon2.height ? `${(pokemon2.height / 10).toFixed(1)}m` : 'Unknown'}
                  </div>
                </div>
                {/* Weight Row */}
                <div className="flex justify-between items-center py-2 border-b border-slate-100/50 dark:border-white/5">
                  <div className="text-sm font-black text-slate-800 dark:text-slate-200 capitalize">
                    {pokemon1.weight ? `${(pokemon1.weight / 10).toFixed(1)}kg` : 'Unknown'}
                  </div>
                  <div className="text-xs text-slate-400 font-extrabold uppercase tracking-wider text-center">
                    Weight
                  </div>
                  <div className="text-sm font-black text-slate-800 dark:text-slate-200 capitalize text-right">
                    {pokemon2.weight ? `${(pokemon2.weight / 10).toFixed(1)}kg` : 'Unknown'}
                  </div>
                </div>
                {/* Base Experience */}
                <div className="flex justify-between items-center py-2 border-b border-slate-100/50 dark:border-white/5">
                  <div className="text-sm font-black text-slate-800 dark:text-slate-200 capitalize">
                    {pokemon1.baseExp ? `${pokemon1.baseExp} xp` : 'Unknown'}
                  </div>
                  <div className="text-xs text-slate-400 font-extrabold uppercase tracking-wider text-center">
                    Base Exp
                  </div>
                  <div className="text-sm font-black text-slate-800 dark:text-slate-200 capitalize text-right">
                    {pokemon2.baseExp ? `${pokemon2.baseExp} xp` : 'Unknown'}
                  </div>
                </div>
                {/* Catch Rate */}
                <div className="flex justify-between items-center py-2">
                  <div className="text-sm font-black text-slate-800 dark:text-slate-200 capitalize">
                    {pokemon1.catchRate ? pokemon1.catchRate : 'Unknown'}
                  </div>
                  <div className="text-xs text-slate-400 font-extrabold uppercase tracking-wider text-center">
                    Catch Rate
                  </div>
                  <div className="text-sm font-black text-slate-800 dark:text-slate-200 capitalize text-right">
                    {pokemon2.catchRate ? pokemon2.catchRate : 'Unknown'}
                  </div>
                </div>
              </div>

              {/* Dimension Verdict Text */}
              <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-4 text-center text-xs space-y-1.5 border border-slate-100 dark:border-white/5">
                {pokemon1.height && pokemon2.height && (
                  <p className="font-semibold text-slate-650 dark:text-slate-350">
                    {pokemon1.name} is <span className="font-bold text-slate-900 dark:text-white">
                      {pokemon1.height >= pokemon2.height 
                        ? `${(pokemon1.height / pokemon2.height).toFixed(1)}x taller` 
                        : `${(pokemon2.height / pokemon1.height).toFixed(1)}x shorter`}
                    </span> than {pokemon2.name}.
                  </p>
                )}
                {pokemon1.weight && pokemon2.weight && (
                  <p className="font-semibold text-slate-650 dark:text-slate-350">
                    {pokemon1.name} is <span className="font-bold text-slate-900 dark:text-white">
                      {pokemon1.weight >= pokemon2.weight 
                        ? `${(pokemon1.weight / pokemon2.weight).toFixed(1)}x heavier` 
                        : `${(pokemon2.weight / pokemon1.weight).toFixed(1)}x lighter`}
                    </span> than {pokemon2.name}.
                  </p>
                )}
              </div>
            </div>

            {/* Type Combat Advantage Section */}
            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-none space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-3">
                ⚔️ Rotom-Dex Battle Verdict
              </h3>
              
              <div className="space-y-4">
                {/* Dynamic Summary Statement */}
                <div className="bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-white/5 rounded-2xl p-4 space-y-3">
                  {(() => {
                    const mult1 = getEffectivenessMultiplier(pokemon1.types[0], pokemon2.types)
                    const mult2 = getEffectivenessMultiplier(pokemon2.types[0], pokemon1.types)
                    
                    let typeVerdict = ""
                    if (mult1 > mult2) {
                      typeVerdict = `Elemental Advantage: ${pokemon1.name} holds the upper hand! Its ${pokemon1.types[0]} attacks deal ${mult1}x damage, while receiving only ${mult2}x damage in return.`
                    } else if (mult2 > mult1) {
                      typeVerdict = `Elemental Advantage: ${pokemon2.name} holds the upper hand! Its ${pokemon2.types[0]} attacks deal ${mult2}x damage, while receiving only ${mult1}x damage in return.`
                    } else {
                      typeVerdict = `Elemental Advantage: Even match! Both fighters deal equivalent ${mult1}x type effectiveness against one another.`
                    }

                    const bst1 = pokemon1.hp + pokemon1.attack + pokemon1.defense + pokemon1.spAtk + pokemon1.spDef + pokemon1.speed
                    const bst2 = pokemon2.hp + pokemon2.attack + pokemon2.defense + pokemon2.spAtk + pokemon2.spDef + pokemon2.speed
                    
                    let overallWinner = pokemon1.name
                    let reasonText = ""
                    if (mult1 > mult2) {
                      overallWinner = pokemon1.name
                      reasonText = `due to its super effective elemental type advantage (${mult1}x effectiveness).`
                    } else if (mult2 > mult1) {
                      overallWinner = pokemon2.name
                      reasonText = `due to its super effective elemental type advantage (${mult2}x effectiveness).`
                    } else {
                      if (bst1 > bst2) {
                        overallWinner = pokemon1.name
                        reasonText = `because it has a higher overall Base Stat Total (+${bst1 - bst2} points).`
                      } else if (bst2 > bst1) {
                        overallWinner = pokemon2.name
                        reasonText = `because it has a higher overall Base Stat Total (+${bst2 - bst1} points).`
                      } else {
                        overallWinner = "Draw"
                        reasonText = `as both fighters have identical stats and type advantages!`
                      }
                    }

                    return (
                      <div className="space-y-3">
                        <div className="text-xs font-bold text-slate-650 dark:text-slate-350">
                          <span className="font-black text-brand-red block mb-1 uppercase tracking-widest text-[10px]">Type Matchup Analysis</span>
                          {typeVerdict}
                        </div>
                        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 border-t border-slate-100 dark:border-white/5 pt-3">
                          <span className="text-xs font-black text-brand-blue block mb-1 uppercase tracking-widest text-[10px]">Predicted Winner</span>
                          {overallWinner === "Draw" ? (
                            <span>The battle is a perfect draw!</span>
                          ) : (
                            <span>
                              <strong className="capitalize text-base font-black text-slate-900 dark:text-white mr-1">{overallWinner}</strong>
                              is predicted to win this matchup {reasonText}
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })()}
                </div>

                {/* Rarity & Evolution Badges */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-3 border border-slate-100 dark:border-white/5 space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{pokemon1.name} Status</span>
                    <div className="flex flex-wrap gap-1">
                      <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                        {getEvolutionStatus(pokemon1)}
                      </span>
                      {pokemon1.legend && <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md">Legendary</span>}
                      {pokemon1.mythical && <span className="bg-purple-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md">Mythical</span>}
                    </div>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-3 border border-slate-100 dark:border-white/5 space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">{pokemon2.name} Status</span>
                    <div className="flex flex-wrap gap-1">
                      <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                        {getEvolutionStatus(pokemon2)}
                      </span>
                      {pokemon2.legend && <span className="bg-amber-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md">Legendary</span>}
                      {pokemon2.mythical && <span className="bg-purple-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-md">Mythical</span>}
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-slate-950/20 flex flex-col items-center justify-center text-center px-6">
        <Logo className="mb-3" />
        <p className="text-[11px] text-slate-455 dark:text-slate-550 max-w-2xl">
          Data provided by PokéAPI. Pokémon and Pokémon character names are trademarks of Nintendo.
        </p>
      </footer>
    </div>
  )
}
