import { PrismaClient } from '@prisma/client'
import { beforeEach, afterEach } from 'vitest'

// Cliente Prisma específico para tests de integración
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

// Helper para limpiar la base de datos entre tests
export async function cleanDatabase() {
  try {
    // Limpiar todas las tablas en orden específico para evitar problemas de foreign keys
    // Empezar con las tablas que no tienen dependencias hacia abajo
    
    // Limpiar relaciones many-to-many primero
    await testPrisma.transactionCategory.deleteMany().catch(() => {}) 
    await testPrisma.transactionTag.deleteMany().catch(() => {})
    await testPrisma.budgetCategory.deleteMany().catch(() => {})
    
    // Limpiar budget limits (depende de budget)
    await testPrisma.budgetLimit.deleteMany().catch(() => {})
    
    // Limpiar transacciones (depende de account y transactionJournal)
    await testPrisma.transaction.deleteMany().catch(() => {})
    
    // Limpiar transaction journals (depende de user)
    await testPrisma.transactionJournal.deleteMany().catch(() => {})
    
    // Limpiar accounts (depende de user, accountType, currency)
    await testPrisma.account.deleteMany().catch(() => {})
    
    // Limpiar entidades que dependen de user
    await testPrisma.budget.deleteMany().catch(() => {})
    await testPrisma.category.deleteMany().catch(() => {})
    await testPrisma.tag.deleteMany().catch(() => {})
    await testPrisma.piggyBank.deleteMany().catch(() => {})
    await testPrisma.bill.deleteMany().catch(() => {})
    
    // Limpiar users (depende de userGroup)
    await testPrisma.user.deleteMany().catch(() => {})
    
    // Limpiar tipos y monedas
    await testPrisma.accountType.deleteMany().catch(() => {})
    await testPrisma.currency.deleteMany().catch(() => {})
    
    // Finalmente limpiar user groups
    await testPrisma.userGroup.deleteMany().catch(() => {})
  } catch (error) {
    // En caso de error, intentar limpiar con un enfoque más agresivo
    console.warn('Error during cleanup, attempting raw delete')
    try {
      await testPrisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`
      await testPrisma.transactionCategory.deleteMany()
      await testPrisma.transactionTag.deleteMany()
      await testPrisma.budgetCategory.deleteMany()
      await testPrisma.budgetLimit.deleteMany()
      await testPrisma.transaction.deleteMany()
      await testPrisma.transactionJournal.deleteMany()
      await testPrisma.account.deleteMany()
      await testPrisma.budget.deleteMany()
      await testPrisma.category.deleteMany()
      await testPrisma.tag.deleteMany()
      await testPrisma.piggyBank.deleteMany()
      await testPrisma.bill.deleteMany()
      await testPrisma.user.deleteMany()
      await testPrisma.accountType.deleteMany()
      await testPrisma.currency.deleteMany()
      await testPrisma.userGroup.deleteMany()
      await testPrisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`
    } catch (fallbackError) {
      console.error('Fallback cleanup also failed:', fallbackError)
    }
  }
}

// Configuración común para tests de integración
export function setupDatabaseTests() {
  beforeEach(async () => {
    await cleanDatabase()
  })

  afterEach(async () => {
    await cleanDatabase()
  })
}
