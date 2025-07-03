import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seeding de la base de datos...')

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

  // Crear tipos de cuenta
  const assetAccountType = await prisma.accountType.upsert({
    where: { type: 'asset' },
    update: {},
    create: {
      type: 'asset',
      name: 'Asset accounts'
    }
  })

  const expenseAccountType = await prisma.accountType.upsert({
    where: { type: 'expense' },
    update: {},
    create: {
      type: 'expense',
      name: 'Expense accounts'
    }
  })

  const revenueAccountType = await prisma.accountType.upsert({
    where: { type: 'revenue' },
    update: {},
    create: {
      type: 'revenue',
      name: 'Revenue accounts'
    }
  })

  const liabilityAccountType = await prisma.accountType.upsert({
    where: { type: 'liability' },
    update: {},
    create: {
      type: 'liability',
      name: 'Liability accounts'
    }
  })

  console.log('✅ Tipos de cuenta creados')

  // Crear moneda por defecto
  const defaultCurrency = await prisma.currency.upsert({
    where: { code: 'ARS' },
    update: {},
    create: {
      code: 'ARS',
      name: 'Peso Argentino',
      symbol: '$'
    }
  })

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
  const checkingAccount = await prisma.account.upsert({
    where: { id: 'checking-account' },
    update: {},
    create: {
      id: 'checking-account',
      name: 'Cuenta Corriente',
      accountTypeId: assetAccountType.id,
      virtualBalance: 50000.00,
      active: true,
      userId: adminUser.id,
      userGroupId: userGroup.id,
      currencyId: defaultCurrency.id
    }
  })

  const savingsAccount = await prisma.account.upsert({
    where: { id: 'savings-account' },
    update: {},
    create: {
      id: 'savings-account',
      name: 'Caja de Ahorro',
      accountTypeId: assetAccountType.id,
      virtualBalance: 100000.00,
      active: true,
      userId: adminUser.id,
      userGroupId: userGroup.id,
      currencyId: defaultCurrency.id
    }
  })

  const creditCardAccount = await prisma.account.upsert({
    where: { id: 'credit-card-account' },
    update: {},
    create: {
      id: 'credit-card-account',
      name: 'Tarjeta de Crédito',
      accountTypeId: liabilityAccountType.id,
      virtualBalance: 0.00,
      active: true,
      userId: adminUser.id,
      userGroupId: userGroup.id,
      currencyId: defaultCurrency.id
    }
  })

  console.log('✅ Cuentas de ejemplo creadas')

  console.log('\n🎉 Seeding completado!')
  console.log('\n📝 Credenciales de acceso:')
  console.log('Email: admin@firefly.local')
  console.log('Contraseña: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
