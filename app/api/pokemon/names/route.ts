import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Global cache to bypass database queries
let cachedNames: { id: number; name: string }[] | null = null

export async function GET() {
  try {
    const cacheHeaders = {
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    }

    if (cachedNames) {
      return NextResponse.json(cachedNames, { headers: cacheHeaders })
    }

    const list = await prisma.pokemon.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        id: 'asc',
      },
    })

    cachedNames = list
    return NextResponse.json(list, { headers: cacheHeaders })
  } catch (error) {
    console.error('Failed to fetch lightweight Pokemon names:', error)
    return NextResponse.json(
      { error: 'Failed to fetch Pokémon list' },
      { status: 500 }
    )
  }
}
