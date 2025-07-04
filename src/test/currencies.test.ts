import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock de las dependencias antes de importar
const mockFindMany = vi.fn()
const mockAuth = vi.fn()

vi.mock('@/lib/db', () => ({
  db: {
    currency: {
      findMany: mockFindMany,
    }
  }
}))

vi.mock('@/lib/auth', () => ({
  auth: mockAuth,
}))

// Importar después de hacer los mocks
const { GET } = await import('@/app/api/currencies/route')

describe('Currencies API - Tests Unitarios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock de sesión de usuario por defecto
    mockAuth.mockResolvedValue({
      user: {
        id: 'test-user-id',
        email: 'test@example.com'
      }
    })
  })

  describe('GET /api/currencies', () => {
    it('debe devolver todas las monedas disponibles', async () => {
      // Arrange
      const mockCurrencies = [
        {
          id: 'currency-1',
          code: 'ARS',
          name: 'Peso Argentino',
          symbol: '$',
          createdAt: '2025-07-04T01:25:12.027Z',
          updatedAt: '2025-07-04T01:25:12.027Z'
        },
        {
          id: 'currency-2',
          code: 'USD',
          name: 'Dólar Estadounidense',
          symbol: 'US$',
          createdAt: '2025-07-04T01:25:12.027Z',
          updatedAt: '2025-07-04T01:25:12.027Z'
        },
        {
          id: 'currency-3',
          code: 'EUR',
          name: 'Euro',
          symbol: '€',
          createdAt: '2025-07-04T01:25:12.027Z',
          updatedAt: '2025-07-04T01:25:12.027Z'
        }
      ]

      mockFindMany.mockResolvedValueOnce(mockCurrencies)

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toEqual(mockCurrencies)
      expect(mockFindMany).toHaveBeenCalledWith({
        orderBy: {
          code: 'asc',
        },
      })
    })

    it('debe devolver array vacío si no hay monedas', async () => {
      // Arrange
      mockFindMany.mockResolvedValueOnce([])

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toEqual([])
    })

    it('debe manejar errores de base de datos', async () => {
      // Arrange
      mockFindMany.mockRejectedValueOnce(new Error('Database connection failed'))

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data).toEqual({ error: 'Error al obtener las monedas' })
    })

    it('debe devolver monedas ordenadas por código', async () => {
      // Arrange
      const mockCurrencies = [
        {
          id: 'currency-1',
          code: 'ARS',
          name: 'Peso Argentino',
          symbol: '$',
          createdAt: '2025-07-04T01:25:12.027Z',
          updatedAt: '2025-07-04T01:25:12.027Z'
        },
        {
          id: 'currency-2',
          code: 'EUR',
          name: 'Euro',
          symbol: '€',
          createdAt: '2025-07-04T01:25:12.027Z',
          updatedAt: '2025-07-04T01:25:12.027Z'
        },
        {
          id: 'currency-3',
          code: 'USD',
          name: 'Dólar Estadounidense',
          symbol: 'US$',
          createdAt: '2025-07-04T01:25:12.027Z',
          updatedAt: '2025-07-04T01:25:12.027Z'
        }
      ]

      mockFindMany.mockResolvedValueOnce(mockCurrencies)

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
          id: 'currency-1',
          code: 'ARS',
          name: 'Peso Argentino',
          symbol: '$',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'currency-2',
          code: 'USD',
          name: 'Dólar Estadounidense',
          symbol: 'US$',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      mockFindMany.mockResolvedValueOnce(mockCurrencies)

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.some((currency: any) => currency.code === 'ARS')).toBe(true)
      expect(data.find((currency: any) => currency.code === 'ARS').name).toBe('Peso Argentino')
    })
  })
})
