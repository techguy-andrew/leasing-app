import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Connection pooling is automatically enabled by Prisma
  // Default pool size is determined by the formula: num_physical_cpus * 2 + 1
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
