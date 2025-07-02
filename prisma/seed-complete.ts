import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seeding completo de la base de datos...')

  // Hash de la contraseña
  const hashedPassword = await bcrypt.hash('admin123', 12)

  // Crear grupo de usuarios
  const userGroup = await prisma.userGroup.upsert({
    where: { id: 'admin-group' },
    update: {},
    create: {
      id: 'admin-group',
      title: 'Administradores'
    }
  })

  console.log('✅ Grupo de usuarios creado:', userGroup.title)

  // Crear tipos de cuenta (si ya existen, los saltará)
  const accountTypes = [
    { id: 'asset-type', type: 'ASSET', name: 'Asset accounts' },
    { id: 'expense-type', type: 'EXPENSE', name: 'Expense accounts' },
    { id: 'revenue-type', type: 'REVENUE', name: 'Revenue accounts' },
    { id: 'liability-type', type: 'LIABILITY', name: 'Liability accounts' }
  ]

  for (const accountType of accountTypes) {
    try {
      await prisma.accountType.create({
        data: accountType
      })
      console.log(`✅ Tipo de cuenta ${accountType.type} creado`)
    } catch (e) {
      console.log(`ℹ️ Tipo de cuenta ${accountType.type} ya existe`)
    }
  }

  // Crear usuario administrador
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@firefly.local' },
    update: {},
    create: {
      email: 'admin@firefly.local',
      name: 'Administrador',
      password: hashedPassword,
      verified: true,
      userGroupId: userGroup.id
    }
  })

  console.log('✅ Usuario administrador creado:', adminUser.email)

  // Crear cuentas de ejemplo
  const accounts = [
    {
      id: 'cuenta-corriente-1',
      name: 'Cuenta Corriente Principal',
      type: 'ASSET',
      accountRole: 'DEFAULT_ASSET',
      currencyCode: 'EUR',
      currencySymbol: '€',
      currencyDecimalPlaces: 2,
      currentBalance: 2500.00,
      virtualBalance: 0,
      active: true,
      includeNetWorth: true,
      accountTypeId: 'asset-type'
    },
    {
      id: 'cuenta-ahorros-1',
      name: 'Cuenta de Ahorros',
      type: 'ASSET',
      accountRole: 'SAVING_ASSET',
      currencyCode: 'EUR',
      currencySymbol: '€',
      currencyDecimalPlaces: 2,
      currentBalance: 5000.00,
      virtualBalance: 0,
      active: true,
      includeNetWorth: true,
      accountTypeId: 'asset-type'
    },
    {
      id: 'tarjeta-credito-1',
      name: 'Tarjeta de Crédito',
      type: 'LIABILITY',
      accountRole: 'CREDIT_CARD',
      currencyCode: 'EUR',
      currencySymbol: '€',
      currencyDecimalPlaces: 2,
      currentBalance: -350.00,
      virtualBalance: 0,
      active: true,
      includeNetWorth: true,
      accountTypeId: 'liability-type'
    },
    {
      id: 'gastos-alimentacion',
      name: 'Gastos - Alimentación',
      type: 'EXPENSE',
      accountRole: 'DEFAULT_EXPENSE',
      currencyCode: 'EUR',
      currencySymbol: '€',
      currencyDecimalPlaces: 2,
      currentBalance: 0,
      virtualBalance: 0,
      active: true,
      includeNetWorth: false,
      accountTypeId: 'expense-type'
    },
    {
      id: 'gastos-transporte',
      name: 'Gastos - Transporte',
      type: 'EXPENSE',
      accountRole: 'DEFAULT_EXPENSE',
      currencyCode: 'EUR',
      currencySymbol: '€',
      currencyDecimalPlaces: 2,
      currentBalance: 0,
      virtualBalance: 0,
      active: true,
      includeNetWorth: false,
      accountTypeId: 'expense-type'
    },
    {
      id: 'gastos-entretenimiento',
      name: 'Gastos - Entretenimiento',
      type: 'EXPENSE',
      accountRole: 'DEFAULT_EXPENSE',
      currencyCode: 'EUR',
      currencySymbol: '€',
      currencyDecimalPlaces: 2,
      currentBalance: 0,
      virtualBalance: 0,
      active: true,
      includeNetWorth: false,
      accountTypeId: 'expense-type'
    },
    {
      id: 'ingresos-salario',
      name: 'Ingresos - Salario',
      type: 'REVENUE',
      accountRole: 'DEFAULT_REVENUE',
      currencyCode: 'EUR',
      currencySymbol: '€',
      currencyDecimalPlaces: 2,
      currentBalance: 0,
      virtualBalance: 0,
      active: true,
      includeNetWorth: false,
      accountTypeId: 'revenue-type'
    }
  ]

  for (const account of accounts) {
    try {
      await prisma.account.create({
        data: {
          ...account,
          userId: adminUser.id,
          userGroupId: userGroup.id
        }
      })
      console.log(`✅ Cuenta ${account.name} creada`)
    } catch (e) {
      console.log(`ℹ️ Cuenta ${account.name} ya existe`)
    }
  }

  // Crear transacciones de ejemplo
  const transactions = [
    {
      type: 'DEPOSIT',
      description: 'Salario mensual',
      amount: 2500.00,
      date: new Date('2024-06-01'),
      sourceAccountId: 'ingresos-salario',
      destinationAccountId: 'cuenta-corriente-1',
      currencyCode: 'EUR',
      foreignAmount: 2500.00,
      foreignCurrencyCode: 'EUR'
    },
    {
      type: 'WITHDRAWAL',
      description: 'Compra supermercado',
      amount: 85.50,
      date: new Date('2024-06-15'),
      sourceAccountId: 'cuenta-corriente-1',
      destinationAccountId: 'gastos-alimentacion',
      currencyCode: 'EUR',
      foreignAmount: 85.50,
      foreignCurrencyCode: 'EUR'
    },
    {
      type: 'WITHDRAWAL',
      description: 'Gasolina',
      amount: 45.00,
      date: new Date('2024-06-14'),
      sourceAccountId: 'cuenta-corriente-1',
      destinationAccountId: 'gastos-transporte',
      currencyCode: 'EUR',
      foreignAmount: 45.00,
      foreignCurrencyCode: 'EUR'
    },
    {
      type: 'WITHDRAWAL',
      description: 'Cena restaurante',
      amount: 65.00,
      date: new Date('2024-06-13'),
      sourceAccountId: 'cuenta-corriente-1',
      destinationAccountId: 'gastos-entretenimiento',
      currencyCode: 'EUR',
      foreignAmount: 65.00,
      foreignCurrencyCode: 'EUR'
    },
    {
      type: 'TRANSFER',
      description: 'Transferencia a ahorros',
      amount: 500.00,
      date: new Date('2024-06-10'),
      sourceAccountId: 'cuenta-corriente-1',
      destinationAccountId: 'cuenta-ahorros-1',
      currencyCode: 'EUR',
      foreignAmount: 500.00,
      foreignCurrencyCode: 'EUR'
    }
  ]

  for (const transactionData of transactions) {
    try {
      // Create TransactionJournal first
      const journal = await prisma.transactionJournal.create({
        data: {
          userId: adminUser.id,
          description: transactionData.description,
          date: transactionData.date,
        }
      });

      // Create individual transactions for source and destination accounts
      if (transactionData.sourceAccountId) {
        await prisma.transaction.create({
          data: {
            accountId: transactionData.sourceAccountId,
            transactionJournalId: journal.id,
            amount: -Math.abs(transactionData.amount), // Negative for source (withdrawal)
            description: transactionData.description,
          }
        });
      }

      if (transactionData.destinationAccountId) {
        await prisma.transaction.create({
          data: {
            accountId: transactionData.destinationAccountId,
            transactionJournalId: journal.id,
            amount: Math.abs(transactionData.amount), // Positive for destination
            description: transactionData.description,
          }
        });
      }

      console.log(`✅ Transacción ${transactionData.description} creada`)
    } catch (e) {
      console.log(`ℹ️ Transacción ${transactionData.description} ya existe o error: ${e}`)
    }
  }

  console.log('\n🎉 Seeding completado!')
  console.log('\n📝 Credenciales de acceso:')
  console.log('Email: admin@firefly.local')
  console.log('Contraseña: admin123')
  console.log('\n💰 Datos creados:')
  console.log('- 7 cuentas de ejemplo')
  console.log('- 5 transacciones de ejemplo')
  console.log('- 4 tipos de cuenta')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
