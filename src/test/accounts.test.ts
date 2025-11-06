import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock de las dependencias antes de importar
// Mock explícito de DB con las funciones utilizadas en estos tests unitarios
vi.mock('@/lib/db', () => ({
  db: {
    account: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    currency: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    accountType: {
      findFirst: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}))
// Mock del módulo de auth para evitar evaluar 'next-auth' en entorno Vitest
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}))
vi.mock('next-auth')

// Importar después de hacer los mocks
const { GET, POST } = await import('@/app/api/accounts/route')
const { auth } = await import('@/lib/auth')
const { db } = await import('@/lib/db')

describe('Accounts API - Tests Unitarios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET /api/accounts', () => {
    it('debe devolver 401 si no hay sesión', async () => {
      // Arrange
  (auth as vi.Mock).mockResolvedValueOnce(null)

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data.message).toBe('No autorizado')
    })

    it('debe devolver 401 si no hay usuario en la sesión', async () => {
      // Arrange
  (auth as vi.Mock).mockResolvedValueOnce({ user: null })

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data.message).toBe('No autorizado')
    })

    it('debe devolver las cuentas del usuario autenticado', async () => {
      // Arrange
      const mockSession = {
        user: { id: 'user-123' }
      }
      const mockAccounts = [
        {
          id: 'account-1',
          name: 'Mi Cuenta Bancaria',
          virtualBalance: 1000,
          active: true,
          accountType: { id: 'type-1', type: 'ASSET' },
          currency: { id: 'curr-1', code: 'ARS', symbol: '$' }
        }
      ];

  (auth as vi.Mock).mockResolvedValueOnce(mockSession);
  (db.account.findMany as vi.Mock).mockResolvedValueOnce(mockAccounts)

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(200)
      expect(data).toEqual(mockAccounts)
      expect(db.account.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123', active: true },
        include: {
          accountType: true,
          currency: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    })

    it('debe manejar errores de base de datos', async () => {
      // Arrange
      const mockSession = {
        user: { id: 'user-123' }
      };

  (auth as vi.Mock).mockResolvedValueOnce(mockSession);
  (db.account.findMany as vi.Mock).mockRejectedValueOnce(new Error('Database error'))

      // Act
      const response = await GET()
      const data = await response.json()

      // Assert
      expect(response.status).toBe(500)
      expect(data.message).toBe('Error interno del servidor')
    })
  })

  describe('POST /api/accounts', () => {
    it('debe devolver 401 si no hay sesión', async () => {
      // Arrange
  (auth as vi.Mock).mockResolvedValueOnce(null)
      const request = new NextRequest('http://localhost/api/accounts', {
        method: 'POST',
        body: JSON.stringify({})
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(401)
      expect(data.message).toBe('No autorizado')
    })

    it('debe devolver 400 si los datos son inválidos', async () => {
      // Arrange
      const mockSession = {
        user: { id: 'user-123' }
      };
  (auth as vi.Mock).mockResolvedValueOnce(mockSession)

      const request = new NextRequest('http://localhost/api/accounts', {
        method: 'POST',
        body: JSON.stringify({
          name: '', // nombre vacío - inválido
          accountTypeId: '',
          active: true
        })
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data.message).toBe('Datos inválidos')
    })

    it('debe crear una cuenta con moneda ARS por defecto', async () => {
      // Arrange
      const mockSession = {
        user: { id: 'user-123' }
      }
      const mockAccountType = {
        id: 'type-1',
        type: 'ASSET'
      };
      const mockCurrency = {
        id: 'curr-1',
        code: 'ARS',
        name: 'Peso Argentino',
        symbol: '$'
      };
      const mockUser = {
        id: 'user-123',
        userGroupId: 'group-1',
        userGroup: { id: 'group-1' }
      };
      const mockCreatedAccount = {
        id: 'account-1',
        name: 'Mi Nueva Cuenta',
        virtualBalance: null,
        iban: null,
        active: true,
        userId: 'user-123',
        userGroupId: 'group-1',
        currencyId: 'curr-1',
        accountType: mockAccountType,
        currency: mockCurrency
      };

  (auth as vi.Mock).mockResolvedValueOnce(mockSession);
  (db.currency.findUnique as vi.Mock).mockResolvedValueOnce(null);
  (db.currency.upsert as vi.Mock).mockResolvedValueOnce(mockCurrency);
  (db.accountType.findFirst as vi.Mock).mockResolvedValueOnce(mockAccountType);
  (db.user.findUnique as vi.Mock).mockResolvedValueOnce(mockUser);
  (db.account.create as vi.Mock).mockResolvedValueOnce(mockCreatedAccount)

      const request = new NextRequest('http://localhost/api/accounts', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Mi Nueva Cuenta',
          accountTypeId: 'ASSET',
          active: true
          // Sin currencyId - debe usar ARS por defecto
        })
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(201)
      expect(data).toEqual(mockCreatedAccount)
      
      // Verificar que se buscó/creó la moneda ARS
      expect(db.currency.upsert).toHaveBeenCalledWith({
        where: { code: 'ARS' },
        update: {},
        create: {
          code: 'ARS',
          name: 'Peso Argentino',
          symbol: '$',
        },
      })

      // Verificar que se creó la cuenta con la moneda correcta
      expect(db.account.create).toHaveBeenCalledWith({
        data: {
          name: 'Mi Nueva Cuenta',
          accountTypeId: 'type-1',
          virtualBalance: null,
          iban: null,
          active: true,
          userId: 'user-123',
          userGroupId: 'group-1',
          currencyId: 'curr-1',
        },
        include: {
          accountType: true,
          currency: true,
        },
      })
    })

    it('debe usar la moneda especificada si existe', async () => {
      // Arrange
      const mockSession = {
        user: { id: 'user-123' }
      }
      const mockAccountType = {
        id: 'type-1',
        type: 'ASSET'
      };
      const mockCurrency = {
        id: 'curr-2',
        code: 'USD',
        name: 'Dólar Estadounidense',
        symbol: 'US$'
      };
      const mockUser = {
        id: 'user-123',
        userGroupId: 'group-1',
        userGroup: { id: 'group-1' }
      };
      const mockCreatedAccount = {
        id: 'account-1',
        name: 'Cuenta en USD',
        virtualBalance: 1000,
        iban: null,
        active: true,
        userId: 'user-123',
        userGroupId: 'group-1',
        currencyId: 'curr-2',
        accountType: mockAccountType,
        currency: mockCurrency
      };

  (auth as vi.Mock).mockResolvedValueOnce(mockSession);
  (db.currency.findUnique as vi.Mock).mockResolvedValueOnce(mockCurrency);
  (db.accountType.findFirst as vi.Mock).mockResolvedValueOnce(mockAccountType);
  (db.user.findUnique as vi.Mock).mockResolvedValueOnce(mockUser);
  (db.account.create as vi.Mock).mockResolvedValueOnce(mockCreatedAccount)

      const request = new NextRequest('http://localhost/api/accounts', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Cuenta en USD',
          accountTypeId: 'ASSET',
          virtualBalance: 1000,
          active: true,
          currencyId: 'curr-2'
        })
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(201)
      expect(data).toEqual(mockCreatedAccount)
      
      // Verificar que se usó la moneda especificada
      expect(db.currency.findUnique).toHaveBeenCalledWith({
        where: { id: 'curr-2' },
      })
      
      // No debe crear una nueva moneda
      expect(db.currency.upsert).not.toHaveBeenCalled()
    })

    it('debe devolver 400 si el tipo de cuenta no existe', async () => {
      // Arrange
      const mockSession = {
        user: { id: 'user-123' }
      };
      const mockCurrency = {
        id: 'curr-1',
        code: 'ARS',
        name: 'Peso Argentino',
        symbol: '$'
      };

  (auth as vi.Mock).mockResolvedValueOnce(mockSession);
  (db.currency.upsert as vi.Mock).mockResolvedValueOnce(mockCurrency);
  (db.accountType.findFirst as vi.Mock).mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost/api/accounts', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Mi Nueva Cuenta',
          accountTypeId: 'INVALID_TYPE',
          active: true
        })
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(400)
      expect(data.message).toBe('Tipo de cuenta "INVALID_TYPE" no encontrado')
    })

    it('debe devolver 404 si el usuario no existe', async () => {
      // Arrange
      const mockSession = {
        user: { id: 'user-123' }
      };
      const mockAccountType = {
        id: 'type-1',
        type: 'ASSET'
      };
      const mockCurrency = {
        id: 'curr-1',
        code: 'ARS',
        name: 'Peso Argentino',
        symbol: '$'
      };

  (auth as vi.Mock).mockResolvedValueOnce(mockSession);
  (db.currency.upsert as vi.Mock).mockResolvedValueOnce(mockCurrency);
  (db.accountType.findFirst as vi.Mock).mockResolvedValueOnce(mockAccountType);
  (db.user.findUnique as vi.Mock).mockResolvedValueOnce(null)

      const request = new NextRequest('http://localhost/api/accounts', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Mi Nueva Cuenta',
          accountTypeId: 'ASSET',
          active: true
        })
      })

      // Act
      const response = await POST(request)
      const data = await response.json()

      // Assert
      expect(response.status).toBe(404)
      expect(data.message).toBe('Usuario no encontrado')
    })
  })
})
