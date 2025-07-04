import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock de las dependencias antes de importar
const mockFindMany = vi.fn()

vi.mock('@/lib/db', () => ({
  db: {
    accountType: {
      findMany: mockFindMany,
    }
  }
}))

// Importar después de hacer los mocks
const { GET } = await import('@/app/api/account-types/route')

describe('Account Types API - Tests Unitarios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/account-types', () => {
    it('debe devolver todos los tipos de cuenta disponibles', async () => {
      // Arrange
      const mockAccountTypes = [
        {
          id: 'type-1',
          type: 'asset',
          name: 'Asset accounts',
          createdAt: '2025-07-04T01:25:12.027Z',
          updatedAt: '2025-07-04T01:25:12.027Z'
        },
        {
          id: 'type-2',
          type: 'expense',
          name: 'Expense accounts',
          createdAt: '2025-07-04T01:25:12.027Z',
          updatedAt: '2025-07-04T01:25:12.027Z'
        },
        {
          id: 'type-3',
          type: 'revenue',
          name: 'Revenue accounts',
          createdAt: '2025-07-04T01:25:12.027Z',
          updatedAt: '2025-07-04T01:25:12.027Z'
        },
        {
          id: 'type-4',
          type: 'liability',
          name: 'Liability accounts',
          createdAt: '2025-07-04T01:25:12.027Z',
          updatedAt: '2025-07-04T01:25:12.027Z'
        }
      ]

      mockFindMany.mockResolvedValueOnce(mockAccountTypes)

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toEqual(mockAccountTypes)
      expect(mockFindMany).toHaveBeenCalledWith({
        orderBy: {
          type: 'asc',
        },
      })
    })

    it('debe devolver array vacío si no hay tipos de cuenta', async () => {
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
      expect(data).toEqual({ error: 'Error al obtener los tipos de cuenta' })
    })
  })
})
