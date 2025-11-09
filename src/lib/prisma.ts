import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Using Neon's connection pooling via DATABASE_URL (pooled connection)
  // Migrations use DATABASE_URL_UNPOOLED (direct connection) configured in schema.prisma
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
