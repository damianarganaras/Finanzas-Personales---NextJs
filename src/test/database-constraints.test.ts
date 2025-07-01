import { describe, test, expect, beforeEach } from 'vitest'
import { prisma } from '../test/setup'
import { PrismaClient } from '@prisma/client'

describe('Database Constraints and Data Types', () => {
  let testPrisma: PrismaClient

  beforeEach(() => {
    testPrisma = prisma
  })

  describe('Decimal Field Validation', () => {
    test('should handle decimal precision correctly for account virtual balance', async () => {
      const userGroup = await testPrisma.userGroup.create({
        data: { title: 'Test Group' }
      })

      const user = await testPrisma.user.create({
        data: {
          email: 'decimal@example.com',
          password: 'password',
          userGroupId: userGroup.id
        }
      })

      const accountType = await testPrisma.accountType.create({
        data: { type: 'asset', name: 'Test Account Type' }
      })

      const currency = await testPrisma.currency.create({
        data: { code: 'USD', name: 'US Dollar', symbol: '$' }
      })

      const account = await testPrisma.account.create({
        data: {
          name: 'Precision Test Account',
          accountTypeId: accountType.id,
          userId: user.id,
          userGroupId: userGroup.id,
          currencyId: currency.id,
          virtualBalance: 1234567890123.99 // Testing max precision
        }
      })

      expect(account.virtualBalance?.toFixed(2)).toBe('1234567890123.99')
    })

    test('should handle decimal precision for transaction amounts', async () => {
      const userGroup = await testPrisma.userGroup.create({
        data: { title: 'Test Group' }
      })

      const user = await testPrisma.user.create({
        data: {
          email: 'amount@example.com',
          password: 'password',
          userGroupId: userGroup.id
        }
      })

      const accountType = await testPrisma.accountType.create({
        data: { type: 'asset', name: 'Test Account Type' }
      })

      const currency = await testPrisma.currency.create({
        data: { code: 'USD', name: 'US Dollar', symbol: '$' }
      })

      const account = await testPrisma.account.create({
        data: {
          name: 'Amount Test Account',
          accountTypeId: accountType.id,
          userId: user.id,
          userGroupId: userGroup.id,
          currencyId: currency.id
        }
      })

      const journal = await testPrisma.transactionJournal.create({
        data: {
          userId: user.id,
          description: 'Amount test',
          date: new Date()
        }
      })

      const transaction = await testPrisma.transaction.create({
        data: {
          accountId: account.id,
          transactionJournalId: journal.id,
          amount: 9999999999999.99, // Testing max precision for DECIMAL(15,2)
          description: 'Max amount test'
        }
      })

      expect(transaction.amount.toFixed(2)).toBe('9999999999999.99')
    })
  })

  describe('String Field Constraints', () => {
    test('should enforce currency code uniqueness', async () => {
      await testPrisma.currency.create({
        data: {
          code: 'EUR',
          name: 'Euro',
          symbol: '€'
        }
      })

      await expect(
        testPrisma.currency.create({
          data: {
            code: 'EUR', // Duplicate code
            name: 'European Euro',
            symbol: '€'
          }
        })
      ).rejects.toThrow()
    })

    test('should handle long text fields correctly', async () => {
      const userGroup = await testPrisma.userGroup.create({
        data: { title: 'Test Group' }
      })

      const user = await testPrisma.user.create({
        data: {
          email: 'longtext@example.com',
          password: 'password',
          userGroupId: userGroup.id
        }
      })

      const longDescription = 'A'.repeat(191) // Test with MySQL VARCHAR(191) default length

      const journal = await testPrisma.transactionJournal.create({
        data: {
          userId: user.id,
          description: longDescription,
          date: new Date()
        }
      })

      expect(journal.description).toBe(longDescription)
      expect(journal.description.length).toBe(191)
    })
  })

  describe('Boolean and Default Values', () => {
    test('should apply default values correctly', async () => {
      const userGroup = await testPrisma.userGroup.create({
        data: { title: 'Default Test Group' }
      })

      // User with default verified = false
      const user = await testPrisma.user.create({
        data: {
          email: 'defaults@example.com',
          password: 'password',
          userGroupId: userGroup.id
        }
      })

      expect(user.verified).toBe(false)

      // Account with default active = true
      const accountType = await testPrisma.accountType.create({
        data: { type: 'asset', name: 'Default Test' }
      })

      const currency = await testPrisma.currency.create({
        data: { code: 'GBP', name: 'British Pound', symbol: '£' }
      })

      const account = await testPrisma.account.create({
        data: {
          name: 'Default Test Account',
          accountTypeId: accountType.id,
          userId: user.id,
          userGroupId: userGroup.id,
          currencyId: currency.id
        }
      })

      expect(account.active).toBe(true)

      // Budget with default active = true
      const budget = await testPrisma.budget.create({
        data: {
          name: 'Default Budget',
          userId: user.id
        }
      })

      expect(budget.active).toBe(true)
    })
  })

  describe('DateTime Fields', () => {
    test('should handle date fields correctly', async () => {
      const userGroup = await testPrisma.userGroup.create({
        data: { title: 'Date Test Group' }
      })

      const user = await testPrisma.user.create({
        data: {
          email: 'dates@example.com',
          password: 'password',
          userGroupId: userGroup.id
        }
      })

      const specificDate = new Date('2024-01-15T10:30:00.000Z')

      const journal = await testPrisma.transactionJournal.create({
        data: {
          userId: user.id,
          description: 'Date test transaction',
          date: specificDate
        }
      })

      expect(journal.date).toEqual(specificDate)
      expect(journal.createdAt).toBeInstanceOf(Date)
      expect(journal.updatedAt).toBeInstanceOf(Date)
    })

    test('should handle piggy bank target dates', async () => {
      const userGroup = await testPrisma.userGroup.create({
        data: { title: 'Target Date Group' }
      })

      const user = await testPrisma.user.create({
        data: {
          email: 'targetdate@example.com',
          password: 'password',
          userGroupId: userGroup.id
        }
      })

      const accountType = await testPrisma.accountType.create({
        data: { type: 'asset', name: 'Savings Type' }
      })

      const currency = await testPrisma.currency.create({
        data: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' }
      })

      const account = await testPrisma.account.create({
        data: {
          name: 'Target Date Account',
          accountTypeId: accountType.id,
          userId: user.id,
          userGroupId: userGroup.id,
          currencyId: currency.id
        }
      })

      const targetDate = new Date('2025-12-31')

      const piggyBank = await testPrisma.piggyBank.create({
        data: {
          name: 'Future Goal',
          targetAmount: 10000.00,
          currentAmount: 2500.00,
          targetDate: targetDate,
          userId: user.id
        }
      })

      expect(piggyBank.targetDate).toEqual(targetDate)
    })
  })

  describe('Optional vs Required Fields', () => {
    test('should handle optional fields correctly', async () => {
      const userGroup = await testPrisma.userGroup.create({
        data: { title: 'Optional Fields Group' }
      })

      // User with optional name field not provided
      const user = await testPrisma.user.create({
        data: {
          email: 'optional@example.com',
          password: 'password',
          userGroupId: userGroup.id
        }
      })

      expect(user.name).toBeNull()

      // Account with optional fields not provided
      const accountType = await testPrisma.accountType.create({
        data: { type: 'asset', name: 'Optional Test' }
      })

      const currency = await testPrisma.currency.create({
        data: { code: 'JPY', name: 'Japanese Yen', symbol: '¥' }
      })

      const account = await testPrisma.account.create({
        data: {
          name: 'Optional Fields Account',
          accountTypeId: accountType.id,
          userId: user.id,
          userGroupId: userGroup.id,
          currencyId: currency.id
          // virtualBalance and iban not provided (optional)
        }
      })

      expect(account.virtualBalance).toBeNull()
      expect(account.iban).toBeNull()
    })

    test('should require mandatory fields', async () => {
      // Attempting to create user without required fields should fail
      await expect(
        testPrisma.user.create({
          data: {
            // Missing email, password, and userGroupId
            name: 'Test User'
          } as any
        })
      ).rejects.toThrow()
    })
  })

  describe('Many-to-Many Relationships', () => {
    test('should handle transaction-category relationships', async () => {
      const userGroup = await testPrisma.userGroup.create({
        data: { title: 'M2M Test Group' }
      })

      const user = await testPrisma.user.create({
        data: {
          email: 'm2m@example.com',
          password: 'password',
          userGroupId: userGroup.id
        }
      })

      const category = await testPrisma.category.create({
        data: {
          name: 'Food',
          userId: user.id
        }
      })

      const accountType = await testPrisma.accountType.create({
        data: { type: 'expense', name: 'Expense Account' }
      })

      const currency = await testPrisma.currency.create({
        data: { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' }
      })

      const account = await testPrisma.account.create({
        data: {
          name: 'M2M Test Account',
          accountTypeId: accountType.id,
          userId: user.id,
          userGroupId: userGroup.id,
          currencyId: currency.id
        }
      })

      const journal = await testPrisma.transactionJournal.create({
        data: {
          userId: user.id,
          description: 'M2M test transaction',
          date: new Date()
        }
      })

      const transaction = await testPrisma.transaction.create({
        data: {
          accountId: account.id,
          transactionJournalId: journal.id,
          amount: 50.00,
          description: 'Food purchase'
        }
      })

      // Create many-to-many relationship
      const transactionCategory = await testPrisma.transactionCategory.create({
        data: {
          transactionId: transaction.id,
          categoryId: category.id
        }
      })

      expect(transactionCategory).toBeDefined()
      expect(transactionCategory.transactionId).toBe(transaction.id)
      expect(transactionCategory.categoryId).toBe(category.id)

      // Verify the relationship can be queried
      const transactionWithCategories = await testPrisma.transaction.findUnique({
        where: { id: transaction.id },
        include: {
          categories: {
            include: {
              category: true
            }
          }
        }
      })

      expect(transactionWithCategories?.categories).toHaveLength(1)
      expect(transactionWithCategories?.categories[0].category.name).toBe('Food')
    })
  })
})
