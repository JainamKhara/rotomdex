import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Keep pool alive across hot-reloads in dev.
// max=5 is safe for Neon's free tier (10 connection limit via pooler).
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,   // release idle connections after 30 s
  connectionTimeoutMillis: 5000, // fail fast if Neon is slow to respond
})

const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    // Only log queries in development — production logging adds overhead
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })

// Persist across Next.js hot-reloads in development
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
