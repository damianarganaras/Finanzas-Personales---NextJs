import { PrismaClient } from '@prisma/client'

export class TestDataFactory {
  constructor(private prisma: PrismaClient) {}

  async createUserGroup(title = 'Test User Group') {
    return this.prisma.userGroup.create({
      data: { title }
    })
  }

  async createUser(
    email: string,
    userGroupId: string,
    options: {
      name?: string
      password?: string
      verified?: boolean
    } = {}
  ) {
    return this.prisma.user.create({
      data: {
        email,
        userGroupId,
        name: options.name || null,
        password: options.password || 'hashedpassword123',
        verified: options.verified || false
      }
    })
  }

  async createAccountType(type: string, name?: string) {
    return this.prisma.accountType.create({
      data: {
        type,
        name: name || `${type.charAt(0).toUpperCase() + type.slice(1)} Account`
      }
    })
  }

  async createCurrency(code: string, name?: string, symbol?: string) {
    return this.prisma.currency.create({
      data: {
        code,
        name: name || `${code} Currency`,
        symbol: symbol || code
      }
    })
  }

  async createAccount(
    name: string,
    userId: string,
    userGroupId: string,
    accountTypeId: string,
    currencyId: string,
    options: {
      virtualBalance?: number
      iban?: string
      active?: boolean
    } = {}
  ) {
    return this.prisma.account.create({
      data: {
        name,
        userId,
        userGroupId,
        accountTypeId,
        currencyId,
        virtualBalance: options.virtualBalance || null,
        iban: options.iban || null,
        active: options.active !== undefined ? options.active : true
      }
    })
  }

  async createTransactionJournal(
    userId: string,
    description: string,
    date?: Date
  ) {
    return this.prisma.transactionJournal.create({
      data: {
        userId,
        description,
        date: date || new Date()
      }
    })
  }

  async createTransaction(
    accountId: string,
    transactionJournalId: string,
    amount: number,
    description?: string
  ) {
    return this.prisma.transaction.create({
      data: {
        accountId,
        transactionJournalId,
        amount,
        description: description || null
      }
    })
  }

  async createCategory(name: string, userId: string) {
    return this.prisma.category.create({
      data: {
        name,
        userId
      }
    })
  }

  async createTag(name: string, userId: string) {
    return this.prisma.tag.create({
      data: {
        name,
        userId
      }
    })
  }

  async createBudget(
    name: string,
    userId: string,
    active = true
  ) {
    return this.prisma.budget.create({
      data: {
        name,
        userId,
        active
      }
    })
  }

  async createBudgetLimit(
    budgetId: string,
    amount: number,
    startDate: Date,
    endDate: Date
  ) {
    return this.prisma.budgetLimit.create({
      data: {
        budgetId,
        amount,
        startDate,
        endDate
      }
    })
  }

  async createPiggyBank(
    name: string,
    targetAmount: number,
    userId: string,
    options: {
      currentAmount?: number
      targetDate?: Date
    } = {}
  ) {
    return this.prisma.piggyBank.create({
      data: {
        name,
        targetAmount,
        userId,
        currentAmount: options.currentAmount || 0,
        targetDate: options.targetDate || null
      }
    })
  }

  async createBill(
    name: string,
    userId: string,
    options: {
      amount?: number
      frequency?: string
      nextDueDate?: Date
      active?: boolean
    } = {}
  ) {
    return this.prisma.bill.create({
      data: {
        name,
        userId,
        amount: options.amount || 0,
        frequency: options.frequency || 'monthly',
        nextDueDate: options.nextDueDate || new Date(),
        active: options.active !== undefined ? options.active : true
      }
    })
  }

  // Helper method to create a complete setup for testing
  async createBasicSetup() {
    const userGroup = await this.createUserGroup('Test Family')
    const user = await this.createUser('test@example.com', userGroup.id, {
      name: 'Test User'
    })
    
    const assetType = await this.createAccountType('asset', 'Asset Account')
    const expenseType = await this.createAccountType('expense', 'Expense Account')
    const currency = await this.createCurrency('USD', 'US Dollar', '$')
    
    const assetAccount = await this.createAccount(
      'Checking Account',
      user.id,
      userGroup.id,
      assetType.id,
      currency.id,
      { virtualBalance: 1000.00 }
    )
    
    const expenseAccount = await this.createAccount(
      'Food Expenses',
      user.id,
      userGroup.id,
      expenseType.id,
      currency.id
    )

    const category = await this.createCategory('Groceries', user.id)
    const tag = await this.createTag('weekly-shopping', user.id)

    return {
      userGroup,
      user,
      assetType,
      expenseType,
      currency,
      assetAccount,
      expenseAccount,
      category,
      tag
    }
  }
}
