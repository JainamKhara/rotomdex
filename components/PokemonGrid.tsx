'use client'

import React, { useState, useTransition, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { useSearchParams } from 'next/navigation'

interface Pokemon {
  id: number
  name: string
  types: string[]
  imageUrl: string
  hp: number
  attack: number
  defense: number
  generation: number
}

const ALL_TYPES = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice', 
  'fighting', 'poison', 'ground', 'flying', 'psychic', 'bug', 
  'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
]

export function PokemonGrid() {
  const searchParams = useSearchParams()
  const urlGen = searchParams.get('generation')

  const [isPending, startTransition] = useTransition()
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    generation: urlGen || '1',
    sortBy: 'id',
    sortOrder: 'asc'
  })

  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedTypes = filters.type ? filters.type.split(',') : []

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTypeDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ['pokemon', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.type) params.append('type', filters.type)
      if (filters.generation) params.append('generation', filters.generation)
      params.append('sort', filters.sortBy)
      params.append('order', filters.sortOrder)
      params.append('limit', '1025')

      const res = await fetch(`/api/pokemon?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  const pokemonList: Pokemon[] = data?.data || []

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    startTransition(() => {
      setFilters(prev => {
        const next = { ...prev, [key]: value }
        if (key === 'sortBy') {
          if (value === 'name_asc') {
            next.sortBy = 'name'
            next.sortOrder = 'asc'
          } else if (value === 'name_desc') {
            next.sortBy = 'name'
            next.sortOrder = 'desc'
          } else if (value === 'id_desc') {
            next.sortBy = 'id'
            next.sortOrder = 'desc'
          } else if (value === 'hp' || value === 'attack' || value === 'defense' || value === 'speed') {
            next.sortBy = value
            next.sortOrder = 'desc'
          } else {
            next.sortBy = 'id'
            next.sortOrder = 'asc'
          }
        }
        return next
      })
    })
  }

  const handleTypeSelect = (type: string) => {
    let newTypes = [...selectedTypes]
    if (newTypes.includes(type)) {
      newTypes = newTypes.filter(t => t !== type)
    } else {
      if (newTypes.length >= 2) {
        newTypes = [newTypes[1], type]
      } else {
        newTypes.push(type)
      }
    }
    handleFilterChange('type', newTypes.join(','))
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
      default: return '#A8A878'
    }
  }

  return (
    <div className="space-y-8">
      
      {/* Premium Dashboard Filter Panel */}
      <div className="bg-white dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-slate-200/60 dark:border-white/10 shadow-sm dark:shadow-none space-y-6 text-slate-800 dark:text-white">
        
        {/* Search & Select dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Search bar */}
          <div className="md:col-span-4 relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </span>
            <input
              type="text"
              placeholder="Search Pokémon by name..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-5 py-3 border rounded-2xl bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all text-sm font-medium shadow-inner font-sans"
            />
          </div>

          {/* Type Dropdown select (Custom Multi-select dropdown) */}
          <div className="md:col-span-3 relative" ref={dropdownRef}>
            <button
              onClick={() => setIsTypeDropdownOpen(prev => !prev)}
              type="button"
              className="w-full px-5 py-3 border rounded-2xl bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-white border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all text-sm font-medium shadow-inner font-sans flex items-center justify-between cursor-pointer"
            >
              <span className="truncate">
                {selectedTypes.length === 0 
                  ? 'All Types' 
                  : `Types: ${selectedTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}`}
              </span>
              <span className="text-slate-400 select-none ml-2">
                {isTypeDropdownOpen ? '▲' : '▼'}
              </span>
            </button>

            {isTypeDropdownOpen && (
              <div className="absolute left-0 mt-2 w-[280px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/15 rounded-2xl shadow-2xl z-50 p-4">
                <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 dark:border-white/5">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Select 1 or 2 Types
                  </span>
                  {selectedTypes.length > 0 && (
                    <button 
                      onClick={() => handleFilterChange('type', '')}
                      className="text-[10px] text-brand-red font-extrabold hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* 2-Column Grid with Checkboxes */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                  {ALL_TYPES.map((type) => {
                    const isChecked = selectedTypes.includes(type)
                    const typeColor = getTypeColor(type)
                    const isDisabled = selectedTypes.length >= 2 && !isChecked

                    return (
                      <label 
                        key={type} 
                        className={`flex items-center gap-2 cursor-pointer text-xs font-semibold select-none capitalize ${
                          isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:text-slate-950 dark:hover:text-white text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={() => handleTypeSelect(type)}
                          className="w-3.5 h-3.5 rounded border-slate-300 dark:border-white/20 bg-white dark:bg-slate-950/50 text-brand-blue focus:ring-brand-blue/30 cursor-pointer disabled:cursor-not-allowed"
                        />
                        <span 
                          className="w-2 h-2 rounded-full inline-block" 
                          style={{ backgroundColor: typeColor }}
                        />
                        <span>{type}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Generation select */}
          <div className="md:col-span-2">
            <select
              value={filters.generation}
              onChange={(e) => handleFilterChange('generation', e.target.value)}
              className="w-full px-5 py-3 border rounded-2xl bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all cursor-pointer text-sm font-medium shadow-inner font-sans"
            >
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value="">All Generations</option>
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value="1">Gen 1 (Kanto)</option>
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value="2">Gen 2 (Johto)</option>
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value="3">Gen 3 (Hoenn)</option>
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value="4">Gen 4 (Sinnoh)</option>
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value="5">Gen 5 (Unova)</option>
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value="6">Gen 6 (Kalos)</option>
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value="7">Gen 7 (Alola)</option>
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value="8">Gen 8 (Galar)</option>
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value="9">Gen 9 (Paldea)</option>
            </select>
          </div>

          {/* Sort By select */}
          <div className="md:col-span-3">
            <select
              value={filters.sortBy === 'id' && filters.sortOrder === 'asc' ? 'id_asc' : filters.sortBy === 'id' && filters.sortOrder === 'desc' ? 'id_desc' : filters.sortBy === 'name' && filters.sortOrder === 'asc' ? 'name_asc' : filters.sortBy === 'name' && filters.sortOrder === 'desc' ? 'name_desc' : filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-5 py-3 border rounded-2xl bg-slate-50 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-brand-blue/30 focus:border-brand-blue transition-all cursor-pointer text-sm font-medium shadow-inner font-sans"
            >
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value="id_asc">ID (Lowest First)</option>
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value="id_desc">ID (Highest First)</option>
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value="name_asc">Alphabetical (A-Z)</option>
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value="name_desc">Alphabetical (Z-A)</option>
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value="hp">Highest HP</option>
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value="attack">Highest Attack</option>
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value="defense">Highest Defense</option>
              <option className="bg-white dark:bg-slate-900 text-slate-800 dark:text-white" value="speed">Highest Speed</option>
            </select>
          </div>
        </div>

      </div>

      {/* Main Grid */}
      {isLoading || isPending ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200/60 dark:border-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {pokemonList.map((pokemon: Pokemon) => {
            const primaryType = pokemon.types[0] || 'normal'
            const typeColor = getTypeColor(primaryType)

            return (
              <Link key={pokemon.id} href={`/pokemon/${pokemon.id}`}>
                <div 
                  className="relative rounded-3xl p-4 flex flex-col items-center justify-between text-center transition-all duration-300 cursor-pointer h-full border select-none overflow-hidden group bg-white/80 dark:bg-slate-900/60 backdrop-blur-md shadow-3xs hover:shadow-md"
                  style={{ 
                    borderColor: `${typeColor}20`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = typeColor
                    e.currentTarget.style.boxShadow = `0 0 20px ${typeColor}30`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${typeColor}20`
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Top card info overlay */}
                  <div className="w-full flex justify-between items-center mb-2 z-10">
                    <span className="text-[9px] font-extrabold uppercase bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">
                      Gen {pokemon.generation}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-mono">
                      #{String(pokemon.id).padStart(4, '0')}
                    </span>
                  </div>

                  {/* Artwork Image with group-hover animation */}
                  <div className="w-24 h-24 relative flex items-center justify-center mb-3 z-10">
                    {pokemon.imageUrl ? (
                      <Image
                        src={pokemon.imageUrl}
                        alt={pokemon.name}
                        width={84}
                        height={84}
                        className="object-contain drop-shadow-md select-none pointer-events-none group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-xs text-slate-450 dark:text-slate-400">No Image</span>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-white capitalize mb-3 tracking-normal z-10 group-hover:text-brand-red transition-colors">
                    {pokemon.name}
                  </h3>

                  {/* Type Badges */}
                  <div className="flex gap-1.5 justify-center flex-wrap z-10">
                    {pokemon.types.map((type) => (
                      <span
                        key={type}
                        className="px-2.5 py-0.5 text-[9px] rounded-full font-extrabold uppercase tracking-wider text-white select-none shadow-sm"
                        style={{ backgroundColor: getTypeColor(type) }}
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
