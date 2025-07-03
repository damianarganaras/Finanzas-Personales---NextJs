import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET, POST } from '@/app/api/credit-cards/route';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

// Mock de las dependencias
vi.mock('@/lib/auth');
vi.mock('@/lib/db');

const mockAuth = vi.mocked(auth);
const mockDb = vi.mocked(db);

describe('/api/credit-cards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/credit-cards', () => {
    it('debería retornar 401 si no hay sesión', async () => {
      mockAuth.mockResolvedValue(null);

      const response = await GET();
      
      expect(response.status).toBe(401);
      const body = await response.json();
      expect(body.error).toBe('No autorizado');
    });

    it('debería retornar las tarjetas del usuario autenticado', async () => {
      const mockSession = {
        user: { id: 'user123', email: 'test@example.com' },
        expires: '2025-12-31'
      };

      const mockCreditCards = [
        {
          id: 'cc1',
          name: 'Visa Test',
          last4Digits: '1234',
          limit: 50000,
          active: true,
          account: {
            id: 'acc1',
            name: 'Cuenta Visa',
            accountType: { type: 'liability' },
            currency: { symbol: '$' }
          },
          purchases: []
        }
      ];

      mockAuth.mockResolvedValue(mockSession);
      // @ts-ignore - Mock de Prisma
      mockDb.creditCard = {
        findMany: vi.fn().mockResolvedValue(mockCreditCards)
      };

      const response = await GET();
      
      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body).toEqual(mockCreditCards);
      expect(mockDb.creditCard.findMany).toHaveBeenCalledWith({
        where: { userId: 'user123' },
        include: {
          account: {
            include: {
              accountType: true,
              currency: true,
            },
          },
          purchases: {
            include: {
              installmentPayments: {
                where: { status: 'pending' },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('debería manejar errores de base de datos', async () => {
      const mockSession = {
        user: { id: 'user123', email: 'test@example.com' },
        expires: '2025-12-31'
      };

      mockAuth.mockResolvedValue(mockSession);
      // @ts-ignore - Mock de Prisma
      mockDb.creditCard = {
        findMany: vi.fn().mockRejectedValue(new Error('Database error'))
      };

      const response = await GET();
      
      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Error interno del servidor');
    });
  });

  describe('POST /api/credit-cards', () => {
    it('debería retornar 401 si no hay sesión', async () => {
      mockAuth.mockResolvedValue(null);

      const request = new Request('http://localhost/api/credit-cards', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test Card',
          last4Digits: '1234',
          limit: 50000,
          closingDay: 5,
          dueDay: 25,
          active: true,
          accountId: 'acc1',
        }),
      });

      const response = await POST(request);
      
      expect(response.status).toBe(401);
    });

    it('debería crear una tarjeta de crédito válida', async () => {
      const mockSession = {
        user: { id: 'user123', email: 'test@example.com' },
        expires: '2025-12-31'
      };

      const mockAccount = {
        id: 'acc1',
        name: 'Cuenta Test',
        userId: 'user123'
      };

      const mockCreatedCard = {
        id: 'cc1',
        name: 'Test Card',
        last4Digits: '1234',
        limit: 50000,
        closingDay: 5,
        dueDay: 25,
        active: true,
        userId: 'user123',
        accountId: 'acc1',
        account: {
          ...mockAccount,
          accountType: { type: 'liability' },
          currency: { symbol: '$' }
        }
      };

      mockAuth.mockResolvedValue(mockSession);
      // @ts-ignore - Mock de Prisma
      mockDb.account = {
        findFirst: vi.fn().mockResolvedValue(mockAccount)
      };
      // @ts-ignore - Mock de Prisma
      mockDb.creditCard = {
        create: vi.fn().mockResolvedValue(mockCreatedCard)
      };

      const validData = {
        name: 'Test Card',
        last4Digits: '1234',
        limit: 50000,
        closingDay: 5,
        dueDay: 25,
        active: true,
        accountId: 'acc1',
      };

      const request = new Request('http://localhost/api/credit-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validData),
      });

      const response = await POST(request);
      
      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body).toEqual(mockCreatedCard);
      
      expect(mockDb.account.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'acc1',
          userId: 'user123',
        },
      });

      expect(mockDb.creditCard.create).toHaveBeenCalledWith({
        data: {
          ...validData,
          userId: 'user123',
        },
        include: {
          account: {
            include: {
              accountType: true,
              currency: true,
            },
          },
        },
      });
    });

    it('debería retornar 400 para datos inválidos', async () => {
      const mockSession = {
        user: { id: 'user123', email: 'test@example.com' },
        expires: '2025-12-31'
      };

      mockAuth.mockResolvedValue(mockSession);

      const invalidData = {
        name: '', // Nombre vacío
        last4Digits: '123', // Solo 3 dígitos
        limit: -1000, // Límite negativo
        closingDay: 35, // Día inválido
        dueDay: 0, // Día inválido
        active: true,
        accountId: '',
      };

      const request = new Request('http://localhost/api/credit-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidData),
      });

      const response = await POST(request);
      
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Datos inválidos');
      expect(body.details).toBeDefined();
    });

    it('debería retornar 404 si la cuenta no existe', async () => {
      const mockSession = {
        user: { id: 'user123', email: 'test@example.com' },
        expires: '2025-12-31'
      };

      mockAuth.mockResolvedValue(mockSession);
      // @ts-ignore - Mock de Prisma
      mockDb.account = {
        findFirst: vi.fn().mockResolvedValue(null)
      };

      const validData = {
        name: 'Test Card',
        last4Digits: '1234',
        limit: 50000,
        closingDay: 5,
        dueDay: 25,
        active: true,
        accountId: 'nonexistent',
      };

      const request = new Request('http://localhost/api/credit-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validData),
      });

      const response = await POST(request);
      
      expect(response.status).toBe(404);
      const body = await response.json();
      expect(body.error).toBe('Cuenta no encontrada');
    });
  });
});
