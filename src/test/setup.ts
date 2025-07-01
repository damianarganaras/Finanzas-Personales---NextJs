import '@testing-library/jest-dom'
import { beforeAll, afterAll, afterEach, vi } from 'vitest'
import { PrismaClient } from '@prisma/client'

// Configurar Prisma para tests con MySQL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "mysql://root:Damian123%23@localhost:3306/firefly_test"
    }
  }
})

// Configuración global de tests
beforeAll(async () => {
  console.log('Setting up test database...')
  
  // Verificar conexión a la base de datos
  try {
    await prisma.$connect()
    console.log('✅ Connected to test database')
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error)
    throw error
  }
})

afterEach(async () => {
  // Limpiar la base de datos después de cada test
  // Para MySQL necesitamos desactivar las foreign key checks temporalmente
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`
  
  // Limpiar todas las tablas en orden (usando los nombres de tabla del esquema Prisma)
  const tables = [
    'transaction_categories',
    'transaction_tags', 
    'budget_categories',
    'rule_actions',
    'rule_triggers',
    'transactions',
    'transaction_journals',
    'budget_limits',
    'budgets',
    'accounts',
    'currencies',
    'account_types',
    'tags',
    'categories',
    'piggy_banks',
    'bills',
    'rules',
    'attachments',
    'users',
    'user_groups'
  ]

  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`DELETE FROM ${table};`)
      await prisma.$executeRawUnsafe(`ALTER TABLE ${table} AUTO_INCREMENT = 1;`)
    } catch (error) {
      // Ignorar errores de tablas que no existen
      console.log(`Could not clear table ${table}:`, error)
    }
  }
  
  // Reactivar foreign key checks
  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`
})

afterAll(async () => {
  await prisma.$disconnect()
})

// Exportar prisma para uso en tests
export { prisma }

// Mock para Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock para NextAuth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated'
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}))
