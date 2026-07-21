import React from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getWeaknesses, getResistances } from '@/lib/type-chart'
import { PokemonDetailClient } from './PokemonDetailClient'

interface Props {
  params: Promise<{ id: string }>
}

const detailCache = new Map<number, any>()

async function fetchPokeAPIFallback(id: number) {
  try {
    const [pokemonRes, speciesRes] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, { cache: 'force-cache' }),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`, { cache: 'force-cache' }),
    ])
    if (!pokemonRes.ok) return null
    const [pData, sData] = await Promise.all([pokemonRes.json(), speciesRes.ok ? speciesRes.json() : Promise.resolve(null)])
    return { pData, sData }
  } catch {
    return null
  }
}

export const revalidate = 3600

export default async function PokemonDetailPage({ params }: Props) {
  const { id: idStr } = await params
  const idNum = Number(idStr)
  if (isNaN(idNum) || idNum < 1) return notFound()

  let dbPokemon = detailCache.get(idNum)
  if (!dbPokemon) {
    dbPokemon = await prisma.pokemon.findUnique({
      where: { id: idNum },
      include: {
        moves: { orderBy: { learnLevel: 'asc' } },
        abilities: true,
        evolutions: { orderBy: { evolvesToId: 'asc' } },
      },
    })
    if (dbPokemon) detailCache.set(idNum, dbPokemon)
  }
  if (!dbPokemon) return notFound()

  let abilities: { name: string; isHidden: boolean }[] = []
  let description = dbPokemon.description ?? ''
  let jpName = dbPokemon.nameJapanese ?? ''
  let evolutionSteps: { name: string; id: string; level: number | null; item: string | null }[] = []

  if (dbPokemon.abilities.length > 0) {
    abilities = dbPokemon.abilities.map((a: any) => ({ name: a.ability, isHidden: a.isHidden }))
  }
  if (dbPokemon.evolutions.length > 0) {
    evolutionSteps = dbPokemon.evolutions.map((e: any) => ({
      name: e.evolvesToName,
      id: String(e.evolvesToId),
      level: e.triggerLevel,
      item: e.triggerItem,
    }))
  }

  if (abilities.length === 0 || !description) {
    const fallback = await fetchPokeAPIFallback(idNum)
    if (fallback) {
      const { pData, sData } = fallback
      if (abilities.length === 0) {
        abilities = (pData.abilities ?? []).map((a: any) => ({ name: a.ability.name, isHidden: a.is_hidden }))
        if (abilities.length > 0) {
          prisma.pokemonAbility.createMany({
            data: abilities.map((a) => ({ pokemonId: idNum, ability: a.name, isHidden: a.isHidden })),
            skipDuplicates: true,
          }).catch(() => {})
        }
      }
      if (!description && sData) {
        const entry = (sData.flavor_text_entries ?? []).find((e: any) => e.language.name === 'en')
        if (entry) description = entry.flavor_text.replace(/[\n\f]/g, ' ')
        jpName = (sData.names ?? []).find((n: any) => n.language.name === 'ja-Hrkt')?.name ?? ''
      }
      if (evolutionSteps.length === 0 && sData?.evolution_chain?.url) {
        try {
          const evoRes = await fetch(sData.evolution_chain.url, { cache: 'force-cache' })
          if (evoRes.ok) {
            const evoData = await evoRes.json()
            let cur = evoData.chain
            while (cur) {
              const parts = cur.species.url.split('/')
              const eid = parts[parts.length - 2]
              const det = cur.evolution_details?.[0]
              evolutionSteps.push({
                name: cur.species.name,
                id: eid,
                level: det?.min_level ?? null,
                item: det?.item?.name ?? null,
              })
              cur = cur.evolves_to?.[0]
            }
          }
        } catch { /* ignore */ }
      }
    }
  }

  const moves = dbPokemon.moves.map((m: any) => ({
    name: m.moveName,
    type: m.type ?? 'normal',
    power: m.power,
    learnMethod: m.learnMethod,
    level: m.learnLevel ?? 0,
  }))

  const weaknesses = getWeaknesses(dbPokemon.types)
  const resistances = getResistances(dbPokemon.types)

  const stats = [
    { label: 'HP', val: dbPokemon.hp },
    { label: 'Attack', val: dbPokemon.attack },
    { label: 'Defense', val: dbPokemon.defense },
    { label: 'Sp. Atk', val: dbPokemon.spAtk },
    { label: 'Sp. Def', val: dbPokemon.spDef },
    { label: 'Speed', val: dbPokemon.speed },
  ]
  const totalStats = stats.reduce((s, x) => s + x.val, 0)
  const primaryType = dbPokemon.types[0] ?? 'normal'

  const pokemonData = {
    id: idNum,
    name: dbPokemon.name,
    generation: dbPokemon.generation,
    types: dbPokemon.types,
    height: dbPokemon.height ?? 0,
    weight: dbPokemon.weight ?? 0,
    baseExp: dbPokemon.baseExp ?? null,
    imageUrl: dbPokemon.imageUrl ?? null,
    shinyImageUrl: dbPokemon.shinyImageUrl ?? null,
    description: description || 'No description available.',
    jpName,
    isLegendary: dbPokemon.isLegendary ?? false,
    isMythical: dbPokemon.isMythical ?? false,
    isBaby: dbPokemon.isBaby ?? false,
    stats,
    totalStats,
    primaryType,
    abilities,
    evolutionSteps,
    moves,
    weaknesses,
    resistances,
    cries: dbPokemon.cries ?? null,
    sprites: {
      frontDefault: dbPokemon.imageUrl,
      backDefault: null,
      frontShiny: dbPokemon.shinyImageUrl,
      backShiny: null,
    },
  }

  return <PokemonDetailClient pokemon={pokemonData} />
}
