import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function fixCurrencySymbols() {
  console.log('🔧 Corrigiendo símbolos de monedas...')

  try {
    // Corregir símbolo del USD
    const usd = await db.currency.update({
      where: { code: 'USD' },
      data: { symbol: 'US$' },
    })
    console.log('✅ USD corregido:', usd)

    console.log('🎉 Símbolos de monedas corregidos!')
  } catch (error) {
    console.error('❌ Error al corregir símbolos:', error)
  } finally {
    await db.$disconnect()
  }
}

fixCurrencySymbols()
