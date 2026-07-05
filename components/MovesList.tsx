'use client'

import React from 'react'

interface Move {
  name: string
  type?: string
  power?: number | null
  learnMethod: string
  level: number
}

interface Props {
  moves: Move[]
}

export function MovesList({ moves }: Props) {
  const getTypeColor = (type?: string) => {
    if (!type) return '#A8A878'
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

  return (
    <div className="max-h-[360px] overflow-y-auto pr-2.5 space-y-2.5 custom-scrollbar scroll-smooth">
      {moves.map((move) => (
        <div 
          key={move.name} 
          className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-950/20 dark:hover:bg-slate-900/60 rounded-2xl border border-slate-200/50 dark:border-white/5 transition-all shadow-3xs"
        >
          <div className="flex items-center gap-3">
            {move.type && (
              <span 
                className="text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest select-none min-w-[85px] text-center shadow-xs"
                style={{ backgroundColor: getTypeColor(move.type) }}
              >
                {move.type}
              </span>
            )}
            <span className="capitalize text-sm font-extrabold text-slate-800 dark:text-white">
              {move.name.replace(/-/g, ' ')}
            </span>
          </div>
          {move.power ? (
            <span className="font-mono text-sm font-black text-slate-800 dark:text-white mr-2">
              {move.power}
            </span>
          ) : (
            <span className="w-4 mr-2" />
          )}
        </div>
      ))}
    </div>
  )
}
