import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateAccountToNewType() {
  console.log('🔄 Migrando cuenta del tipo obsoleto ASSET al nuevo tipo asset...')

  try {
    // Buscar el tipo nuevo 'asset'
    const newAssetType = await prisma.accountType.findUnique({
      where: { type: 'asset' }
    })

    if (!newAssetType) {
      console.log('❌ No se encontró el tipo nuevo asset')
      return
    }

    // Buscar cuentas con el tipo obsoleto usando el ID conocido
    const accountsToMigrate = await prisma.account.findMany({
      where: { accountTypeId: 'asset-type' }, // ID del tipo obsoleto 'ASSET'
      include: { accountType: true }
    })

    console.log(`Encontradas ${accountsToMigrate.length} cuentas con tipo obsoleto 'ASSET'`)

    // Migrar cada cuenta al nuevo tipo
    for (const account of accountsToMigrate) {
      await prisma.account.update({
        where: { id: account.id },
        data: { accountTypeId: newAssetType.id }
      })
      console.log(`✅ Cuenta '${account.name}' migrada del tipo '${account.accountType.type}' al tipo 'asset'`)
    }

    // Si ya no hay cuentas, eliminar el tipo obsoleto
    const remainingAccounts = await prisma.account.count({
      where: { accountTypeId: 'asset-type' }
    })

    if (remainingAccounts === 0) {
      await prisma.accountType.delete({
        where: { id: 'asset-type' }
      })
      console.log('🗑️ Tipo obsoleto ASSET eliminado')
    }

    console.log('✅ Migración completada')
  } catch (error) {
    console.error('❌ Error durante la migración:', error)
  } finally {
    await prisma.$disconnect()
  }
}

migrateAccountToNewType()
