import '@testing-library/jest-dom'
import { vi } from 'vitest'
import { PrismaClient } from '@prisma/client'

// Mock global de fetch
global.fetch = vi.fn()

// Prisma client para tests de integración (solo si no es un test unitario)
export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

// Mock de Next.js router
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
  redirect: vi.fn(),
  notFound: vi.fn(),
}))

// Mock de NextAuth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated'
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
}))

// Mock de la función auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn()
}))

// Mock de Prisma Client para tests unitarios
const createMockMethods = () => ({
  findUnique: vi.fn(),
  findMany: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  upsert: vi.fn(),
  count: vi.fn(),
  deleteMany: vi.fn(),
  createMany: vi.fn(),
  updateMany: vi.fn(),
})

// Mock condicional - solo para tests unitarios que requieren mock
vi.mock('@/lib/db', async () => {
  const actual = await vi.importActual('@/lib/db')
  
  // Si es un test de integración, usa el cliente real
  if (process.env.VITEST_INTEGRATION_TEST) {
    return actual
  }
  
  // Para tests unitarios, usa el mock
  return {
    db: {
      user: createMockMethods(),
      account: createMockMethods(),
      accountType: createMockMethods(),
      currency: createMockMethods(),
      transaction: createMockMethods(),
      transactionJournal: createMockMethods(),
      category: createMockMethods(),
      tag: createMockMethods(),
      budget: createMockMethods(),
      budgetLimit: createMockMethods(),
      piggyBank: createMockMethods(),
      bill: createMockMethods(),
      userGroup: createMockMethods(),
      creditCard: createMockMethods(),
      creditCardPurchase: createMockMethods(),
      installmentPayment: createMockMethods(),
      $connect: vi.fn(),
      $disconnect: vi.fn(),
      $transaction: vi.fn(),
    }
  }
})

// Configuración global para tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock de Web APIs
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
})

// Mock de localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
})

// Mock de sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
})
