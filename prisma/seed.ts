import dotenv from 'dotenv'
import path from 'path'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import axios from 'axios'

// Explicitly load env variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🚀 Seeding all 9 generations of Pokémon database in parallel batches...')

  const BATCH_SIZE = 20
  const TOTAL_POKEMON = 1025 // All 9 Generations

  try {
    for (let i = 1; i <= TOTAL_POKEMON; i += BATCH_SIZE) {
      const batchIds = []
      for (let j = 0; j < BATCH_SIZE && (i + j) <= TOTAL_POKEMON; j++) {
        batchIds.push(i + j)
      }

      console.log(`Sending batch IDs ${batchIds[0]} to ${batchIds[batchIds.length - 1]}...`)

      await Promise.all(
        batchIds.map(async (id) => {
          try {
            const [pokemonRes, speciesRes] = await Promise.all([
              axios.get(`https://pokeapi.co/api/v2/pokemon/${id}`, { timeout: 8000 }),
              axios.get(`https://pokeapi.co/api/v2/pokemon-species/${id}`, { timeout: 8000 }),
            ])

            const pokemon = pokemonRes.data
            const species = speciesRes.data

            // Extract English description
            const engFlavorText = species.flavor_text_entries.find(
              (e: any) => e.language.name === 'en'
            )?.flavor_text || ''

            // Determine generation from PokeAPI generation name or mapping
            const generationName = species.generation?.name || 'generation-i'
            let generation = 1
            if (generationName.includes('-ii')) generation = 2
            else if (generationName.includes('-iii')) generation = 3
            else if (generationName.includes('-iv')) generation = 4
            else if (generationName.includes('-v')) generation = 5
            else if (generationName.includes('-vi')) generation = 6
            else if (generationName.includes('-vii')) generation = 7
            else if (generationName.includes('-viii')) generation = 8
            else if (generationName.includes('-ix')) generation = 9

            await prisma.pokemon.upsert({
              where: { id: pokemon.id },
              update: {
                name: pokemon.name,
                types: pokemon.types.map((t: any) => t.type.name),
                hp: pokemon.stats[0].base_stat,
                attack: pokemon.stats[1].base_stat,
                defense: pokemon.stats[2].base_stat,
                spAtk: pokemon.stats[3].base_stat,
                spDef: pokemon.stats[4].base_stat,
                speed: pokemon.stats[5].base_stat,
                imageUrl: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default,
                height: pokemon.height,
                weight: pokemon.weight,
                baseExp: pokemon.base_experience,
                generation: generation,
                description: engFlavorText.replace(/[\n\f]/g, ' '),
                habitat: species.habitat?.name || null,
                genderRate: species.gender_rate,
                catchRate: species.capture_rate,
                isFinal: species.is_main_series,
              },
              create: {
                id: pokemon.id,
                name: pokemon.name,
                types: pokemon.types.map((t: any) => t.type.name),
                hp: pokemon.stats[0].base_stat,
                attack: pokemon.stats[1].base_stat,
                defense: pokemon.stats[2].base_stat,
                spAtk: pokemon.stats[3].base_stat,
                spDef: pokemon.stats[4].base_stat,
                speed: pokemon.stats[5].base_stat,
                imageUrl: pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default,
                height: pokemon.height,
                weight: pokemon.weight,
                baseExp: pokemon.base_experience,
                generation: generation,
                description: engFlavorText.replace(/[\n\f]/g, ' '),
                habitat: species.habitat?.name || null,
                genderRate: species.gender_rate,
                catchRate: species.capture_rate,
                isFinal: species.is_main_series,
              },
            })
            console.log(`✓ Seeded ${pokemon.name} (#${id}) - Gen ${generation}`)
          } catch (error) {
            console.error(`✗ Failed to seed Pokémon #${id}`)
          }
        })
      )
    }

    console.log('✅ Seeding of all generations complete!')
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
