import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock completo de Prisma antes de importar
vi.mock('@/lib/db', () => ({
  db: {
    accountType: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }
  }
}))

// Importar después de hacer los mocks
const { GET } = await import('@/app/api/account-types/route')
const { db } = await import('@/lib/db')

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
          type: 'ASSET',
          description: 'Cuenta de activos',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'type-2',
          type: 'EXPENSE',
          description: 'Cuenta de gastos',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'type-3',
          type: 'REVENUE',
          description: 'Cuenta de ingresos',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'type-4',
          type: 'LIABILITY',
          description: 'Cuenta de pasivos',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      ;(db.accountType.findMany as any).mockResolvedValueOnce(mockAccountTypes)

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      // Fechas se serializan a string en JSON; normalizamos el expect
      const expected = mockAccountTypes.map((t) => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      }))
      expect(data).toEqual(expected)
      expect(db.accountType.findMany).toHaveBeenCalledWith({
        orderBy: {
          type: 'asc',
        },
      })
    })

    it('debe devolver array vacío si no hay tipos de cuenta', async () => {
      // Arrange
      ;(db.accountType.findMany as any).mockResolvedValueOnce([])

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toEqual([])
    })

    it('debe manejar errores de base de datos', async () => {
      // Arrange
      ;(db.accountType.findMany as any).mockRejectedValueOnce(new Error('Database connection error'))

      // Act
      const response = await GET()
      const data = await response.json()

  // Assert
  expect(response.status).toBe(500)
  // La API retorna { error: 'Error al obtener los tipos de cuenta' }
  expect(data.error).toBe('Error al obtener los tipos de cuenta')
    })

    it('debe devolver tipos de cuenta ordenados alfabéticamente', async () => {
      // Arrange
      const mockAccountTypes = [
        {
          id: 'type-1',
          type: 'ASSET',
          description: 'Cuenta de activos'
        },
        {
          id: 'type-2',
          type: 'EXPENSE',
          description: 'Cuenta de gastos'
        },
        {
          id: 'type-3',
          type: 'LIABILITY',
          description: 'Cuenta de pasivos'
        },
        {
          id: 'type-4',
          type: 'REVENUE',
          description: 'Cuenta de ingresos'
        }
      ]

      ;(db.accountType.findMany as any).mockResolvedValueOnce(mockAccountTypes)

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data[0].type).toBe('ASSET')
      expect(data[1].type).toBe('EXPENSE')
      expect(data[2].type).toBe('LIABILITY')
      expect(data[3].type).toBe('REVENUE')
    })

    it('debe incluir el tipo ASSET como opción principal', async () => {
      // Arrange
      const mockAccountTypes = [
        {
          id: 'type-1',
          type: 'ASSET',
          description: 'Cuenta de activos'
        },
        {
          id: 'type-2',
          type: 'EXPENSE',
          description: 'Cuenta de gastos'
        }
      ]

      ;(db.accountType.findMany as any).mockResolvedValueOnce(mockAccountTypes)

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data.length).toBeGreaterThan(0)
      
      // Verificar que ASSET está presente
      const assetFound = data.find((accountType: any) => accountType.type === 'ASSET')
      expect(assetFound).toBeDefined()
      expect(assetFound?.description).toBe('Cuenta de activos')
    })

    it('debe incluir todos los tipos básicos de cuenta', async () => {
      // Arrange
      const mockAccountTypes = [
        {
          id: 'type-1',
          type: 'ASSET',
          description: 'Cuenta de activos'
        },
        {
          id: 'type-2',
          type: 'EXPENSE',
          description: 'Cuenta de gastos'
        },
        {
          id: 'type-3',
          type: 'REVENUE',
          description: 'Cuenta de ingresos'
        },
        {
          id: 'type-4',
          type: 'LIABILITY',
          description: 'Cuenta de pasivos'
        }
      ]

      ;(db.accountType.findMany as any).mockResolvedValueOnce(mockAccountTypes)

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      
      const types = data.map((accountType: any) => accountType.type)
      expect(types).toContain('ASSET')
      expect(types).toContain('EXPENSE')
      expect(types).toContain('REVENUE')
      expect(types).toContain('LIABILITY')
    })

    it('debe incluir descripciones para cada tipo', async () => {
      // Arrange
      const mockAccountTypes = [
        {
          id: 'type-1',
          type: 'ASSET',
          description: 'Cuenta de activos'
        },
        {
          id: 'type-2',
          type: 'EXPENSE',
          description: 'Cuenta de gastos'
        }
      ]

      ;(db.accountType.findMany as any).mockResolvedValueOnce(mockAccountTypes)

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      
      // Verificar que cada tipo tiene una descripción
      data.forEach((accountType: any) => {
        expect(accountType.description).toBeDefined()
        expect(accountType.description.length).toBeGreaterThan(0)
      })
    })
  })
})
