import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Esquema de validación para configuraciones
const userSettingsSchema = z.object({
  currency: z.string().optional(),
  language: z.string().optional(),
  dateFormat: z.string().optional(),
  numberFormat: z.string().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  notifications: z.object({
    email: z.boolean().optional(),
    browser: z.boolean().optional(),
    billReminders: z.boolean().optional(),
    budgetAlerts: z.boolean().optional(),
  }).optional(),
  dashboard: z.object({
    showAccountBalances: z.boolean().optional(),
    showRecentTransactions: z.boolean().optional(),
    showUpcomingBills: z.boolean().optional(),
    defaultPeriod: z.enum(['7', '30', '90', '365']).optional(),
  }).optional(),
});

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Buscar el usuario
    const user = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
      include: {
        userGroup: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Obtener configuraciones del usuario (usando metadata o tabla separada)
    // Por ahora usaremos valores por defecto más metadata del usuario
    const settings = {
      user: {
        name: user.name,
        email: user.email,
        emailVerified: user.verified ? new Date() : null,
        userGroupId: user.userGroupId,
        userGroupTitle: user.userGroup.title,
      },
      preferences: {
        currency: 'USD', // Por defecto, se puede obtener de user metadata
        language: 'es',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: 'en-US',
        theme: 'system',
      },
      notifications: {
        email: true,
        browser: true,
        billReminders: true,
        budgetAlerts: true,
      },
      dashboard: {
        showAccountBalances: true,
        showRecentTransactions: true,
        showUpcomingBills: true,
        defaultPeriod: '30',
      },
      statistics: {
        accountCount: await db.account.count({
          where: { userId: user.id }
        }),
        transactionCount: await db.transaction.count({
          where: { 
            account: { userId: user.id }
          }
        }),
        budgetCount: await db.budget.count({
          where: { userId: user.id }
        }),
        billCount: await db.bill.count({
          where: { userId: user.id }
        }),
      }
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = userSettingsSchema.parse(body);

    // Buscar el usuario
    const user = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Actualizar información básica del usuario si se proporciona
    if (validatedData.currency || validatedData.language || validatedData.theme) {
      // En un futuro, esto se guardaría en una tabla UserSettings
      // Por ahora, simulamos la actualización
      console.log('Updating user preferences:', validatedData);
    }

    return NextResponse.json({ 
      message: 'Configuración actualizada exitosamente',
      settings: validatedData
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Datos de configuración inválidos',
          details: error.errors
        },
        { status: 400 }
      );
    }

    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { action } = await request.json();

    const user = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    switch (action) {
      case 'export_data':
        // Exportar datos del usuario
        const exportData = {
          accounts: await db.account.findMany({
            where: { userId: user.id },
            include: {
              accountType: true,
            }
          }),
          transactions: await db.transaction.count({
            where: { account: { userId: user.id } }
          }),
          budgets: await db.budget.findMany({
            where: { userId: user.id }
          }),
          bills: await db.bill.findMany({
            where: { userId: user.id }
          }),
          exportedAt: new Date().toISOString(),
        };

        return NextResponse.json({
          message: 'Datos exportados exitosamente',
          data: exportData
        });

      case 'reset_preferences':
        // Resetear preferencias a valores por defecto
        const defaultSettings = {
          currency: 'USD',
          language: 'es',
          dateFormat: 'DD/MM/YYYY',
          numberFormat: 'en-US',
          theme: 'system',
          notifications: {
            email: true,
            browser: true,
            billReminders: true,
            budgetAlerts: true,
          },
          dashboard: {
            showAccountBalances: true,
            showRecentTransactions: true,
            showUpcomingBills: true,
            defaultPeriod: '30',
          }
        };

        return NextResponse.json({
          message: 'Preferencias restablecidas exitosamente',
          settings: defaultSettings
        });

      default:
        return NextResponse.json(
          { error: 'Acción no válida' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing settings action:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
