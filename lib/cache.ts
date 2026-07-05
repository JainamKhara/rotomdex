import { unstable_cache } from 'next/cache'
import { prisma } from './prisma'

export const getCachedPokemon = unstable_cache(
  async (id: number) => {
    return prisma.pokemon.findUnique({
      where: { id },
      include: {
        moves: true,
        abilities: true,
        evolutions: true,
      },
    })
  },
  ['pokemon'],
  { revalidate: 3600, tags: ['pokemon'] }
)

export const getCachedList = unstable_cache(
  async (limit: number = 20, offset: number = 0) => {
    return prisma.pokemon.findMany({
      take: limit,
      skip: offset,
      select: {
        id: true,
        name: true,
        types: true,
        imageUrl: true,
      },
    })
  },
  ['pokemon-list'],
  { revalidate: 1800, tags: ['pokemon-list'] }
)
