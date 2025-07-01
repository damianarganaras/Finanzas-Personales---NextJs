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
  const assetAccountType = await prisma.accountType.create({
    data: {
      id: 'asset-type',
      type: 'ASSET',
      name: 'Asset accounts'
    }
  })

  const expenseAccountType = await prisma.accountType.create({
    data: {
      id: 'expense-type',
      type: 'EXPENSE',
      name: 'Expense accounts'
    }
  })

  const revenueAccountType = await prisma.accountType.create({
    data: {
      id: 'revenue-type',
      type: 'REVENUE',
      name: 'Revenue accounts'
    }
  })

  console.log('✅ Tipos de cuenta creados')

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
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
