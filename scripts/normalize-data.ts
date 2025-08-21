import { PrismaClient } from '@prisma/client'

/**
 * Normaliza datos sin borrar información:
 * - Asegura AccountType canónicos (asset, expense, revenue, liability) con nombres en español.
 * - Migra cuentas que apunten a tipos obsoletos (IDs legacy o type en MAYÚSCULAS) al tipo canónico en minúsculas.
 * - No elimina datos del usuario; solo upserts/updates seguros.
 */
async function main() {
  const prisma = new PrismaClient()
  try {
    console.log('🔧 Normalizando tipos de cuenta...')
    const canonical = [
      { type: 'asset', name: 'Activos' },
      { type: 'expense', name: 'Gastos' },
      { type: 'revenue', name: 'Ingresos' },
      { type: 'liability', name: 'Pasivos' },
    ]

    // Upsert tipos canónicos
    for (const a of canonical) {
      await prisma.accountType.upsert({
        where: { type: a.type },
        update: { name: a.name },
        create: { type: a.type, name: a.name },
      })
    }

    const allTypes = await prisma.accountType.findMany()
    const byType: Record<string, string> = {}
    for (const t of allTypes) byType[t.type.toLowerCase()] = t.id

    // Migrar cuentas a IDs canónicos
    const accounts = await prisma.account.findMany({ include: { accountType: true } })
    let migrated = 0
    for (const acc of accounts) {
      const raw = acc.accountType.type
      const norm = raw.toLowerCase()
      const targetId = byType[norm]
      if (targetId && acc.accountTypeId !== targetId) {
        await prisma.account.update({ where: { id: acc.id }, data: { accountTypeId: targetId } })
        migrated++
      }
    }
    console.log(`✅ Cuentas actualizadas a tipos canónicos: ${migrated}`)

    // Monedas mínimas
    await prisma.currency.upsert({
      where: { code: 'ARS' },
      update: { name: 'Peso Argentino', symbol: '$' },
      create: { code: 'ARS', name: 'Peso Argentino', symbol: '$' },
    })
    await prisma.currency.upsert({
      where: { code: 'USD' },
      update: { name: 'Dólar Estadounidense', symbol: 'US$' },
      create: { code: 'USD', name: 'Dólar Estadounidense', symbol: 'US$' },
    })

    console.log('✨ Normalización finalizada.')
  } catch (e) {
    console.error('❌ Error normalizando datos:', e)
    process.exitCode = 1
  }
}

main()
