import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Input validation using Zod
const pokemonQuerySchema = z.object({
  search: z.string().optional(),
  type: z.string().optional(),
  generation: z.string().transform(Number).optional(),
  minHp: z.string().transform(Number).optional(),
  maxHp: z.string().transform(Number).optional(),
  minAttack: z.string().transform(Number).optional(),
  maxAttack: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).default(20),
  offset: z.string().transform(Number).default(0),
  sort: z.string().default('id'),
  order: z.enum(['asc', 'desc']).default('asc'),
  ids: z.string().optional(), // optional comma-separated list of IDs, e.g. "1,4"
})

// Global in-memory cache to bypass database roundtrips
const apiCache = new Map<string, any>()

export async function GET(request: NextRequest) {
  try {
    const searchParams = Object.fromEntries(request.nextUrl.searchParams)
    const validatedParams = pokemonQuerySchema.parse(searchParams)

    const cacheKey = JSON.stringify(validatedParams)
    if (apiCache.has(cacheKey)) {
      console.log('Returning cached API response for key:', cacheKey)
      return NextResponse.json(apiCache.get(cacheKey), { status: 200 })
    }

    const {
      search,
      type,
      generation,
      minHp,
      maxHp,
      minAttack,
      maxAttack,
      limit,
      offset,
      sort,
      order,
      ids,
    } = validatedParams

    // Build dynamic where clause
    const where: any = {}

    if (ids) {
      const parsedIds = ids.split(',').map(Number).filter(n => !isNaN(n))
      if (parsedIds.length > 0) {
        where.id = { in: parsedIds }
      }
    } else {
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ]
      }

      if (type) {
        const typeList = type.split(',')
        if (typeList.length > 1) {
          where.types = { hasEvery: typeList }
        } else {
          where.types = { has: typeList[0] }
        }
      }

      if (generation) {
        where.generation = generation
      }

      if (minHp || maxHp) {
        where.hp = {}
        if (minHp) where.hp.gte = minHp
        if (maxHp) where.hp.lte = maxHp
      }

      if (minAttack || maxAttack) {
        where.attack = {}
        if (minAttack) where.attack.gte = minAttack
        if (maxAttack) where.attack.lte = maxAttack
      }
    }

    // Execute query with Prisma
    const [pokemon, total] = await Promise.all([
      prisma.pokemon.findMany({
        where,
        select: {
          id: true,
          name: true,
          types: true,
          imageUrl: true,
          hp: true,
          attack: true,
          defense: true,
          spAtk: true,
          spDef: true,
          speed: true,
          generation: true,
          height: true,
          weight: true,
          baseExp: true,
          catchRate: true,
          legend: true,
          mythical: true,
          isFinal: true,
          isBaby: true,
          // Select evolutions only when fetching detail IDs to prevent huge IN batch scans
          ...(ids ? {
            evolutions: {
              select: {
                evolvesToId: true
              }
            }
          } : {})
        },
        orderBy: { [sort]: order },
        skip: ids ? 0 : offset,
        take: ids ? undefined : limit,
      }),
      prisma.pokemon.count({ where }),
    ])

    const transformedPokemon = pokemon.map((p: any) => ({
      ...p,
      isFinal: ids ? p.evolutions.length === 0 : p.isFinal,
      evolutions: undefined
    }))

    const responseData = {
      data: transformedPokemon,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
    }
    apiCache.set(cacheKey, responseData)
    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        // Cache at CDN for 1 hour; serve stale for up to 24 hours while revalidating
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Pokémon' },
      { status: 500 }
    )
  }
}
