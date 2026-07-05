'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Search, Trash2, Plus, Copy, Sparkles, Shield, Swords, Info } from 'lucide-react'

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
}

interface TeamMember {
  slot: number
  pokemon: Pokemon | null
  level: number
  nickname: string
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
    default: return '#6B7280'
  }
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

export default function TeamsPage() {
  const [teamName, setTeamName] = useState<string>('My Champion Squad')
  const [team, setTeam] = useState<TeamMember[]>([
    { slot: 1, pokemon: null, level: 50, nickname: '' },
    { slot: 2, pokemon: null, level: 50, nickname: '' },
    { slot: 3, pokemon: null, level: 50, nickname: '' },
    { slot: 4, pokemon: null, level: 50, nickname: '' },
    { slot: 5, pokemon: null, level: 50, nickname: '' },
    { slot: 6, pokemon: null, level: 50, nickname: '' },
  ])

  // Load saved squad on mount
  useEffect(() => {
    const savedName = localStorage.getItem('rotomdex_team_name')
    if (savedName) setTeamName(savedName)

    const savedTeam = localStorage.getItem('rotomdex_team')
    if (savedTeam) {
      try {
        setTeam(JSON.parse(savedTeam))
      } catch (e) {}
    }
  }, [])

  // Save squad changes
  useEffect(() => {
    localStorage.setItem('rotomdex_team', JSON.stringify(team))
  }, [team])

  useEffect(() => {
    localStorage.setItem('rotomdex_team_name', teamName)
  }, [teamName])

  const [activeSlot, setActiveSlot] = useState<number | null>(null)
  const [selectedGen, setSelectedGen] = useState<number | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false)
  const [copiedShowdown, setCopiedShowdown] = useState<boolean>(false)
  const [copiedReadable, setCopiedReadable] = useState<boolean>(false)

  // Fetch bulk list of available Pokémon
  const { data: listRes } = useQuery({
    queryKey: ['pokemon-list-teams'],
    queryFn: async () => {
      const res = await fetch('/api/pokemon?limit=1025')
      if (!res.ok) throw new Error('Failed to fetch list')
      return res.json()
    },
  })

  const pokemonList: Pokemon[] = listRes?.data || []

  const selectPokemonForSlot = (pokemon: Pokemon) => {
    if (activeSlot === null) return
    setTeam(prev => prev.map(member => {
      if (member.slot === activeSlot) {
        return { ...member, pokemon, nickname: pokemon.name }
      }
      return member
    }))
    setActiveSlot(null)
  }

  const removePokemonFromSlot = (slotNum: number) => {
    setTeam(prev => prev.map(member => {
      if (member.slot === slotNum) {
        return { ...member, pokemon: null, nickname: '' }
      }
      return member
    }))
  }

  const clearTeam = () => {
    setTeam([
      { slot: 1, pokemon: null, level: 50, nickname: '' },
      { slot: 2, pokemon: null, level: 50, nickname: '' },
      { slot: 3, pokemon: null, level: 50, nickname: '' },
      { slot: 4, pokemon: null, level: 50, nickname: '' },
      { slot: 5, pokemon: null, level: 50, nickname: '' },
      { slot: 6, pokemon: null, level: 50, nickname: '' },
    ])
  }

  const updateLevel = (slotNum: number, newLvl: number) => {
    setTeam(prev => prev.map(member => {
      if (member.slot === slotNum) {
        return { ...member, level: Math.max(1, Math.min(100, newLvl)) }
      }
      return member
    }))
  }

  const updateNickname = (slotNum: number, name: string) => {
    setTeam(prev => prev.map(member => {
      if (member.slot === slotNum) {
        return { ...member, nickname: name }
      }
      return member
    }))
  }

  // Calculate Coverage statistics
  const activeMembers = team.filter(m => m.pokemon !== null) as { slot: number; pokemon: Pokemon; level: number; nickname: string }[]

  const averageLevel = activeMembers.length > 0 
    ? Math.round(activeMembers.reduce((sum, m) => sum + m.level, 0) / activeMembers.length)
    : 0

  const averageBST = activeMembers.length > 0
    ? Math.round(
        activeMembers.reduce((sum, m) => {
          const statsSum = m.pokemon.hp + m.pokemon.attack + m.pokemon.defense + m.pokemon.spAtk + m.pokemon.spDef + m.pokemon.speed
          return sum + statsSum
        }, 0) / activeMembers.length
      )
    : 0

  // Calculate weaknesses/resistances of the collective team against all 18 types
  const types = Object.keys(typeMatchups)
  const defensiveScores = types.map(atkType => {
    let weakCount = 0
    let resistCount = 0
    let immuneCount = 0
    const membersWithMultipliers: { nickname: string; name: string; mult: number }[] = []

    activeMembers.forEach(m => {
      const mult = getEffectivenessMultiplier(atkType, m.pokemon.types)
      if (mult > 1) {
        weakCount++
        membersWithMultipliers.push({ nickname: m.nickname, name: m.pokemon.name, mult })
      }
      else if (mult === 0) {
        immuneCount++
        membersWithMultipliers.push({ nickname: m.nickname, name: m.pokemon.name, mult })
      }
      else if (mult < 1) {
        resistCount++
        membersWithMultipliers.push({ nickname: m.nickname, name: m.pokemon.name, mult })
      }
    })

    return { type: atkType, weakCount, resistCount, immuneCount, membersWithMultipliers }
  })

  const majorWeaknesses = defensiveScores.filter(s => s.weakCount >= 2 && s.weakCount > s.resistCount + s.immuneCount)
  const majorResistances = defensiveScores.filter(s => s.resistCount + s.immuneCount >= 3)

  const synergyScore = (() => {
    if (activeMembers.length === 0) return 0
    let score = 50 
    const uniqueTypes = new Set(activeMembers.flatMap(m => m.pokemon.types))
    score += uniqueTypes.size * 5
    score -= majorWeaknesses.length * 6
    score += majorResistances.length * 4
    if (averageBST > 500) score += 15
    else if (averageBST > 400) score += 5
    else score -= 10
    return Math.max(10, Math.min(100, score))
  })()

  // Generate Rotom-Dex Tactical recommendation advice string
  const getRotomAdvice = () => {
    if (activeMembers.length === 0) {
      return "Zzt! Select a Pokémon to start building your squad! A balanced team should have diverse elemental types."
    }
    if (activeMembers.length < 3) {
      return "Zzt-pot! Keep adding members. Try to avoid adding too many Pokémon of the same type to maintain type coverage."
    }
    if (majorWeaknesses.length > 0) {
      const weakTypes = majorWeaknesses.map(w => w.type.toUpperCase()).join(', ')
      return `Zzzt! Warning! Your team has a major collective vulnerability to ${weakTypes} attacks! Try replacing a slot with a Pokémon that resists these elements.`
    }
    if (synergyScore > 80) {
      return "Zzzt-tastic! Excellent team synergy! Your defensive coverage and type varieties are perfectly balanced for champion combat!"
    }
    return "Zzt! Your squad is looking solid. Consider adding a Steel or Dragon-type to secure higher elemental resistances."
  }

  // Get Showdown Text Format
  const getShowdownText = () => {
    return activeMembers.map(m => {
      const formattedName = m.pokemon.name.charAt(0).toUpperCase() + m.pokemon.name.slice(1)
      const nameLine = m.nickname.toLowerCase() !== m.pokemon.name.toLowerCase() 
        ? `${m.nickname} (${formattedName})` 
        : formattedName
      return `${nameLine}\nLevel: ${m.level}`
    }).join('\n\n')
  }

  // Get Readable Roster Format containing ALL stats and diagnostics
  const getReadableText = () => {
    const list = activeMembers.map(m => {
      const bst = m.pokemon.hp + m.pokemon.attack + m.pokemon.defense + m.pokemon.spAtk + m.pokemon.spDef + m.pokemon.speed
      const typesStr = m.pokemon.types.map(t => t.toUpperCase()).join('/')
      return `Slot ${m.slot}: ${m.nickname} (${m.pokemon.name.toUpperCase()})
Level: ${m.level}
Types: ${typesStr}
Base Stats: HP ${m.pokemon.hp} | ATK ${m.pokemon.attack} | DEF ${m.pokemon.defense} | SP.ATK ${m.pokemon.spAtk} | SP.DEF ${m.pokemon.spDef} | SPD ${m.pokemon.speed} (BST: ${bst})`
    }).join('\n\n')

    const weakStr = majorWeaknesses.length > 0 ? majorWeaknesses.map(w => w.type.toUpperCase()).join(', ') : 'None'
    const resistStr = majorResistances.length > 0 ? majorResistances.map(r => r.type.toUpperCase()).join(', ') : 'None'

    return `=== TEAM ROSTER: ${teamName.toUpperCase()} ===
Synergy Score: ${synergyScore}/100
Average Level: ${averageLevel}
Average BST: ${averageBST}

--- SQUAD MEMBERS ---
${list}

--- TYPE COVERAGE DIAGNOSTICS ---
Major Weaknesses: ${weakStr}
Major Resistances/Immunities: ${resistStr}
Rotom-Dex Advice: ${getRotomAdvice()}`
  }

  const copyShowdownText = () => {
    navigator.clipboard.writeText(getShowdownText())
    setCopiedShowdown(true)
    setTimeout(() => setCopiedShowdown(false), 2000)
  }

  const copyReadableText = () => {
    navigator.clipboard.writeText(getReadableText())
    setCopiedReadable(true)
    setTimeout(() => setCopiedReadable(false), 2000)
  }

  const filteredPokemonList = pokemonList.filter(p => {
    const matchesGen = selectedGen === 'all' || p.generation === selectedGen
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || String(p.id).includes(searchQuery)
    return matchesGen && matchesSearch
  })

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
              <Link className="text-sm text-slate-605 dark:text-slate-300 hover:text-brand-red font-semibold transition-colors h-full flex items-center" href="/compare">Compare</Link>
            </li>
            <li className="h-full flex items-center">
              <Link className="text-sm text-brand-red font-bold border-b-2 border-brand-red h-full flex items-center" href="/teams">Teams</Link>
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

      {/* Main content grid */}
      <main className="max-w-7xl mx-auto w-full px-6 py-10 flex-1 space-y-8">
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Team Builder</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Assemble your dream squad of up to 6 custom trained Pokémon.</p>
          </div>
          <div className="flex gap-3 items-center w-full md:w-auto">
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="px-4 py-2 border rounded-full bg-white dark:bg-slate-950/40 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 font-bold shadow-xs"
            />
            {activeMembers.length > 0 && (
              <>
                <button
                  onClick={() => setExportModalOpen(true)}
                  className="px-4 py-2 bg-brand-blue/10 text-brand-blue border border-brand-blue/20 hover:bg-brand-blue/20 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Export
                </button>
                <button
                  onClick={clearTeam}
                  className="px-4 py-2 bg-brand-red/10 text-brand-red border border-brand-red/20 hover:bg-brand-red/20 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              </>
            )}
          </div>
        </section>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member) => {
            const borderCol = member.pokemon ? getTypeColor(member.pokemon.types[0]) : 'rgba(226, 232, 240, 0.6)'
            return (
              <div 
                key={member.slot} 
                className={`bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-3xl p-5 border shadow-xs transition-all relative flex h-[170px] hover:-translate-y-1 hover:shadow-md hover:shadow-brand-blue/5`}
                style={{ 
                  borderColor: member.pokemon ? `${borderCol}50` : undefined,
                  background: member.pokemon 
                    ? `linear-gradient(135deg, ${borderCol}08 0%, transparent 100%)` 
                    : undefined 
                }}
              >
                {/* Subtle Slot Index Indicator */}
                <span className="absolute -top-2.5 right-4 text-[8px] font-black text-slate-400 dark:text-slate-500 tracking-widest select-none uppercase px-2 py-0.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-white/10 z-10 shadow-xs">Slot {member.slot}</span>
                
                {member.pokemon ? (
                  <div className="flex gap-4 w-full h-full">
                    {/* Left Column: Glowing Circular Artwork & Types */}
                    <div className="flex flex-col items-center justify-between h-full shrink-0 w-20">
                      <div 
                        className="w-20 h-20 rounded-full flex items-center justify-center relative border border-slate-200/60 dark:border-white/10 shadow-md"
                        style={{ 
                          background: `radial-gradient(circle, ${getTypeColor(member.pokemon.types[0])}30 0%, rgba(30, 41, 59, 0.9) 100%)`,
                          boxShadow: `0 0 12px ${getTypeColor(member.pokemon.types[0])}20`
                        }}
                      >
                        <Image 
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${member.pokemon.id}.png`} 
                          alt={member.pokemon.name} 
                          width={60} 
                          height={60} 
                          className="object-contain animate-fade-in hover:scale-110 transition-transform" 
                        />
                      </div>
                      
                      <div className="flex flex-wrap gap-1 justify-center w-full mt-1">
                        {member.pokemon.types.map(t => (
                          <span 
                            key={t}
                            className="text-[8px] font-black uppercase text-white px-1.5 py-0.5 rounded-md shadow-xs select-none"
                            style={{ backgroundColor: getTypeColor(t) }}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right Column: Nickname, Species, Stats & Level controls */}
                    <div className="flex flex-col justify-between grow h-full min-w-0 pr-1">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-1">
                          <input 
                            type="text" 
                            value={member.nickname} 
                            onChange={(e) => updateNickname(member.slot, e.target.value)}
                            className="text-base font-black text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-950/40 border-b border-transparent focus:border-brand-blue focus:bg-white dark:focus:bg-slate-90 rounded-lg px-2 py-0.5 w-[85%] capitalize font-sans tracking-tight truncate focus:outline-none"
                            placeholder="Nickname..."
                          />
                          <button 
                            onClick={() => removePokemonFromSlot(member.slot)}
                            className="text-slate-400 hover:text-brand-red p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 mt-0.5"
                            title="Remove member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-extrabold capitalize px-2">
                          {member.pokemon.name}
                        </div>
                      </div>

                      {/* Mini Stats Preview Bar */}
                      <div className="flex gap-3 px-2 text-[10px] font-extrabold text-slate-700 dark:text-slate-300 font-mono">
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-brand-red inline-block" />HP {member.pokemon.hp}</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />ATK {member.pokemon.attack}</span>
                        <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />DEF {member.pokemon.defense}</span>
                      </div>

                      {/* Level Custom Spinner (Aligned together on the right) */}
                      <div className="flex items-center justify-end gap-3 px-2 pt-2 border-t border-slate-100 dark:border-white/5">
                        <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">LEVEL</span>
                        <div className="flex items-center bg-slate-100 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-white/10 overflow-hidden shadow-inner">
                          <button 
                            type="button"
                            onClick={() => updateLevel(member.slot, member.level - 1)}
                            className="px-2.5 py-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-black transition-colors cursor-pointer select-none"
                            disabled={member.level <= 1}
                          >
                            -
                          </button>
                          <input 
                            type="number" 
                            value={member.level} 
                            onChange={(e) => updateLevel(member.slot, Number(e.target.value))}
                            className="w-8 font-mono font-black text-center bg-transparent focus:outline-none text-slate-900 dark:text-white text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min="1"
                            max="100"
                          />
                          <button 
                            type="button"
                            onClick={() => updateLevel(member.slot, member.level + 1)}
                            className="px-2.5 py-0.5 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-black transition-colors cursor-pointer select-none"
                            disabled={member.level >= 100}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col justify-center items-center gap-2.5 text-center border-2 border-dashed border-slate-205 dark:border-white/10 rounded-2xl p-4 bg-slate-50/40 dark:bg-slate-950/10">
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">Slot {member.slot} Empty</span>
                    <button 
                      onClick={() => {
                        setSelectedGen('all')
                        setSearchQuery('')
                        setActiveSlot(member.slot)
                      }}
                      className="px-4 py-1.5 bg-brand-blue text-white rounded-full text-xs font-black uppercase tracking-wider shadow-md hover:bg-brand-blue/90 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Select
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Useful Stats & Type Coverage Analysis Dashboard */}
        {activeMembers.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
            
            {/* Team Synergy & Stats summary */}
            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xs flex flex-col justify-between space-y-6">
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-905 dark:text-white border-b border-slate-100 dark:border-white/5 pb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Squad Diagnostics
                </h3>
                <div className="pt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Synergy Score</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-brand-blue">{synergyScore}/100</span>
                      <div className="w-16 h-2 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-200/40 dark:border-white/5">
                        <div className="h-full bg-brand-blue" style={{ width: `${synergyScore}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">Average Level</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">Lvl {averageLevel}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-bold">Avg Base Stat Total (BST)</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">{averageBST} pts</span>
                  </div>
                </div>
              </div>

              {/* Rotom Advice Box */}
              <div className="bg-brand-red/5 dark:bg-brand-red/10 border border-brand-red/20 rounded-2xl p-4 flex gap-3 items-start relative overflow-hidden">
                <div className="logo-rotom text-xs absolute right-3 bottom-1.5 opacity-15 rotate-12">ROTOM</div>
                <div className="w-8 h-8 rounded-full bg-brand-red/20 flex items-center justify-center shrink-0 text-brand-red">
                  <Info className="w-4 h-4" />
                </div>
                <div className="space-y-1 text-xs">
                  <span className="font-black uppercase tracking-wider text-brand-red block">Rotom-Dex Advice</span>
                  <p className="font-semibold text-slate-750 dark:text-slate-300 leading-relaxed">{getRotomAdvice()}</p>
                </div>
              </div>
            </div>

            {/* Type Defenses Grid */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-xs space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" /> Defensive Coverage Matrix
                </h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Collective Vulnerabilities</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {defensiveScores.map(score => {
                  const hasModifiers = score.membersWithMultipliers.length > 0

                  return (
                    <div key={score.type} className="flex flex-col items-center p-2 rounded-xl bg-slate-50/25 dark:bg-slate-950/20 border border-slate-150 dark:border-white/5 gap-2 w-full h-full justify-start">
                      <span 
                        className="text-[9px] font-black uppercase text-white px-2 py-0.5 rounded-md select-none w-full text-center"
                        style={{ backgroundColor: getTypeColor(score.type) }}
                      >
                        {score.type}
                      </span>
                      
                      {hasModifiers ? (
                        <div className="w-full space-y-1">
                          {score.membersWithMultipliers.map((m, idx) => {
                            let badgeStyle = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                            if (m.mult > 1) {
                              badgeStyle = 'bg-red-500 text-white font-black'
                            } else if (m.mult === 0) {
                              badgeStyle = 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-black'
                            } else if (m.mult < 1) {
                              badgeStyle = 'bg-emerald-600 text-white font-black'
                            }

                            return (
                              <div key={idx} className="flex items-center justify-center gap-1.5 w-full bg-slate-50/50 dark:bg-slate-950/20 py-1 px-1.5 rounded-lg border border-slate-100/60 dark:border-white/5">
                                <span className={`text-[9px] px-1 py-0.5 rounded font-mono font-black ${badgeStyle}`}>
                                  {m.mult}x
                                </span>
                                <span className="text-[9.5px] font-extrabold text-slate-700 dark:text-slate-300 truncate max-w-[55px] capitalize">
                                  {m.nickname}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <span className="text-[10px] font-black uppercase text-center w-full py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-white/5">
                          Neutral
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Modal-like Overlay list for slot assignment selection */}
        {activeSlot !== null && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl p-6 border border-slate-200 dark:border-white/15 shadow-2xl flex flex-col max-h-[80vh]">
              <div className="flex justify-between items-center mb-3 border-b border-slate-100 dark:border-white/5 pb-3">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Select Pokémon for Slot {activeSlot}</h3>
                <button 
                  onClick={() => setActiveSlot(null)}
                  className="text-xs text-slate-500 dark:text-slate-350 hover:text-slate-800 dark:hover:text-white font-bold hover:underline cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Search bar inside modal */}
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name or national Pokédex number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border rounded-2xl bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all text-sm font-semibold"
                />
              </div>

              {/* Generation Selection Filters row inside modal */}
              <div className="flex flex-wrap gap-1.5 py-2.5 mb-3 border-b border-slate-100 dark:border-white/5">
                {(['all', 1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map(gen => (
                  <button
                    key={gen}
                    onClick={() => setSelectedGen(gen)}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all select-none cursor-pointer ${
                      selectedGen === gen
                        ? 'bg-brand-blue text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950/40 text-slate-550 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {gen === 'all' ? 'All Gen' : `Gen ${gen}`}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto pr-2 custom-scrollbar">
                {filteredPokemonList.length > 0 ? (
                  filteredPokemonList.map((pokemon) => (
                    <div 
                      key={pokemon.id}
                      onClick={() => selectPokemonForSlot(pokemon)}
                      className="p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5 rounded-2xl flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer hover:border-brand-blue/30 transition-all capitalize text-sm text-slate-800 dark:text-slate-200"
                    >
                      {pokemon.id && (
                        <Image 
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`} 
                          alt={pokemon.name} 
                          width={40} 
                          height={40} 
                          className="object-contain" 
                        />
                      )}
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{pokemon.name}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-550">#{pokemon.id}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center text-xs text-slate-405">
                    No results found matching filters.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Premium Export / Roster Modal */}
        {exportModalOpen && (
          <div className="fixed inset-0 z-55 bg-black/60 backdrop-blur-xs flex items-center justify-center p-6 animate-fade-in">
            <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl p-6 border border-slate-200 dark:border-white/15 shadow-2xl flex flex-col space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-3">
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Swords className="w-5 h-5 text-brand-blue" /> Export: {teamName}
                </h3>
                <button 
                  onClick={() => setExportModalOpen(false)}
                  className="text-xs text-slate-500 dark:text-slate-350 hover:text-slate-800 dark:hover:text-white font-bold hover:underline cursor-pointer"
                >
                  Close
                </button>
              </div>

              {/* Showdown Import Format Code Block */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">
                  <span>Pokémon Showdown Import Format</span>
                  <button 
                    onClick={copyShowdownText}
                    className="text-brand-blue font-black flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedShowdown ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea 
                  readOnly 
                  value={getShowdownText()}
                  className="w-full h-32 p-3 font-mono text-xs rounded-xl bg-slate-950 text-emerald-400 border border-white/5 focus:outline-none resize-none"
                />
              </div>

              {/* Shareable Plain Text Summary */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider">
                  <span>Shareable Readable Summary</span>
                  <button 
                    onClick={copyReadableText}
                    className="text-brand-blue font-black flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedReadable ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <textarea 
                  readOnly 
                  value={getReadableText()}
                  className="w-full h-24 p-3 font-sans text-xs rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5 focus:outline-none resize-none"
                />
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
