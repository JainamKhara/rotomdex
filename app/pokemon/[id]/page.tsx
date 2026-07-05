import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MovesList } from '@/components/MovesList'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Ruler, Weight } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

async function fetchEverythingAboutPokemon(id: number) {
  try {
    const [pokemonRes, speciesRes] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
    ])

    if (!pokemonRes.ok || !speciesRes.ok) return null

    const pokemon = await pokemonRes.json()
    const species = await speciesRes.json()

    // Evolution chain
    const evoChainUrl = species.evolution_chain?.url
    let evolutionSteps: { name: string; id: string; level: number | null; item: string | null }[] = []

    if (evoChainUrl) {
      const evoRes = await fetch(evoChainUrl)
      if (evoRes.ok) {
        const evoData = await evoRes.json()
        let currentStep = evoData.chain
        while (currentStep) {
          const speciesUrlParts = currentStep.species.url.split('/')
          const id = speciesUrlParts[speciesUrlParts.length - 2]
          
          const details = currentStep.evolution_details?.[0]
          evolutionSteps.push({
            name: currentStep.species.name,
            id,
            level: details?.min_level || null,
            item: details?.item?.name || null,
          })
          currentStep = currentStep.evolves_to?.[0]
        }
      }
    }

    // Type weaknesses & resistances
    const types = pokemon.types.map((t: any) => t.type.name)
    const weaknessesMap: Record<string, number> = {}

    for (const type of types) {
      const typeRes = await fetch(`https://pokeapi.co/api/v2/type/${type}`)
      if (typeRes.ok) {
        const typeData = await typeRes.json()
        
        typeData.damage_relations.double_damage_from.forEach((t: any) => {
          weaknessesMap[t.name] = (weaknessesMap[t.name] || 1) * 2
        })
        typeData.damage_relations.half_damage_from.forEach((t: any) => {
          weaknessesMap[t.name] = (weaknessesMap[t.name] || 1) * 0.5
        })
        typeData.damage_relations.no_damage_from.forEach((t: any) => {
          weaknessesMap[t.name] = 0
        })
      }
    }

    const weaknesses = Object.entries(weaknessesMap).filter(([_, val]) => val > 1)
    const resistances = Object.entries(weaknessesMap).filter(([_, val]) => val < 1 && val > 0)

    // Fetch move type & power details in parallel (limit to 80 moves for comprehensive details screen)
    const levelUpMoves = pokemon.moves
      .map((m: any) => ({
        name: m.move.name,
        url: m.move.url,
        method: m.version_group_details[0]?.move_learn_method.name || 'level-up',
        level: m.version_group_details[0]?.level_learned_at || 0,
      }))
      .filter((m: any) => m.method === 'level-up' || m.method === 'machine')
      .sort((a: any, b: any) => a.level - b.level)
      .slice(0, 80);

    const movesWithDetails = await Promise.all(
      levelUpMoves.map(async (m: any) => {
        try {
          const moveRes = await fetch(m.url)
          if (moveRes.ok) {
            const moveData = await moveRes.json()
            return {
              name: m.name,
              method: m.method,
              level: m.level,
              type: moveData.type.name,
              power: moveData.power,
            }
          }
        } catch (e) {
          console.error(e)
        }
        return {
          name: m.name,
          method: m.method,
          level: m.level,
          type: 'normal',
          power: null,
        }
      })
    )

    return { pokemon, species, evolutionSteps, weaknesses, resistances, moves: movesWithDetails }
  } catch (err) {
    console.error(err)
    return null
  }
}

export default async function PokemonDetailPage({ params }: Props) {
  const resolvedParams = await params
  const idNum = Number(resolvedParams.id)
  
  if (isNaN(idNum)) {
    return notFound()
  }

  const data = await fetchEverythingAboutPokemon(idNum)

  if (!data) {
    return notFound()
  }

  const { pokemon, species, evolutionSteps, weaknesses, resistances, moves } = data

  const primaryType = pokemon.types[0]?.type.name || 'normal'

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

  const primaryTypeColor = getTypeColor(primaryType)

  const engFlavorText = species.flavor_text_entries.find(
    (entry: any) => entry.language.name === 'en'
  )?.flavor_text || 'No description available.'

  const genus = species.genera.find((g: any) => g.language.name === 'en')?.genus
  const jpName = species.names.find((n: any) => n.language.name === 'ja-Hrkt')?.name

  const abilities = pokemon.abilities.map((a: any) => ({
    name: a.ability.name,
    isHidden: a.is_hidden,
  }))

  const stats = pokemon.stats.map((s: any) => ({
    label: s.stat.name === 'special-attack' ? 'Sp. Atk' : s.stat.name === 'special-defense' ? 'Sp. Def' : s.stat.name.toUpperCase(),
    val: s.base_stat,
  }))

  const totalStats = pokemon.stats.reduce((acc: number, curr: any) => acc + curr.base_stat, 0)

  // Calculate min/max stats based on level 100 formulas
  const getMinMaxStats = (label: string, base: number) => {
    if (label === 'HP') {
      return {
        min: base * 2 + 110,
        max: base * 2 + 204,
      }
    }
    return {
      min: Math.floor((base * 2 + 5) * 0.9),
      max: Math.floor((base * 2 + 99) * 1.1),
    }
  }

  return (
    <div className="min-h-screen flex flex-col text-slate-800 dark:text-slate-100">
      {/* TopNavBar */}
      <nav className="sticky top-0 w-full h-[72px] z-50 bg-white/80 dark:bg-slate-950/40 backdrop-blur-md border-b border-slate-200/60 dark:border-white/5">
        <div className="flex justify-between items-center px-6 w-full max-w-7xl mx-auto h-full">
          <div className="flex items-center gap-4">
            <Link href="/pokedex" className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-brand-red flex items-center gap-1.5 transition-colors border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-900/60 backdrop-blur-xs">
              ← Back to Grid
            </Link>
            <Logo />
          </div>
          <ul className="hidden md:flex gap-6 h-full items-center">
            <li className="h-full flex items-center">
              <Link className="text-sm text-slate-600 dark:text-slate-300 hover:text-brand-red font-semibold transition-colors h-full flex items-center" href="/">Home</Link>
            </li>
            <li className="h-full flex items-center">
              <Link className="text-sm text-slate-600 dark:text-slate-300 hover:text-brand-red font-semibold transition-colors h-full flex items-center" href="/pokedex">Pokédex</Link>
            </li>
            <li className="h-full flex items-center">
              <Link className="text-sm text-slate-600 dark:text-slate-300 hover:text-brand-red font-semibold transition-colors h-full flex items-center" href="/compare">Compare</Link>
            </li>
            <li className="h-full flex items-center">
              <Link className="text-sm text-slate-600 dark:text-slate-300 hover:text-brand-red font-semibold transition-colors h-full flex items-center" href="/teams">Teams</Link>
            </li>
            <li className="h-full flex items-center">
              <Link className="text-sm text-slate-600 dark:text-slate-300 hover:text-brand-red font-semibold transition-colors h-full flex items-center" href="/about">About</Link>
            </li>
          </ul>
          <div className="flex gap-4 items-center">
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Balanced Two Column Layout */}
      <main className="max-w-7xl mx-auto w-full px-6 py-10 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Identity Card, Abilities & Type Matchups (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Identity Card */}
            <section className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-none overflow-hidden flex flex-col">
              <div 
                className="relative p-6 text-white pb-14 overflow-hidden select-none"
                style={{ backgroundColor: primaryTypeColor }}
              >
                {/* Translucent Pokeball design */}
                <div className="absolute right-0 top-0 opacity-20 w-36 h-36 translate-x-6 -translate-y-6 pointer-events-none select-none">
                  <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" className="w-full h-full text-white">
                    <circle cx="50" cy="50" r="45" />
                    <line x1="5" y1="50" x2="95" y2="50" />
                    <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="6" />
                    <circle cx="50" cy="50" r="6" fill="currentColor" />
                  </svg>
                </div>

                <div className="relative z-10 space-y-1">
                  <span className="inline-block text-[10px] font-extrabold bg-white/20 text-white px-2 py-0.5 rounded-md font-mono">
                    #{String(pokemon.id).padStart(4, '0')}
                  </span>
                  <h1 className="text-2xl font-black capitalize tracking-normal">{pokemon.name}</h1>
                  {genus && <span className="text-white/80 text-xs font-semibold block">{genus}</span>}
                  {jpName && <span className="text-white/60 text-[10px] font-medium font-sans block">{jpName}</span>}
                </div>
              </div>

              {/* Card body overlay */}
              <div className="px-6 pb-6 -mt-8 flex flex-col bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200/60 dark:border-white/5 pt-2 relative z-10">
                <div className="w-full flex justify-center -mt-14 mb-4">
                  <Image 
                    src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default} 
                    alt={pokemon.name} 
                    width={140} 
                    height={140} 
                    className="object-contain drop-shadow-md select-none pointer-events-none hover:scale-105 transition-all duration-300" 
                    priority
                  />
                </div>

                {/* Sizing blocks */}
                <div className="flex justify-center gap-8 mb-6 text-slate-700 dark:text-slate-200 w-full border-b border-slate-100 dark:border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <Ruler className="w-5 h-5 -rotate-45" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs text-slate-450 dark:text-slate-400 font-semibold">Height</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">{(pokemon.height / 10).toFixed(1)}m</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400">
                      <Weight className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs text-slate-450 dark:text-slate-400 font-semibold">Weight</span>
                      <span className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">{(pokemon.weight / 10).toFixed(1)}kg</span>
                    </div>
                  </div>
                </div>

                {/* Description box */}
                <div className="bg-slate-50 dark:bg-slate-950/50 rounded-2xl p-4 w-full">
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {engFlavorText.replace(/[\n\f]/g, ' ')}
                  </p>
                </div>
              </div>
            </section>

            {/* Abilities */}
            <section className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-none space-y-3">
              <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest border-b border-slate-100 dark:border-white/5 pb-2">Abilities</h2>
              <div className="flex gap-2 flex-wrap">
                {abilities.map((a: any) => (
                  <span 
                    key={a.name}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize shadow-sm ${
                      a.isHidden 
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20' 
                        : 'bg-slate-100 dark:bg-slate-950/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5'
                    }`}
                  >
                    {a.name.replace(/-/g, ' ')} {a.isHidden && <span className="text-[9px] uppercase tracking-wide opacity-80">(Hidden)</span>}
                  </span>
                ))}
              </div>
            </section>

            {/* Type Matchups Grid Panel */}
            <section className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-none">
              <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4">Type Matchups</h2>
              <div className="space-y-5">
                {weaknesses.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-red-500 dark:text-red-400 uppercase tracking-widest block">Weak To</span>
                    <div className="flex gap-2.5 flex-wrap">
                      {weaknesses.map(([t, mult]) => (
                        <span 
                          key={t}
                          className="text-white text-xs font-black px-3.5 py-1 rounded-full uppercase shadow-sm flex items-center gap-1.5 hover:scale-105 transition-all select-none"
                          style={{ backgroundColor: getTypeColor(t) }}
                        >
                          <span>{t}</span>
                          <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-black">{mult}x</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {resistances.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest block">Resistant To</span>
                    <div className="flex gap-2.5 flex-wrap">
                      {resistances.map(([t, mult]) => (
                        <span 
                          key={t}
                          className="text-white text-xs font-black px-3.5 py-1 rounded-full uppercase shadow-sm flex items-center gap-1.5 hover:scale-105 transition-all select-none"
                          style={{ backgroundColor: getTypeColor(t) }}
                        >
                          <span>{t}</span>
                          <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] font-black">{mult}x</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Stats, Evolution & Moves (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Stats Matrix Grid Panel */}
            <section className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-none">
              <div className="flex justify-between items-end mb-4 border-b border-slate-100 dark:border-white/5 pb-2">
                <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest">Base Stats</h2>
                <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                  Total Stat Value: <span className="font-extrabold text-slate-800 dark:text-white">{totalStats}</span>
                </span>
              </div>
              <div className="space-y-3.5">
                {stats.map((stat: { label: string; val: number }) => {
                  const range = getMinMaxStats(stat.label, stat.val)
                  return (
                    <div key={stat.label} className="grid grid-cols-[80px_40px_1fr_90px] items-center gap-3 text-sm">
                      <span className="text-slate-400 dark:text-slate-500 font-bold">{stat.label}</span>
                      <span className="font-mono text-slate-800 dark:text-slate-200 font-extrabold text-right">{stat.val}</span>
                      <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-950/50 rounded-full overflow-hidden">
                        <div 
                           className="h-full rounded-full transition-all duration-300"
                           style={{ 
                             width: `${Math.min(100, (stat.val / 160) * 100)}%`,
                             backgroundColor: primaryTypeColor
                           }}
                        />
                      </div>
                      <span className="font-mono text-right text-xs text-slate-450 dark:text-slate-400 font-bold">{range.min} - {range.max}</span>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Evolution Timeline Flow Card */}
            {evolutionSteps.length > 0 && (
              <section className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-none">
                <h2 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest mb-4 border-b border-slate-100 dark:border-white/5 pb-2">Evolution Chain</h2>
                <div className="flex items-center justify-center gap-6 py-6 px-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-150 dark:border-white/5 flex-wrap">
                  {evolutionSteps.map((step, idx) => {
                    const isCurrent = Number(step.id) === pokemon.id
                    return (
                      <React.Fragment key={step.name}>
                        <div className="flex flex-col items-center">
                          <Link href={`/pokemon/${step.id}`} className="hover:scale-105 transition-all">
                            <div 
                              className={`w-16 h-16 relative flex items-center justify-center rounded-full shadow-md border p-1 bg-white dark:bg-slate-900 transition-all ${
                                isCurrent ? 'ring-2 ring-red-500 border-transparent bg-red-500/10' : 'border-slate-100 dark:border-white/10'
                              }`}
                            >
                              <img 
                                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${step.id}.png`} 
                                alt={step.name} 
                                className="w-12 h-12 object-contain select-none pointer-events-none" 
                              />
                            </div>
                          </Link>
                          <span className="capitalize font-extrabold text-xs text-slate-800 dark:text-white mt-2">{step.name}</span>
                          {step.level && <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold font-mono">Lv. {step.level}</span>}
                          {step.item && <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold font-mono capitalize">{step.item.replace('-', ' ')}</span>}
                        </div>
                        {idx < evolutionSteps.length - 1 && (
                          <span className="text-slate-400 dark:text-slate-500 font-bold text-xs select-none">❯</span>
                        )}
                      </React.Fragment>
                    )
                  })}
                </div>
              </section>
            )}

             {/* Moves List Panel */}
             <section className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-none">
               <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider mb-4">Moves</h2>
               <MovesList moves={moves} />
             </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-slate-200/60 dark:border-white/5 bg-slate-50 dark:bg-slate-950/20 flex flex-col items-center justify-center text-center px-6">
        <Logo className="mb-3" />
        <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-2xl">
          Data provided by PokéAPI. Pokémon and Pokémon character names are trademarks of Nintendo.
        </p>
      </footer>
    </div>
  )
}
