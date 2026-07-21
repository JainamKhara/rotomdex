'use client'

import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import {
  Search, Trash2, Plus, Copy, Sparkles, Shield, Swords, Info, Users, X
} from 'lucide-react'

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

const calculateLevelStat = (statName: string, baseVal: number, lvl: number) => {
  if (statName === 'hp') {
    if (baseVal === 1) return 1 // Shedinja
    return Math.floor(((2 * baseVal + 31) * lvl) / 100) + lvl + 10
  } else {
    return Math.floor(((2 * baseVal + 31) * lvl) / 100) + 5
  }
}

const BRAND = 'oklch(0.55 0.28 29.5)'
const BRAND_DARK = 'oklch(0.48 0.27 29.5)'

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

const TYPE_COLORS: Record<string, string> = {
  fire: '#F08030', water: '#6890F0', grass: '#78C850', electric: '#F7D02C',
  ice: '#98D8D8', fighting: '#C03028', poison: '#A040A0', ground: '#E0C068',
  flying: '#A890F0', psychic: '#F85888', bug: '#A8B820', rock: '#B8A038',
  ghost: '#705898', dragon: '#7038F8', dark: '#705848', steel: '#B8B8D0',
  fairy: '#EE99AC', normal: '#A8A878',
}
const getTypeColor = (type: string) => TYPE_COLORS[type?.toLowerCase()] ?? '#6B7280'

const getEffectivenessMultiplier = (attackType: string, defenseTypes: string[]) => {
  let multiplier = 1
  const match = typeMatchups[attackType.toLowerCase()]
  if (!match) return 1
  for (const defType of defenseTypes) {
    const key = defType.toLowerCase()
    if (key in match) multiplier *= match[key]
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

  useEffect(() => {
    const savedName = localStorage.getItem('rotomdex_team_name')
    if (savedName) setTeamName(savedName)
    const savedTeam = localStorage.getItem('rotomdex_team')
    if (savedTeam) {
      try { setTeam(JSON.parse(savedTeam)) } catch {}
    }
  }, [])

  useEffect(() => { localStorage.setItem('rotomdex_team', JSON.stringify(team)) }, [team])
  useEffect(() => { localStorage.setItem('rotomdex_team_name', teamName) }, [teamName])

  const [activeSlot, setActiveSlot] = useState<number | null>(null)
  const [selectedGen, setSelectedGen] = useState<number | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [exportModalOpen, setExportModalOpen] = useState<boolean>(false)
  const [copiedShowdown, setCopiedShowdown] = useState<boolean>(false)
  const [copiedReadable, setCopiedReadable] = useState<boolean>(false)

  const { data: listRes } = useQuery({
    queryKey: ['pokemon-list-teams'],
    queryFn: async () => {
      const res = await fetch('/api/pokemon?limit=1025')
      if (!res.ok) throw new Error('Failed')
      return res.json()
    },
  })
  const pokemonList: Pokemon[] = listRes?.data || []

  const selectPokemonForSlot = (pokemon: Pokemon) => {
    if (activeSlot === null) return
    setTeam(prev => prev.map(m => m.slot === activeSlot ? { ...m, pokemon, nickname: pokemon.name } : m))
    setActiveSlot(null)
  }
  const removePokemonFromSlot = (slotNum: number) => {
    setTeam(prev => prev.map(m => m.slot === slotNum ? { ...m, pokemon: null, nickname: '' } : m))
  }
  const clearTeam = () => {
    setTeam([1,2,3,4,5,6].map(slot => ({ slot, pokemon: null, level: 50, nickname: '' })))
  }
  const updateLevel = (slotNum: number, newLvl: number) => {
    setTeam(prev => prev.map(m => m.slot === slotNum ? { ...m, level: Math.max(1, Math.min(100, newLvl)) } : m))
  }
  const updateNickname = (slotNum: number, name: string) => {
    setTeam(prev => prev.map(m => m.slot === slotNum ? { ...m, nickname: name } : m))
  }

  const activeMembers = team.filter(m => m.pokemon !== null) as { slot: number; pokemon: Pokemon; level: number; nickname: string }[]
  const averageLevel = activeMembers.length > 0
    ? Math.round(activeMembers.reduce((sum, m) => sum + m.level, 0) / activeMembers.length) : 0
  const averageBST = activeMembers.length > 0
    ? Math.round(activeMembers.reduce((sum, m) =>
        sum + m.pokemon.hp + m.pokemon.attack + m.pokemon.defense + m.pokemon.spAtk + m.pokemon.spDef + m.pokemon.speed, 0
      ) / activeMembers.length) : 0

  const types = Object.keys(typeMatchups)
  const defensiveScores = types.map(atkType => {
    let weakCount = 0; let resistCount = 0; let immuneCount = 0
    const mults: { nickname: string; name: string; mult: number }[] = []
    activeMembers.forEach(m => {
      const mult = getEffectivenessMultiplier(atkType, m.pokemon.types)
      if (mult > 1) { weakCount++; mults.push({ nickname: m.nickname, name: m.pokemon.name, mult }) }
      else if (mult === 0) { immuneCount++; mults.push({ nickname: m.nickname, name: m.pokemon.name, mult }) }
      else if (mult < 1) { resistCount++; mults.push({ nickname: m.nickname, name: m.pokemon.name, mult }) }
    })
    return { type: atkType, weakCount, resistCount, immuneCount, membersWithMultipliers: mults }
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

  const getRotomAdvice = () => {
    if (activeMembers.length === 0) return 'Zzt! Select a Pokémon to start building your squad! A balanced team should have diverse elemental types.'
    if (activeMembers.length < 3) return 'Zzt-pot! Keep adding members. Try to avoid adding too many Pokémon of the same type to maintain type coverage.'
    if (majorWeaknesses.length > 0) {
      return `Zzzt! Warning! Your team has a major collective vulnerability to ${majorWeaknesses.map(w => w.type.toUpperCase()).join(', ')} attacks! Try replacing a slot with a Pokémon that resists these elements.`
    }
    if (synergyScore > 80) return 'Zzzt-tastic! Excellent team synergy! Your defensive coverage and type varieties are perfectly balanced for champion combat!'
    return 'Zzt! Your squad is looking solid. Consider adding a Steel or Dragon-type to secure higher elemental resistances.'
  }

  const getShowdownText = () => activeMembers.map(m => {
    const n = m.pokemon.name.charAt(0).toUpperCase() + m.pokemon.name.slice(1)
    const nameLine = m.nickname.toLowerCase() !== m.pokemon.name.toLowerCase() ? `${m.nickname} (${n})` : n
    return `${nameLine}\nLevel: ${m.level}`
  }).join('\n\n')

  const getReadableText = () => {
    const list = activeMembers.map(m => {
      const bst = m.pokemon.hp + m.pokemon.attack + m.pokemon.defense + m.pokemon.spAtk + m.pokemon.spDef + m.pokemon.speed
      return `Slot ${m.slot}: ${m.nickname} (${m.pokemon.name.toUpperCase()})\nLevel: ${m.level}\nTypes: ${m.pokemon.types.map(t => t.toUpperCase()).join('/')}\nBase Stats: HP ${m.pokemon.hp} | ATK ${m.pokemon.attack} | DEF ${m.pokemon.defense} | SP.ATK ${m.pokemon.spAtk} | SP.DEF ${m.pokemon.spDef} | SPD ${m.pokemon.speed} (BST: ${bst})`
    }).join('\n\n')
    return `=== TEAM ROSTER: ${teamName.toUpperCase()} ===\nSynergy Score: ${synergyScore}/100\nAverage Level: ${averageLevel}\nAverage BST: ${averageBST}\n\n--- SQUAD MEMBERS ---\n${list}\n\n--- TYPE COVERAGE DIAGNOSTICS ---\nMajor Weaknesses: ${majorWeaknesses.length > 0 ? majorWeaknesses.map(w => w.type.toUpperCase()).join(', ') : 'None'}\nMajor Resistances/Immunities: ${majorResistances.length > 0 ? majorResistances.map(r => r.type.toUpperCase()).join(', ') : 'None'}\nRotom-Dex Advice: ${getRotomAdvice()}`
  }

  const copyShowdownText = () => { navigator.clipboard.writeText(getShowdownText()); setCopiedShowdown(true); setTimeout(() => setCopiedShowdown(false), 2000) }
  const copyReadableText = () => { navigator.clipboard.writeText(getReadableText()); setCopiedReadable(true); setTimeout(() => setCopiedReadable(false), 2000) }

  const filteredPokemonList = pokemonList.filter(p => {
    const matchesGen = selectedGen === 'all' || p.generation === selectedGen
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || String(p.id).includes(searchQuery)
    return matchesGen && matchesSearch
  })

  const synergyColor = synergyScore >= 75 ? '#22c55e' : synergyScore >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 space-y-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display font-black text-3xl text-foreground">Teams Builder</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">Assemble your dream squad of up to 6 custom trained Pokémon.</p>
        </div>
        <div className="flex gap-2 items-center w-full md:w-auto flex-wrap">
          <input
            type="text"
            value={teamName}
            onChange={e => setTeamName(e.target.value)}
            className="px-4 py-2 border border-border rounded-xl bg-background/60 text-foreground font-bold text-sm focus:outline-none focus:border-brand-red transition-all"
          />
          {activeMembers.length > 0 && (
            <>
              <button
                onClick={() => setExportModalOpen(true)}
                className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all border border-blue-500/30 text-blue-400 bg-blue-500/10 hover:bg-blue-500/20"
              >
                <Copy className="w-3.5 h-3.5" /> Export
              </button>
              <button
                onClick={clearTeam}
                className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all border border-rose-500/30 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {team.map(member => {
          const borderColor = member.pokemon ? getTypeColor(member.pokemon.types[0]) : undefined
          return (
            <div
              key={member.slot}
              className="glass-panel rounded-3xl border transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
              style={{
                borderColor: borderColor ? `${borderColor}35` : 'var(--border)',
                boxShadow: borderColor ? `0 8px 24px ${borderColor}15` : undefined,
              }}
            >
              {/* Slot badge */}
              <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full border border-border z-10">
                Slot {member.slot}
              </span>

              {member.pokemon ? (
                <div className="p-5">
                  {/* Artwork + type row */}
                  <div className="flex items-start gap-4">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0 relative"
                      style={{ background: `radial-gradient(circle, ${getTypeColor(member.pokemon.types[0])}30 0%, transparent 70%)` }}
                    >
                      <Image
                        src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${member.pokemon.id}.png`}
                        alt={member.pokemon.name}
                        width={72}
                        height={72}
                        className="object-contain hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5 pt-1">
                      <div className="flex items-start justify-between gap-2">
                        <input
                          type="text"
                          value={member.nickname}
                          onChange={e => updateNickname(member.slot, e.target.value)}
                          className="text-base font-black text-foreground bg-transparent border-b border-transparent focus:border-border focus:bg-transparent rounded px-1 py-0.5 w-full capitalize focus:outline-none transition-all min-w-0 truncate"
                          placeholder="Nickname..."
                        />
                        <button
                          onClick={() => removePokemonFromSlot(member.slot)}
                          className="text-muted-foreground hover:text-rose-400 p-1 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs font-semibold text-muted-foreground capitalize px-1">{member.pokemon.name}</p>
                      <div className="flex gap-1 flex-wrap px-1">
                        {member.pokemon.types.map(t => (
                          <span key={t} className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase text-white"
                            style={{ backgroundColor: getTypeColor(t) }}>
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Level Adjusted Stats */}
                  <div className="grid grid-cols-6 gap-1 text-[9px] font-bold text-center border-t border-border pt-3 text-muted-foreground mt-4">
                    <div>
                      <span className="block font-mono text-foreground">
                        {calculateLevelStat('hp', member.pokemon.hp, member.level)}
                      </span>
                      <span className="block mt-0.5">HP</span>
                    </div>
                    <div>
                      <span className="block font-mono text-foreground">
                        {calculateLevelStat('attack', member.pokemon.attack, member.level)}
                      </span>
                      <span className="block mt-0.5">Atk</span>
                    </div>
                    <div>
                      <span className="block font-mono text-foreground">
                        {calculateLevelStat('defense', member.pokemon.defense, member.level)}
                      </span>
                      <span className="block mt-0.5">Def</span>
                    </div>
                    <div>
                      <span className="block font-mono text-foreground">
                        {calculateLevelStat('spAtk', member.pokemon.spAtk, member.level)}
                      </span>
                      <span className="block mt-0.5">S.Atk</span>
                    </div>
                    <div>
                      <span className="block font-mono text-foreground">
                        {calculateLevelStat('spDef', member.pokemon.spDef, member.level)}
                      </span>
                      <span className="block mt-0.5">S.Def</span>
                    </div>
                    <div>
                      <span className="block font-mono text-foreground">
                        {calculateLevelStat('speed', member.pokemon.speed, member.level)}
                      </span>
                      <span className="block mt-0.5">Spe</span>
                    </div>
                  </div>

                  {/* Level control */}
                  <div className="flex items-center justify-between border-t border-border mt-4 pt-3">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Level</span>
                    <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateLevel(member.slot, member.level - 1)}
                        disabled={member.level <= 1}
                        className="px-2.5 py-1 hover:bg-muted/50 text-foreground font-black transition-colors cursor-pointer disabled:opacity-30"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={member.level}
                        onChange={e => updateLevel(member.slot, Number(e.target.value))}
                        className="w-8 font-fira font-black text-center bg-transparent text-foreground text-xs focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        min="1" max="100"
                      />
                      <button
                        type="button"
                        onClick={() => updateLevel(member.slot, member.level + 1)}
                        disabled={member.level >= 100}
                        className="px-2.5 py-1 hover:bg-muted/50 text-foreground font-black transition-colors cursor-pointer disabled:opacity-30"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-48 flex flex-col justify-center items-center gap-3 border-2 border-dashed border-border rounded-3xl m-3 bg-muted/10">
                  <span className="text-xs font-bold text-muted-foreground">Slot {member.slot} Empty</span>
                  <button
                    onClick={() => { setSelectedGen('all'); setSearchQuery(''); setActiveSlot(member.slot) }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
                    style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Pokémon
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Analysis Panel */}
      {activeMembers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Synergy + Rotom Advice */}
          <div className="glass-panel rounded-3xl border border-border p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Squad Diagnostics</h3>
            </div>

            {/* Synergy arc score */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-28 h-14">
                <svg viewBox="0 0 120 60" className="w-full h-full">
                  <path d="M10 55 A50 50 0 0 1 110 55" fill="none" stroke="var(--border)" strokeWidth="8" strokeLinecap="round" />
                  <path
                    d="M10 55 A50 50 0 0 1 110 55"
                    fill="none"
                    stroke={synergyColor}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${synergyScore * 1.57} 157`}
                    style={{ transition: 'stroke-dasharray 0.8s ease' }}
                  />
                </svg>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                  <span className="text-xl font-black font-fira" style={{ color: synergyColor }}>{synergyScore}</span>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Synergy Score / 100</span>
            </div>

            <div className="space-y-2 border-t border-border pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-semibold">Average Level</span>
                <span className="font-black font-fira text-foreground">Lvl {averageLevel}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-semibold">Avg BST</span>
                <span className="font-black font-fira text-foreground">{averageBST}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-semibold">Members</span>
                <span className="font-black font-fira text-foreground">{activeMembers.length}/6</span>
              </div>
            </div>

            {/* Rotom Advisory */}
            <div className="rounded-2xl p-4 border space-y-2" style={{ background: `${BRAND}08`, borderColor: `${BRAND}25` }}>
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" style={{ color: BRAND }} />
                <span className="text-[10px] font-black uppercase tracking-wider" style={{ color: BRAND }}>Rotom-Dex Advisory</span>
              </div>
              <p className="text-xs font-semibold text-muted-foreground leading-relaxed">{getRotomAdvice()}</p>
            </div>

            {/* Weakness / Resistance summary */}
            {majorWeaknesses.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-rose-400">Major Weaknesses</p>
                <div className="flex flex-wrap gap-1.5">
                  {majorWeaknesses.map(w => (
                    <span key={w.type} className="px-2.5 py-1 rounded-lg text-[10px] font-black text-white"
                      style={{ backgroundColor: getTypeColor(w.type) }}>
                      {w.type}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {majorResistances.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Strong Resistances</p>
                <div className="flex flex-wrap gap-1.5">
                  {majorResistances.map(r => (
                    <span key={r.type} className="px-2.5 py-1 rounded-lg text-[10px] font-black text-white"
                      style={{ backgroundColor: getTypeColor(r.type) }}>
                      {r.type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Defensive Coverage Matrix */}
          <div className="lg:col-span-2 glass-panel rounded-3xl border border-border p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Defensive Coverage Matrix</h3>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground">Collective Vulnerabilities</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {defensiveScores.map(score => (
                <div key={score.type} className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-muted/20 border border-border">
                  <span
                    className="text-[9px] font-black uppercase text-white px-2 py-0.5 rounded-md w-full text-center"
                    style={{ backgroundColor: getTypeColor(score.type) }}
                  >
                    {score.type}
                  </span>
                  {score.membersWithMultipliers.length > 0 ? (
                    <div className="w-full space-y-1">
                      {score.membersWithMultipliers.map((m, idx) => (
                        <div key={idx} className="flex items-center justify-center gap-1 w-full">
                          <span className={`text-[9px] px-1 py-0.5 rounded font-black font-fira ${
                            m.mult > 1 ? 'bg-rose-500 text-white' :
                            m.mult === 0 ? 'bg-foreground text-background' :
                            'bg-emerald-500 text-white'
                          }`}>
                            {m.mult}×
                          </span>
                          <span className="text-[9px] font-bold text-muted-foreground truncate max-w-[48px] capitalize">
                            {m.nickname}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[9px] font-bold text-muted-foreground">—</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search/Select Modal */}
      {activeSlot !== null && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-border shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div>
                <h3 className="font-display font-black text-xl text-foreground">Select Pokémon</h3>
                <p className="text-xs text-muted-foreground mt-0.5">For Slot {activeSlot}</p>
              </div>
              <button
                onClick={() => setActiveSlot(null)}
                className="h-9 w-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by name or national Pokédex number..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background/60 text-foreground text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:border-brand-red transition-all"
                  autoFocus
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {(['all', 1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map(gen => (
                  <button
                    key={gen}
                    onClick={() => setSelectedGen(gen)}
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                      selectedGen === gen ? 'text-white' : 'border border-border text-muted-foreground hover:text-foreground'
                    }`}
                    style={selectedGen === gen ? { backgroundColor: BRAND } : {}}
                  >
                    {gen === 'all' ? 'All' : `Gen ${gen}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 overflow-y-auto p-6 custom-scrollbar flex-1">
              {filteredPokemonList.length > 0 ? (
                filteredPokemonList.map(pokemon => (
                  <div
                    key={pokemon.id}
                    onClick={() => selectPokemonForSlot(pokemon)}
                    className="flex items-center gap-3 p-3 rounded-2xl border border-border bg-card/50 hover:bg-muted/50 cursor-pointer transition-all hover:border-brand-red"
                  >
                    <Image
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`}
                      alt={pokemon.name}
                      width={40} height={40}
                      className="object-contain shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-foreground capitalize truncate">{pokemon.name}</p>
                      <p className="text-[10px] text-muted-foreground font-fira">#{String(pokemon.id).padStart(4, '0')}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-8 text-center text-sm text-muted-foreground">No results matching filters.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-xl rounded-3xl border border-border shadow-2xl flex flex-col space-y-5 p-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <Swords className="w-5 h-5 text-blue-400" />
                <h3 className="font-display font-black text-xl text-foreground">Export: {teamName}</h3>
              </div>
              <button
                onClick={() => setExportModalOpen(false)}
                className="h-9 w-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span>Pokémon Showdown Import Format</span>
                <button onClick={copyShowdownText} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <Copy className="w-3 h-3" /> {copiedShowdown ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <textarea readOnly value={getShowdownText()}
                className="w-full h-32 p-3 font-fira text-xs rounded-xl border border-border bg-muted/20 text-emerald-400 focus:outline-none resize-none" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <span>Shareable Readable Summary</span>
                <button onClick={copyReadableText} className="flex items-center gap-1 hover:text-foreground transition-colors">
                  <Copy className="w-3 h-3" /> {copiedReadable ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <textarea readOnly value={getReadableText()}
                className="w-full h-24 p-3 font-sans text-xs rounded-xl border border-border bg-muted/20 text-foreground focus:outline-none resize-none" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
