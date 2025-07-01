import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function initializeCurrencies() {
  console.log('🌍 Inicializando monedas...')

  try {
    // Crear peso argentino como moneda principal
    const ars = await db.currency.upsert({
      where: { code: 'ARS' },
      update: {},
      create: {
        code: 'ARS',
        name: 'Peso Argentino',
        symbol: '$',
      },
    })
    console.log('✅ Peso Argentino:', ars)

    // Crear otras monedas comunes
    const usd = await db.currency.upsert({
      where: { code: 'USD' },
      update: {},
      create: {
        code: 'USD',
        name: 'Dólar Estadounidense',
        symbol: 'US$',
      },
    })
    console.log('✅ Dólar Estadounidense:', usd)

    const eur = await db.currency.upsert({
      where: { code: 'EUR' },
      update: {},
      create: {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
      },
    })
    console.log('✅ Euro:', eur)

    console.log('🎉 Monedas inicializadas correctamente!')
  } catch (error) {
    console.error('❌ Error al inicializar monedas:', error)
  } finally {
    await db.$disconnect()
  }
}

initializeCurrencies()
