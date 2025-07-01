import { describe, test, expect, beforeEach } from 'vitest'
import { prisma } from '../test/setup'
import { TestDataFactory } from '../test/test-data-factory'

describe('Database Integration Tests with Factory', () => {
  let factory: TestDataFactory

  beforeEach(() => {
    factory = new TestDataFactory(prisma)
  })

  test('should create complete financial setup using factory', async () => {
    const setup = await factory.createBasicSetup()

    expect(setup.user.email).toBe('test@example.com')
    expect(setup.userGroup.title).toBe('Test Family')
    expect(setup.assetAccount.name).toBe('Checking Account')
    expect(setup.expenseAccount.name).toBe('Food Expenses')
    expect(setup.currency.code).toBe('USD')
    expect(setup.category.name).toBe('Groceries')
    expect(setup.tag.name).toBe('weekly-shopping')
  })

  test('should create and link transactions with categories and tags', async () => {
    const setup = await factory.createBasicSetup()

    // Create a transaction journal
    const journal = await factory.createTransactionJournal(
      setup.user.id,
      'Grocery shopping trip'
    )

    // Create transactions
    const expenseTransaction = await factory.createTransaction(
      setup.expenseAccount.id,
      journal.id,
      -75.50,
      'Supermarket purchase'
    )

    const assetTransaction = await factory.createTransaction(
      setup.assetAccount.id,
      journal.id,
      75.50,
      'Payment from checking account'
    )

    // Link transaction to category
    const transactionCategory = await prisma.transactionCategory.create({
      data: {
        transactionId: expenseTransaction.id,
        categoryId: setup.category.id
      }
    })

    // Link transaction to tag
    const transactionTag = await prisma.transactionTag.create({
      data: {
        transactionId: expenseTransaction.id,
        tagId: setup.tag.id
      }
    })

    // Verify the complete transaction with relationships
    const completeTransaction = await prisma.transaction.findUnique({
      where: { id: expenseTransaction.id },
      include: {
        account: true,
        transactionJournal: true,
        categories: {
          include: { category: true }
        },
        tags: {
          include: { tag: true }
        }
      }
    })

    expect(completeTransaction).toBeDefined()
    expect(completeTransaction?.account.name).toBe('Food Expenses')
    expect(completeTransaction?.transactionJournal.description).toBe('Grocery shopping trip')
    expect(completeTransaction?.categories).toHaveLength(1)
    expect(completeTransaction?.categories[0].category.name).toBe('Groceries')
    expect(completeTransaction?.tags).toHaveLength(1)
    expect(completeTransaction?.tags[0].tag.name).toBe('weekly-shopping')
  })

  test('should create budget with categories and limits', async () => {
    const setup = await factory.createBasicSetup()

    // Create additional categories
    const entertainmentCategory = await factory.createCategory('Entertainment', setup.user.id)
    const transportCategory = await factory.createCategory('Transport', setup.user.id)

    // Create budget
    const budget = await factory.createBudget('Monthly Budget 2024', setup.user.id)

    // Create budget limits
    const entertainmentLimit = await factory.createBudgetLimit(
      budget.id,
      200.00,
      new Date('2024-01-01'),
      new Date('2024-01-31')
    )

    const transportLimit = await factory.createBudgetLimit(
      budget.id,
      300.00,
      new Date('2024-01-01'),
      new Date('2024-01-31')
    )

    // Link budget to categories
    await prisma.budgetCategory.create({
      data: {
        budgetId: budget.id,
        categoryId: entertainmentCategory.id
      }
    })

    await prisma.budgetCategory.create({
      data: {
        budgetId: budget.id,
        categoryId: transportCategory.id
      }
    })

    // Verify budget with all relationships
    const completeBudget = await prisma.budget.findUnique({
      where: { id: budget.id },
      include: {
        limits: true,
        categories: {
          include: { category: true }
        }
      }
    })

    expect(completeBudget).toBeDefined()
    expect(completeBudget?.name).toBe('Monthly Budget 2024')
    expect(completeBudget?.limits).toHaveLength(2)
    expect(completeBudget?.categories).toHaveLength(2)
    
    const categoryNames = completeBudget?.categories.map(bc => bc.category.name).sort()
    expect(categoryNames).toEqual(['Entertainment', 'Transport'])
  })

  test('should create piggy bank and bill for savings goals and recurring payments', async () => {
    const setup = await factory.createBasicSetup()

    // Create piggy bank
    const piggyBank = await factory.createPiggyBank(
      'Emergency Fund',
      10000.00,
      setup.user.id,
      {
        currentAmount: 2500.00,
        targetDate: new Date('2024-12-31')
      }
    )

    // Create recurring bill
    const bill = await factory.createBill(
      'Monthly Rent',
      setup.user.id,
      {
        amount: 1200.00,
        frequency: 'monthly',
        nextDueDate: new Date('2024-02-01')
      }
    )

    expect(piggyBank.name).toBe('Emergency Fund')
    expect(piggyBank.targetAmount.toFixed(2)).toBe('10000.00')
    expect(piggyBank.currentAmount.toFixed(2)).toBe('2500.00')

    expect(bill.name).toBe('Monthly Rent')
    expect(bill.amount.toFixed(2)).toBe('1200.00')
    expect(bill.frequency).toBe('monthly')
  })

  test('should validate account balance calculations', async () => {
    const setup = await factory.createBasicSetup()

    // Create multiple transactions affecting the account balance
    const journal1 = await factory.createTransactionJournal(
      setup.user.id,
      'Initial deposit'
    )

    const journal2 = await factory.createTransactionJournal(
      setup.user.id,
      'Grocery shopping'
    )

    const journal3 = await factory.createTransactionJournal(
      setup.user.id,
      'Salary deposit'
    )

    // Transactions for asset account (checking account)
    await factory.createTransaction(setup.assetAccount.id, journal1.id, 500.00, 'Initial deposit')
    await factory.createTransaction(setup.assetAccount.id, journal2.id, -75.50, 'Grocery payment')
    await factory.createTransaction(setup.assetAccount.id, journal3.id, 2000.00, 'Monthly salary')

    // Query all transactions for the account
    const accountTransactions = await prisma.transaction.findMany({
      where: { accountId: setup.assetAccount.id },
      include: { transactionJournal: true }
    })

    expect(accountTransactions).toHaveLength(3)

    // Calculate total balance (should be initial virtual balance + transaction amounts)
    const transactionTotal = accountTransactions.reduce(
      (sum, transaction) => sum + Number(transaction.amount),
      0
    )

    const expectedBalance = Number(setup.assetAccount.virtualBalance) + transactionTotal
    expect(expectedBalance).toBe(1000.00 + 500.00 - 75.50 + 2000.00) // 3424.50
  })

  test('should handle complex queries across multiple entities', async () => {
    const setup = await factory.createBasicSetup()

    // Create additional test data
    const foodCategory = await factory.createCategory('Food', setup.user.id)
    const urgentTag = await factory.createTag('urgent', setup.user.id)

    const journal = await factory.createTransactionJournal(
      setup.user.id,
      'Emergency grocery run'
    )

    const transaction = await factory.createTransaction(
      setup.expenseAccount.id,
      journal.id,
      -125.75,
      'Emergency food purchase'
    )

    // Link to category and tag
    await prisma.transactionCategory.create({
      data: { transactionId: transaction.id, categoryId: foodCategory.id }
    })

    await prisma.transactionTag.create({
      data: { transactionId: transaction.id, tagId: urgentTag.id }
    })

    // Complex query: Find all transactions for a user that are tagged as urgent and in food category
    const urgentFoodTransactions = await prisma.transaction.findMany({
      where: {
        account: { userId: setup.user.id },
        tags: {
          some: {
            tag: { name: 'urgent' }
          }
        },
        categories: {
          some: {
            category: { name: 'Food' }
          }
        }
      },
      include: {
        account: true,
        transactionJournal: true,
        categories: { include: { category: true } },
        tags: { include: { tag: true } }
      }
    })

    expect(urgentFoodTransactions).toHaveLength(1)
    expect(urgentFoodTransactions[0].description).toBe('Emergency food purchase')
    expect(urgentFoodTransactions[0].amount.toFixed(2)).toBe('-125.75')
  })
})
