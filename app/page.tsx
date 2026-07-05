'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { ThemeToggle } from '@/components/ThemeToggle'
import { 
  SlidersHorizontal, 
  Swords, 
  Shield, 
  RotateCw,
  Trophy
} from 'lucide-react'

interface GamePokemon {
  name: string
  id: number
}

export default function HomePage() {
  const [fullList, setFullList] = useState<GamePokemon[]>([])
  const [target, setTarget] = useState<GamePokemon | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [selectedGuess, setSelectedGuess] = useState<string | null>(null)
  const [streak, setStreak] = useState<number>(0)
  
  // Anti-flash state
  const [imageLoaded, setImageLoaded] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    async function loadAllPokemon() {
      try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025')
        if (res.ok) {
          const data = await res.json()
          const formatted = data.results.map((p: any, idx: number) => ({
            name: p.name,
            id: idx + 1
          }))
          setFullList(formatted)
          
          // Setup first target
          const targetItem = formatted[Math.floor(Math.random() * formatted.length)]
          setTarget(targetItem)
          setSelectedGuess(null)
          setImageLoaded(false)

          const choices = new Set<string>()
          choices.add(targetItem.name)
          while (choices.size < 4) {
            const randomOpt = formatted[Math.floor(Math.random() * formatted.length)].name
            choices.add(randomOpt)
          }
          setOptions(Array.from(choices).sort(() => Math.random() - 0.5))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadAllPokemon()
  }, [])

  const generateNewRound = () => {
    if (fullList.length === 0) return
    setImageLoaded(false)
    const randomTarget = fullList[Math.floor(Math.random() * fullList.length)]
    setTarget(randomTarget)
    setSelectedGuess(null)

    const choices = new Set<string>()
    choices.add(randomTarget.name)
    while (choices.size < 4) {
      const randomOpt = fullList[Math.floor(Math.random() * fullList.length)].name
      choices.add(randomOpt)
    }
    setOptions(Array.from(choices).sort(() => Math.random() - 0.5))
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
    <div className="min-h-screen flex flex-col text-slate-800 dark:text-slate-100 font-sans selection:bg-brand-red selection:text-white">
      {/* TopNavBar */}
      <nav className="sticky top-0 w-full h-[72px] z-50 bg-white/80 dark:bg-slate-950/40 backdrop-blur-md border-b border-slate-200/60 dark:border-white/5">
        <div className="flex justify-between items-center px-6 w-full max-w-7xl mx-auto h-full">
          <Logo />
          <ul className="hidden md:flex gap-6 h-full items-center">
            <li className="h-full flex items-center">
              <Link className="text-sm text-brand-red font-bold border-b-2 border-brand-red h-full flex items-center" href="/">Home</Link>
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
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link 
              href="/pokedex"
              className="text-xs font-extrabold bg-brand-red hover:bg-red-600 text-white px-5 py-2.5 rounded-full transition-all shadow-md"
            >
              Launch Database
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 space-y-16">
        
        {/* HERO SECTION: Who's That Pokémon Interactive Mini-Game */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-4">
          
          {/* Left Hero Column: Typography & CTAs */}
          <div className="lg:col-span-6 space-y-6">
            <span className="bg-brand-red/10 text-brand-red font-mono text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full font-bold border border-brand-red/20 inline-block font-sans">
              ROTOMDEX ENTERTAINMENT MODULE
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-normal leading-tight">
              Explore Pokémon <br />
              With <span className="text-brand-red">High Fidelity</span>
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed font-medium max-w-xl">
              A premium dashboard for evaluating base stat matrices, calculating elemental type matchups, and drafting tactical squad options.
            </p>

            <div className="flex gap-4">
              <Link 
                href="/pokedex"
                className="px-6 py-3 bg-brand-red hover:bg-red-600 text-white font-extrabold text-xs rounded-xl shadow-md hover:scale-105 active:scale-98 transition-all"
              >
                Launch Pokédex
              </Link>
              <Link 
                href="/compare"
                className="px-6 py-3 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-extrabold text-xs rounded-xl border border-slate-200 dark:border-white/10 transition-all"
              >
                Compare Tool
              </Link>
            </div>
          </div>

          {/* Right Hero Column: Who's That Pokémon Game Container */}
          <div className="lg:col-span-6 flex flex-col">
            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-slate-200/60 dark:border-white/10 shadow-xl shadow-slate-100 dark:shadow-none relative overflow-hidden flex flex-col justify-between h-[480px]">
              
              {/* Header block with Streak Counter */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-3">
                <span className="text-[10px] font-black text-slate-900 dark:text-white font-mono tracking-widest">
                  WHO'S THAT POKÉMON?
                </span>
                <div className="flex items-center gap-1.5 bg-brand-red/10 text-brand-red px-2.5 py-0.5 rounded-full border border-brand-red/20 font-mono text-[10px] font-bold">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>STREAK: {streak}</span>
                </div>
              </div>

              {/* Silhouette / Answer Artwork Frame */}
              <div className="flex-1 flex flex-col items-center justify-center min-h-[170px] relative select-none">
                <div className="absolute inset-0 bg-radial from-slate-100 to-transparent dark:from-slate-800/20 opacity-70 pointer-events-none rounded-2xl" />
                
                {loading ? (
                  <div className="flex flex-col items-center gap-2">
                    <RotateCw className="w-8 h-8 text-brand-red animate-spin" />
                    <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider animate-pulse">Initializing OS Module...</span>
                  </div>
                ) : (
                  target && (
                    <img 
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${target.id}.png`}
                      alt="Who's That Pokémon?"
                      onLoad={() => setImageLoaded(true)}
                      className={`w-36 h-36 object-contain transition-all duration-300 select-none pointer-events-none ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      } ${
                        roundOver ? 'brightness-100 contrast-100' : 'brightness-0 contrast-0'
                      }`}
                    />
                  )
                )}
              </div>

              {/* Fixed Feedback readouts */}
              <div className="h-6 flex items-center justify-center mb-1 select-none">
                {roundOver && target && (
                  <div className="animate-bounce text-center">
                    {guessedCorrectly ? (
                      <span className="text-xs font-black uppercase tracking-widest text-green-600 dark:text-green-400">
                        Correct! It's {target.name.replace(/-/g, ' ')}!
                      </span>
                    ) : (
                      <span className="text-xs font-black uppercase tracking-widest text-red-500 dark:text-red-400">
                        Incorrect! It's {target.name.replace(/-/g, ' ')}!
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Multiple Choice Answers & Next Round CTA */}
              <div className="space-y-2.5">
                {!loading && (
                  <div className="grid grid-cols-2 gap-2.5">
                    {options.map((opt) => {
                      const isSelected = selectedGuess === opt
                      const isCorrectAnswer = target && opt === target.name
                      
                      let btnStyle = 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-950/40 dark:hover:bg-slate-900 text-slate-850 dark:text-slate-200 border border-slate-200/50 dark:border-white/5'
                      
                      if (roundOver) {
                        if (isCorrectAnswer) {
                          btnStyle = 'bg-green-500/20 text-green-650 dark:text-green-400 border border-green-500/40 font-bold'
                        } else if (isSelected) {
                          btnStyle = 'bg-red-500/20 text-red-655 dark:text-red-450 border border-red-500/40 font-bold line-through'
                        } else {
                          btnStyle = 'bg-slate-50 dark:bg-slate-950/20 text-slate-400 border border-transparent opacity-40 cursor-not-allowed'
                        }
                      }

                      return (
                        <button
                          key={opt}
                          disabled={roundOver}
                          onClick={() => handleGuess(opt)}
                          className={`py-3 px-4 rounded-xl text-xs font-extrabold capitalize transition-all duration-200 select-none cursor-pointer truncate ${btnStyle}`}
                        >
                          {opt.replace(/-/g, ' ')}
                        </button>
                      )
                    })}
                  </div>
                )}

                {roundOver && (
                  <button
                    onClick={generateNewRound}
                    className="w-full py-3 bg-brand-red hover:bg-red-650 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-102"
                  >
                    <RotateCw className="w-4 h-4" /> Load Next Round
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* STATS COUNT TICKER SECTION */}
        <section className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-md dark:shadow-none px-8 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white font-mono block">1,025</span>
            <span className="text-[10px] text-slate-450 dark:text-slate-400 font-extrabold uppercase tracking-wider">Pokémon Available</span>
          </div>
          <div className="border-l border-slate-150 dark:border-white/5">
            <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white font-mono block">18</span>
            <span className="text-[10px] text-slate-450 dark:text-slate-400 font-extrabold uppercase tracking-wider">Elemental Types</span>
          </div>
          <div className="border-l border-slate-150 dark:border-white/5">
            <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white font-mono block">Gen 1-9</span>
            <span className="text-[10px] text-slate-450 dark:text-slate-400 font-extrabold uppercase tracking-wider">Seeded Generations</span>
          </div>
          <div className="border-l border-slate-150 dark:border-white/5">
            <span className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white font-mono block">100%</span>
            <span className="text-[10px] text-slate-450 dark:text-slate-400 font-extrabold uppercase tracking-wider">Responsive Layout</span>
          </div>
        </section>

        {/* CORE TOOLS SECTION */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-normal">Explore Core Database Tools</h2>
            <p className="text-xs text-slate-555 dark:text-slate-400 leading-relaxed font-semibold">
              Every utility is fully integrated with database metrics for seamless planning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Tool 1 */}
            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-slate-200/60 dark:border-white/10 shadow-md hover:shadow-lg dark:shadow-none hover:-translate-y-1 hover:border-brand-red/30 transition-all duration-300">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-red/10 flex items-center justify-center text-brand-red font-bold text-lg">
                  <SlidersHorizontal className="w-5 h-5 text-brand-red" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-850 dark:text-white">Advanced Filter Grid</h3>
                <p className="text-xs text-slate-555 dark:text-slate-350 leading-relaxed font-medium">
                  Search, filter by dual-type matrices, select generations, sort by base stats, and explore entries instantly.
                </p>
              </div>
              <Link href="/pokedex" className="text-xs font-extrabold text-brand-red hover:underline flex items-center gap-1">
                Open Grid →
              </Link>
            </div>

            {/* Tool 2 */}
            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-slate-200/60 dark:border-white/10 shadow-md hover:shadow-lg dark:shadow-none hover:-translate-y-1 hover:border-brand-blue/30 transition-all duration-300">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue font-bold text-lg">
                  <Swords className="w-5 h-5 text-brand-blue" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-855 dark:text-white">Stat Comparisons</h3>
                <p className="text-xs text-slate-555 dark:text-slate-355 leading-relaxed font-medium">
                  Compare base stats, dimensions, and defensive/offensive damage matchups between two Pokémon side-by-side.
                </p>
              </div>
              <Link href="/compare" className="text-xs font-extrabold text-brand-red hover:underline flex items-center gap-1">
                Compare Stats →
              </Link>
            </div>

            {/* Tool 3 */}
            <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 border border-slate-200/60 dark:border-white/10 shadow-md hover:shadow-lg dark:shadow-none hover:-translate-y-1 hover:border-amber-500/30 transition-all duration-300">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600 font-bold text-lg">
                  <Shield className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-lg font-extrabold text-slate-855 dark:text-white">Team Builder</h3>
                <p className="text-xs text-slate-555 dark:text-slate-355 leading-relaxed font-medium">
                  Assemble custom teams, set levels, set custom nicknames, and evaluate type coverage options.
                </p>
              </div>
              <Link href="/teams" className="text-xs font-extrabold text-brand-red hover:underline flex items-center gap-1">
                Build Squad →
              </Link>
            </div>

          </div>
        </section>

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
        <p className="text-[11px] text-slate-450 dark:text-slate-400 max-w-2xl">
          Data provided by PokéAPI. Pokémon and Pokémon character names are trademarks of Nintendo.
        </p>
      </footer>
    </div>
  )
}
