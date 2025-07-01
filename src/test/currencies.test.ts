import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock de las dependencias antes de importar
vi.mock('@/lib/db')

// Importar después de hacer los mocks
const { GET } = await import('@/app/api/currencies/route')
const { db } = await import('@/lib/db')

describe('Currencies API - Tests Unitarios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/currencies', () => {
    it('debe devolver todas las monedas disponibles', async () => {
      // Arrange
      const mockCurrencies = [
        {
          id: 'curr-1',
          code: 'ARS',
          name: 'Peso Argentino',
          symbol: '$',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'curr-2',
          code: 'USD',
          name: 'Dólar Estadounidense',
          symbol: 'US$',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'curr-3',
          code: 'EUR',
          name: 'Euro',
          symbol: '€',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      vi.mocked(db.currency.findMany).mockResolvedValueOnce(mockCurrencies as any)

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toEqual(mockCurrencies)
      expect(db.currency.findMany).toHaveBeenCalledWith({
        orderBy: {
          code: 'asc',
        },
      })
    })

    it('debe devolver array vacío si no hay monedas', async () => {
      // Arrange
      vi.mocked(db.currency.findMany).mockResolvedValueOnce([])

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toEqual([])
    })

    it('debe manejar errores de base de datos', async () => {
      // Arrange
      vi.mocked(db.currency.findMany).mockRejectedValueOnce(new Error('Database connection error'))

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data.message).toBe('Error interno del servidor')
    })

    it('debe devolver monedas ordenadas por código', async () => {
      // Arrange
      const mockCurrencies = [
        {
          id: 'curr-1',
          code: 'ARS',
          name: 'Peso Argentino',
          symbol: '$'
        },
        {
          id: 'curr-2',
          code: 'EUR',
          name: 'Euro',
          symbol: '€'
        },
        {
          id: 'curr-3',
          code: 'USD',
          name: 'Dólar Estadounidense',
          symbol: 'US$'
        }
      ]

      vi.mocked(db.currency.findMany).mockResolvedValueOnce(mockCurrencies as any)

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data[0].code).toBe('ARS')
      expect(data[1].code).toBe('EUR')
      expect(data[2].code).toBe('USD')
    })

    it('debe incluir el peso argentino como primera opción', async () => {
      // Arrange
      const mockCurrencies = [
        {
          id: 'curr-1',
          code: 'ARS',
          name: 'Peso Argentino',
          symbol: '$'
        },
        {
          id: 'curr-2',
          code: 'USD',
          name: 'Dólar Estadounidense',
          symbol: 'US$'
        }
      ]

      vi.mocked(db.currency.findMany).mockResolvedValueOnce(mockCurrencies as any)

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.length).toBeGreaterThan(0)
      
      // Verificar que ARS está presente
      const arsFound = data.find((currency: any) => currency.code === 'ARS')
      expect(arsFound).toBeDefined()
      expect(arsFound?.name).toBe('Peso Argentino')
      expect(arsFound?.symbol).toBe('$')
    })
  })
})
