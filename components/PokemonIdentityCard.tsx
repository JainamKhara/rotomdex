'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Ruler, Weight, Sparkles } from 'lucide-react'

interface Props {
  pokemon: any
  species: any
  genus?: string
  jpName?: string
  engFlavorText: string
}

export function PokemonIdentityCard({
  pokemon,
  species,
  genus,
  jpName,
  engFlavorText,
}: Props) {
  const [showShiny, setShowShiny] = useState(false)

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

  const normalImage = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default
  const shinyImage = pokemon.sprites.other['official-artwork'].front_shiny || pokemon.sprites.front_shiny || normalImage

  const currentImage = showShiny ? shinyImage : normalImage

  return (
    <section 
      className="relative overflow-hidden rounded-[32px] border bg-white dark:bg-slate-900 transition-all duration-500 group"
      style={{
        borderColor: `${primaryTypeColor}33`,
        boxShadow: `0 20px 40px -15px ${primaryTypeColor}20`,
      }}
    >
      {/* Dynamic Gradient Top Banner */}
      <div 
        className="relative p-6 text-white pb-32 overflow-hidden select-none"
        style={{ 
          background: `linear-gradient(135deg, ${primaryTypeColor} 0%, ${primaryTypeColor}cc 100%)` 
        }}
      >
        {/* Spinning Pokeball design */}
        <div className="absolute right-0 top-0 opacity-15 w-48 h-48 translate-x-8 -translate-y-8 pointer-events-none select-none animate-spin-slow">
          <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="5" className="w-full h-full text-white">
            <circle cx="50" cy="50" r="45" />
            <line x1="5" y1="50" x2="95" y2="50" />
            <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="5" />
            <circle cx="50" cy="50" r="6" fill="currentColor" />
          </svg>
        </div>

        <div className="relative z-10 flex justify-between items-start">
          <div className="space-y-1">
            <span className="inline-block text-[10px] font-black tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full uppercase">
              Gen {pokemon.generation || 1}
            </span>
            <h1 className="text-3xl font-black capitalize tracking-tight">{pokemon.name}</h1>
            {genus && <span className="text-white/90 text-xs font-semibold block tracking-wide">{genus}</span>}
            {jpName && <span className="text-white/70 text-xs font-medium font-sans block">{jpName}</span>}
          </div>
          <span className="text-sm font-black bg-white/10 dark:bg-black/15 backdrop-blur-xs px-3 py-1 rounded-2xl font-mono text-white/90 shadow-xs border border-white/10">
            #{String(pokemon.id).padStart(4, '0')}
          </span>
        </div>
      </div>

      {/* Card body overlay */}
      <div className="px-6 pb-6 -mt-16 flex flex-col bg-white dark:bg-slate-900 rounded-t-[32px] border-t border-slate-200/50 dark:border-white/5 pt-4 relative z-10">
        
        {/* Large Premium Artwork Showcase */}
        <div className="w-full flex justify-center mb-8 relative">
          
          {/* Spotlight Background circular portal */}
          <div className="absolute w-[240px] h-[240px] rounded-full bg-slate-500/5 dark:bg-white/5 border border-slate-500/10 dark:border-white/5 flex items-center justify-center -top-20 z-0">
            <div 
              className="absolute w-[180px] h-[180px] rounded-full blur-3xl opacity-25 dark:opacity-35 pointer-events-none"
              style={{ backgroundColor: primaryTypeColor }}
            />
          </div>

          {/* Interactive Shiny Toggle Float Button */}
          <button
            onClick={() => setShowShiny(prev => !prev)}
            className="absolute top-0 right-2 z-20 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md hover:scale-105 active:scale-95 cursor-pointer bg-white/95 dark:bg-slate-800 border border-slate-250/50 dark:border-white/10 text-slate-850 dark:text-slate-100"
            style={{
              boxShadow: showShiny ? `0 4px 12px ${primaryTypeColor}40` : 'none',
              borderColor: showShiny ? `${primaryTypeColor}60` : undefined,
            }}
          >
            <Sparkles 
              className={`w-3.5 h-3.5 transition-colors ${
                showShiny ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
              }`}
            />
            <span>{showShiny ? 'Shiny' : 'Normal'}</span>
          </button>

          {/* Artwork Image Container */}
          <div className="relative z-10 select-none pointer-events-none min-h-[240px] w-[240px] flex items-center justify-center">
            <img 
              src={currentImage} 
              alt={pokemon.name} 
              width={240} 
              height={240} 
              className="object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>
        </div>

        {/* Badges and tags */}
        <div className="flex gap-2 justify-center mb-6">
          {pokemon.types.map((t: any) => (
            <span
              key={t.type.name}
              className="px-4 py-1 text-xs font-black uppercase tracking-wider text-white rounded-full shadow-xs"
              style={{ backgroundColor: getTypeColor(t.type.name) }}
            >
              {t.type.name}
            </span>
          ))}
        </div>

        {/* Sizing blocks */}
        <div className="grid grid-cols-2 gap-4 mb-6 w-full border-t border-b border-slate-100 dark:border-white/5 py-4">
          <div className="flex items-center gap-3.5 bg-slate-50/60 dark:bg-slate-950/20 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
              <Ruler className="w-5 h-5 -rotate-45" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">Height</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">{(pokemon.height / 10).toFixed(1)} m</span>
            </div>
          </div>
          <div className="flex items-center gap-3.5 bg-slate-50/60 dark:bg-slate-950/20 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
              <Weight className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">Weight</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-base leading-tight">{(pokemon.weight / 10).toFixed(1)} kg</span>
            </div>
          </div>
        </div>

        {/* Description box */}
        <div 
          className="relative rounded-2xl p-4 w-full bg-slate-50 dark:bg-slate-950/40 border-l-4"
          style={{ borderLeftColor: primaryTypeColor }}
        >
          {/* Large decorative quotation mark */}
          <span className="absolute -top-3 -left-1 text-5xl font-serif text-slate-200/50 dark:text-slate-800/40 select-none pointer-events-none">“</span>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold relative z-10 italic pl-1">
            {engFlavorText.replace(/[\n\f]/g, ' ')}
          </p>
        </div>
      </div>
    </section>
  )
}
