import { describe, test, expect, beforeEach } from 'vitest'
import { testPrisma, setupDatabaseTests } from './integration-setup'

describe('Database Schema Validation', () => {
  setupDatabaseTests()

  describe('User and UserGroup Models', () => {
    test('should create user group successfully', async () => {
      const userGroup = await testPrisma.userGroup.create({
        data: {
          title: 'Test Family Group'
        }
      })

      expect(userGroup).toBeDefined()
      expect(userGroup.id).toBeDefined()
      expect(userGroup.title).toBe('Test Family Group')
    })

    test('should create user with required fields', async () => {
      const userGroup = await testPrisma.userGroup.create({
        data: { title: 'Test Group' }
      })

      const user = await testPrisma.user.create({
        data: {
          email: 'test@example.com',
          password: 'hashedpassword',
          userGroupId: userGroup.id
        }
      })

      expect(user).toBeDefined()
      expect(user.id).toBeDefined()
      expect(user.email).toBe('test@example.com')
      expect(user.verified).toBe(false) // default value
      expect(user.userGroupId).toBe(userGroup.id)
      expect(user.createdAt).toBeInstanceOf(Date)
      expect(user.updatedAt).toBeInstanceOf(Date)
    })

    test('should enforce unique email constraint', async () => {
      const userGroup = await testPrisma.userGroup.create({
        data: { title: 'Test Group' }
      })

      await testPrisma.user.create({
        data: {
          email: 'duplicate@example.com',
          password: 'password1',
          userGroupId: userGroup.id
        }
      })

      await expect(
        testPrisma.user.create({
          data: {
            email: 'duplicate@example.com',
            password: 'password2',
            userGroupId: userGroup.id
          }
        })
      ).rejects.toThrow()
    })
  })

  describe('AccountType and Account Models', () => {
    test('should create account type successfully', async () => {
      const accountType = await testPrisma.accountType.create({
        data: {
          type: 'asset',
          name: 'Asset Account'
        }
      })

      expect(accountType).toBeDefined()
      expect(accountType.type).toBe('asset')
      expect(accountType.name).toBe('Asset Account')
    })

    test('should create currency successfully', async () => {
      const currency = await testPrisma.currency.create({
        data: {
          code: 'USD',
          name: 'US Dollar',
          symbol: '$'
        }
      })

      expect(currency).toBeDefined()
      expect(currency.code).toBe('USD')
      expect(currency.name).toBe('US Dollar')
      expect(currency.symbol).toBe('$')
    })

    test('should create account with all relationships', async () => {
      const userGroup = await testPrisma.userGroup.create({
        data: { title: 'Test Group' }
      })

      const user = await testPrisma.user.create({
        data: {
          email: 'account@example.com',
          password: 'password',
          userGroupId: userGroup.id
        }
      })

      const accountType = await testPrisma.accountType.create({
        data: { type: 'asset', name: 'Checking Account' }
      })

      const currency = await testPrisma.currency.create({
        data: { code: 'USD', name: 'US Dollar', symbol: '$' }
      })

      const account = await testPrisma.account.create({
        data: {
          name: 'My Checking Account',
          accountTypeId: accountType.id,
          userId: user.id,
          userGroupId: userGroup.id,
          currencyId: currency.id,
          virtualBalance: 1000.50,
          iban: 'US123456789012345678'
        }
      })

      expect(account).toBeDefined()
      expect(account.name).toBe('My Checking Account')
      expect(account.virtualBalance?.toFixed(2)).toBe('1000.50')
      expect(account.iban).toBe('US123456789012345678')
      expect(account.active).toBe(true) // default value
    })
  })

  describe('Transaction Models', () => {
    test('should create transaction journal and transactions', async () => {
      // Setup prerequisitos
      const userGroup = await testPrisma.userGroup.create({
        data: { title: 'Test Group' }
      })

      const user = await testPrisma.user.create({
        data: {
          email: 'transaction@example.com',
          password: 'password',
          userGroupId: userGroup.id
        }
      })

      const accountType = await testPrisma.accountType.create({
        data: { type: 'asset', name: 'Asset' }
      })

      const currency = await testPrisma.currency.create({
        data: { code: 'USD', name: 'US Dollar', symbol: '$' }
      })

      const account = await testPrisma.account.create({
        data: {
          name: 'Test Account',
          accountTypeId: accountType.id,
          userId: user.id,
          userGroupId: userGroup.id,
          currencyId: currency.id
        }
      })

      // Crear transaction journal
      const journal = await testPrisma.transactionJournal.create({
        data: {
          userId: user.id,
          description: 'Test transaction',
          date: new Date()
        }
      })

      expect(journal).toBeDefined()
      expect(journal.description).toBe('Test transaction')

      // Crear transaction
      const transaction = await testPrisma.transaction.create({
        data: {
          accountId: account.id,
          transactionJournalId: journal.id,
          amount: 250.75,
          description: 'Test payment'
        }
      })

      expect(transaction).toBeDefined()
      expect(transaction.amount.toFixed(2)).toBe('250.75')
      expect(transaction.description).toBe('Test payment')
    })
  })

  describe('Category and Tag Models', () => {
    test('should create category and tag models', async () => {
      const userGroup = await testPrisma.userGroup.create({
        data: { title: 'Test Group' }
      })

      const user = await testPrisma.user.create({
        data: {
          email: 'category@example.com',
          password: 'password',
          userGroupId: userGroup.id
        }
      })

      // Crear categoría
      const category = await testPrisma.category.create({
        data: {
          name: 'Food & Dining',
          userId: user.id
        }
      })

      expect(category).toBeDefined()
      expect(category.name).toBe('Food & Dining')

      // Crear tag
      const tag = await testPrisma.tag.create({
        data: {
          name: 'grocery',
          userId: user.id
        }
      })

      expect(tag).toBeDefined()
      expect(tag.name).toBe('grocery')
    })
  })

  describe('Budget Models', () => {
    test('should create budget with budget limits', async () => {
      const userGroup = await testPrisma.userGroup.create({
        data: { title: 'Test Group' }
      })

      const user = await testPrisma.user.create({
        data: {
          email: 'budget@example.com',
          password: 'password',
          userGroupId: userGroup.id
        }
      })

      const category = await testPrisma.category.create({
        data: {
          name: 'Entertainment',
          userId: user.id
        }
      })

      // Crear budget
      const budget = await testPrisma.budget.create({
        data: {
          name: 'Monthly Entertainment Budget',
          userId: user.id
        }
      })

      expect(budget).toBeDefined()
      expect(budget.name).toBe('Monthly Entertainment Budget')
      expect(budget.active).toBe(true) // default value

      // Crear budget limit
      const budgetLimit = await testPrisma.budgetLimit.create({
        data: {
          budgetId: budget.id,
          amount: 500.00,
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        }
      })

      expect(budgetLimit).toBeDefined()
      expect(budgetLimit.amount.toFixed(2)).toBe('500.00')

      // Crear relación budget-category
      const budgetCategory = await testPrisma.budgetCategory.create({
        data: {
          budgetId: budget.id,
          categoryId: category.id
        }
      })

      expect(budgetCategory).toBeDefined()
    })
  })

  describe('PiggyBank Model', () => {
    test('should create piggy bank successfully', async () => {
      const userGroup = await testPrisma.userGroup.create({
        data: { title: 'Test Group' }
      })

      const user = await testPrisma.user.create({
        data: {
          email: 'piggy@example.com',
          password: 'password',
          userGroupId: userGroup.id
        }
      })

      const piggyBank = await testPrisma.piggyBank.create({
        data: {
          name: 'Vacation Fund',
          targetAmount: 5000.00,
          currentAmount: 1250.00,
          targetDate: new Date('2024-12-31'),
          userId: user.id
        }
      })

      expect(piggyBank).toBeDefined()
      expect(piggyBank.name).toBe('Vacation Fund')
      expect(piggyBank.targetAmount.toFixed(2)).toBe('5000.00')
      expect(piggyBank.currentAmount.toFixed(2)).toBe('1250.00')
    })
  })

  describe('Relational Integrity', () => {
    test('should maintain referential integrity on delete', async () => {
      const userGroup = await testPrisma.userGroup.create({
        data: { title: 'Test Group' }
      })

      const user = await testPrisma.user.create({
        data: {
          email: 'integrity@example.com',
          password: 'password',
          userGroupId: userGroup.id
        }
      })

      // Intentar eliminar userGroup con usuarios debería fallar
      await expect(
        testPrisma.userGroup.delete({
          where: { id: userGroup.id }
        })
      ).rejects.toThrow()
    })

    test('should handle cascading relationships correctly', async () => {
      const userGroup = await testPrisma.userGroup.create({
        data: { title: 'Test Group' }
      })

      const user = await testPrisma.user.create({
        data: {
          email: 'cascade@example.com',
          password: 'password',
          userGroupId: userGroup.id
        }
      })

      const category = await testPrisma.category.create({
        data: {
          name: 'Test Category',
          userId: user.id
        }
      })

      // Verificar que la categoría está vinculada al usuario
      const foundCategory = await testPrisma.category.findUnique({
        where: { id: category.id },
        include: { user: true }
      })

      expect(foundCategory?.user.email).toBe('cascade@example.com')
    })
  })
})
