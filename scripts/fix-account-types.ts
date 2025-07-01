import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixAccountTypes() {
  console.log('🔧 Verificando y corrigiendo tipos de cuenta...')

  try {
    // Obtener tipos actuales
    const currentTypes = await prisma.accountType.findMany()
    console.log('Tipos actuales:', currentTypes)

    // Definir los tipos correctos en minúsculas
    const correctTypes = [
      { type: 'asset', name: 'Activos' },
      { type: 'liability', name: 'Pasivos' },
      { type: 'expense', name: 'Gastos' },
      { type: 'revenue', name: 'Ingresos' }
    ]

    // Crear o actualizar cada tipo
    for (const accountType of correctTypes) {
      const existing = await prisma.accountType.findUnique({
        where: { type: accountType.type }
      })
      
      if (existing) {
        await prisma.accountType.update({
          where: { id: existing.id },
          data: { name: accountType.name }
        })
        console.log(`✅ Tipo de cuenta '${accountType.type}' actualizado`)
      } else {
        await prisma.accountType.create({
          data: {
            type: accountType.type,
            name: accountType.name
          }
        })
        console.log(`✅ Tipo de cuenta '${accountType.type}' creado`)
      }
    }

    // Buscar y mostrar tipos obsoletos (en mayúsculas) sin eliminarlos automáticamente
    const obsoleteTypes = ['ASSET', 'LIABILITY', 'EXPENSE', 'REVENUE']
    for (const type of obsoleteTypes) {
      const existingType = await prisma.accountType.findUnique({
        where: { type }
      })
      
      if (existingType) {
        const accountCount = await prisma.account.count({
          where: { accountTypeId: existingType.id }
        })
        
        if (accountCount === 0) {
          await prisma.accountType.delete({ where: { id: existingType.id } })
          console.log(`🗑️ Tipo obsoleto '${type}' eliminado`)
        } else {
          console.log(`⚠️ Tipo obsoleto '${type}' tiene ${accountCount} cuentas asociadas`)
          console.log(`   Para migrar, ejecuta manualmente la actualización de cuentas`)
        }
      }
    }

    console.log('✅ Tipos de cuenta corregidos')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixAccountTypes()
