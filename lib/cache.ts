import { unstable_cache } from 'next/cache'
import { prisma } from './prisma'

/**
 * Cached individual Pokémon detail (24-hour TTL).
 * Includes all relations needed for the detail page.
 */
export const getCachedPokemon = unstable_cache(
  async (id: number) => {
    return prisma.pokemon.findUnique({
      where: { id },
      include: {
        moves: { orderBy: { learnLevel: 'asc' } },
        abilities: true,
        evolutions: { orderBy: { evolvesToId: 'asc' } },
      },
    })
  },
  ['pokemon-detail'],
  { revalidate: 86400, tags: ['pokemon-detail'] }
)

/**
 * Cached Pokédex list page (1-hour TTL).
 * Only selects the minimal columns needed for the grid cards.
 */
export const getCachedList = unstable_cache(
  async (limit = 48, offset = 0, generation?: number) => {
    return prisma.pokemon.findMany({
      where: generation ? { generation } : undefined,
      take: limit,
      skip: offset,
      orderBy: { id: 'asc' },
      select: {
        id: true,
        name: true,
        types: true,
        imageUrl: true,
        generation: true,
        hp: true,
        attack: true,
        defense: true,
      },
    })
  },
  ['pokemon-list'],
  { revalidate: 3600, tags: ['pokemon-list'] }
)
