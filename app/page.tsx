'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Trophy, RotateCw, CheckCircle2, XCircle, Play,
  BookOpen, Swords, Users, HelpCircle, ChevronRight
} from 'lucide-react'

interface GamePokemon {
  name: string
  id: number
}

const BRAND = 'oklch(0.55 0.28 29.5)'
const BRAND_DARK = 'oklch(0.48 0.27 29.5)'

const TICKER_ITEMS = [
  { label: 'Pokémon Available', value: '1,025' },
  { label: 'Elemental Types', value: '18' },
  { label: 'Generations Covered', value: 'Gen 1–9' },
  { label: 'Responsive Layout', value: '100%' },
  { label: 'Type Weakness Math', value: 'Dynamic' },
  { label: 'Database Status', value: 'Operational' },
]

export default function HomePage() {
  const [fullList, setFullList] = useState<GamePokemon[]>([])
  const [target, setTarget] = useState<GamePokemon | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [selectedGuess, setSelectedGuess] = useState<string | null>(null)
  const [streak, setStreak] = useState<number>(0)
  const [imageLoaded, setImageLoaded] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const gameRef = useRef<HTMLDivElement>(null)

  // Load streak from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('rotomdex_game_streak')
    if (saved) setStreak(Number(saved))
  }, [])

  // Save streak
  useEffect(() => {
    localStorage.setItem('rotomdex_game_streak', String(streak))
  }, [streak])

  useEffect(() => {
    async function loadGameData() {
      try {
        const res = await fetch('/api/pokemon/names')
        if (res.ok) {
          const formatted = await res.json()
          setFullList(formatted)
          if (formatted.length > 0) {
            initRound(formatted)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadGameData()
  }, [])

  function initRound(list: GamePokemon[]) {
    const targetItem = list[Math.floor(Math.random() * list.length)]
    setTarget(targetItem)
    setSelectedGuess(null)
    setImageLoaded(false)
    const choices = new Set<string>()
    choices.add(targetItem.name)
    while (choices.size < Math.min(4, list.length)) {
      choices.add(list[Math.floor(Math.random() * list.length)].name)
    }
    setOptions(Array.from(choices).sort(() => Math.random() - 0.5))
  }

  const generateNewRound = () => {
    if (fullList.length === 0) return
    initRound(fullList)
  }

  const handleGuess = (guess: string) => {
    if (selectedGuess !== null || !target) return
    setSelectedGuess(guess)
    if (guess === target.name) {
      setStreak(prev => prev + 1)
    } else {
      setStreak(0)
    }
  }

  const roundOver = selectedGuess !== null
  const guessedCorrectly = target && selectedGuess === target.name

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-10 space-y-14">

        {/* ══ HERO ══ */}
        <section className="text-center space-y-6 pt-4">
          {/* Status Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border glass-panel">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: BRAND }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: BRAND }} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">RotomDex Active</span>
          </div>

          {/* H1 */}
          <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl leading-tight tracking-tight text-foreground">
            The Next Gen Tactical{' '}
            <br className="hidden sm:block" />
            <span style={{ color: BRAND }}>Pokédex &amp; Arena</span> Dashboard
          </h1>

          {/* Subtitle */}
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            Real-time stats lookup, custom BST breakdowns, damage multipliers,
            dual combatant simulation, and synergy audits across all 1,025 Pokémon.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/pokedex"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
              style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})`, boxShadow: `0 8px 24px ${BRAND}40` }}
            >
              <Play className="w-4 h-4 fill-white" />
              Launch Database
            </Link>
            <button
              onClick={() => gameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-bold text-sm border border-border text-foreground glass-panel transition-all duration-200 hover:bg-muted/30 active:scale-95"
            >
              Play Mini-Game
            </button>
          </div>
        </section>

        {/* ══ STATS TICKER ══ */}
        <div className="ticker-container rounded-2xl border border-border glass-panel py-4 select-none">
          <div className="flex animate-ticker whitespace-nowrap" style={{ width: 'max-content' }}>
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-6 text-sm">
                <span className="text-muted-foreground font-semibold">{item.label}:</span>
                <span className="font-black" style={{ color: BRAND }}>{item.value}</span>
                {i < (TICKER_ITEMS.length * 2) - 1 && (
                  <span className="text-muted-foreground ml-4 opacity-40">•</span>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* ══ MINI-GAME: Interactive Scanner ══ */}
        <section ref={gameRef} className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="font-display font-black text-2xl md:text-3xl text-foreground">
              Interactive Scanner Subsystem
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Identify the silhouette — test your Pokémon recognition skills
            </p>
          </div>

          <div className="glass-panel rounded-3xl border border-border shadow-xl overflow-hidden">
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-bold text-muted-foreground">Streak Counter:</span>
                <span
                  className="px-3 py-0.5 rounded-full text-xs font-black text-white"
                  style={{ backgroundColor: streak > 0 ? '#f59e0b' : 'oklch(0.30 0.02 270)' }}
                >
                  {streak}
                </span>
              </div>
              <button
                onClick={() => setStreak(0)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
              >
                Reset Streak
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Silhouette display */}
              <div
                className="relative aspect-video max-h-72 rounded-2xl overflow-hidden flex items-center justify-center mx-auto"
                style={{ background: 'var(--silhouette-bg)' }}
              >
                {loading ? (
                  <div className="flex flex-col items-center gap-3">
                    <RotateCw className="w-8 h-8 animate-spin" style={{ color: BRAND }} />
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
                      Loading Database...
                    </span>
                  </div>
                ) : target ? (
                  <>
                    {!imageLoaded && (
                      <RotateCw className="absolute w-8 h-8 animate-spin text-muted-foreground" />
                    )}
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${target.id}.png`}
                      alt="Who's That Pokémon?"
                      onLoad={() => setImageLoaded(true)}
                      className={`h-52 object-contain transition-all duration-700 select-none pointer-events-none drop-shadow-2xl ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      } ${roundOver ? '' : 'brightness-0'}`}
                    />
                  </>
                ) : null}
              </div>

              {/* Answer options */}
              {!loading && (
                <div className="grid grid-cols-2 gap-3">
                  {options.map((opt) => {
                    const isSelected = selectedGuess === opt
                    const isCorrectAnswer = target && opt === target.name

                    let cls = 'border border-border glass-panel text-foreground hover:border-muted-foreground'
                    let icon = null

                    if (roundOver) {
                      if (isCorrectAnswer) {
                        cls = 'border-2 border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      } else if (isSelected) {
                        cls = 'border-2 border-rose-500 bg-rose-500/10 text-rose-400'
                        icon = <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      } else {
                        cls = 'border border-border opacity-40 text-muted-foreground cursor-not-allowed'
                      }
                    }

                    return (
                      <button
                        key={opt}
                        disabled={roundOver}
                        onClick={() => handleGuess(opt)}
                        className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold capitalize transition-all duration-200 cursor-pointer ${cls}`}
                      >
                        {icon}
                        <span className="truncate">{opt.replace(/-/g, ' ')}</span>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Feedback banner */}
              {roundOver && target && (
                <div className={`rounded-2xl p-4 border flex flex-col sm:flex-row items-start sm:items-center gap-4 transition-all ${
                  guessedCorrectly
                    ? 'border-emerald-500/40 bg-emerald-500/10'
                    : 'border-rose-500/40 bg-rose-500/10'
                }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    guessedCorrectly ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                  }`}>
                    {guessedCorrectly
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      : <XCircle className="w-5 h-5 text-rose-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-black ${guessedCorrectly ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {guessedCorrectly ? 'Correct Answer!' : 'Scanner Recalibration Required'}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5 capitalize">
                      It's <strong className="text-foreground capitalize">{target.name.replace(/-/g, ' ')}</strong>
                      {' '}—{' '}
                      <span className="font-fira">#{String(target.id).padStart(4, '0')}</span>
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                    <Link
                      href={`/pokemon/${target.id}`}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold border border-border text-foreground hover:bg-muted/30 transition-all text-center"
                    >
                      Analyze Profile
                    </Link>
                    <button
                      onClick={generateNewRound}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5"
                      style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      Load Next Round
                    </button>
                  </div>
                </div>
              )}

              {/* Next round button (initial / after round) */}
              {roundOver && !target && (
                <button
                  onClick={generateNewRound}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: `linear-gradient(135deg, ${BRAND}, ${BRAND_DARK})` }}
                >
                  <RotateCw className="w-4 h-4" /> Load Next Round
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ══ AVAILABLE SUBSYSTEMS ══ */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="font-display font-black text-2xl md:text-3xl text-foreground">
              Available Subsystems
            </h2>
            <p className="text-sm text-muted-foreground font-medium">
              Every utility is fully integrated with the database for seamless tactical planning.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

            {/* Pokédex Subsystem — wide */}
            <Link
              href="/pokedex"
              className="lg:col-span-2 glass-panel rounded-3xl border border-border p-6 flex flex-col gap-4 group hover:-translate-y-1 transition-all duration-300 hover:shadow-xl"
              style={{ ['--hover-shadow' as string]: `0 20px 40px ${BRAND}20` }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 20px 40px ${BRAND}20`)}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300"
                  style={{ background: `${BRAND}20` }}
                >
                  <BookOpen className="w-6 h-6" style={{ color: BRAND }} />
                </div>
                <div className="space-y-1 flex-1">
                  <h3 className="font-display font-black text-lg text-foreground">Pokédex Subsystem</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Full national database — search, filter by type &amp; generation, sort by any base stat. Inspect every entry in detail.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-border mt-auto">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-xs text-muted-foreground font-semibold">Database Standby</span>
                <span className="ml-auto px-2.5 py-0.5 rounded-full text-[10px] font-black border border-border text-muted-foreground">
                  1,025 records
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Compare Arena */}
            <Link
              href="/compare"
              className="glass-panel rounded-3xl border border-border p-6 flex flex-col gap-4 group hover:-translate-y-1 transition-all duration-300"
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 20px 40px #3b82f640')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-blue-500/15 group-hover:scale-110 transition-transform duration-300">
                  <Swords className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-foreground">Compare Arena</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                    Head-to-head stat comparison with type effectiveness analysis and battle verdict.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border mt-auto">
                <span className="text-xs text-muted-foreground font-semibold">Simulate Battles</span>
                <span className="ml-auto px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/15 text-blue-400 border border-blue-500/20">
                  Dual Slots
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

            {/* Team Builder */}
            <Link
              href="/teams"
              className="glass-panel rounded-3xl border border-border p-6 flex flex-col gap-4 group hover:-translate-y-1 transition-all duration-300"
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 20px 40px #f59e0b40')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-amber-500/15 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-foreground">Team Builder</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                    Assemble 6-member squads with level control, synergy scoring, and coverage auditing.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-border mt-auto">
                <span className="text-xs text-muted-foreground font-semibold">Party Synergy</span>
                <span className="ml-auto px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                  Auditing Active
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>

          </div>
        </section>

      </div>
    </div>
  )
}
