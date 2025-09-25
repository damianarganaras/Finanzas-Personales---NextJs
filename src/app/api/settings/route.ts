import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// Esquemas de validación para configuraciones
const notificationsSchema = z.object({
  email: z.boolean().optional(),
  browser: z.boolean().optional(),
  billReminders: z.boolean().optional(),
  budgetAlerts: z.boolean().optional(),
}).partial().optional();

const dashboardSchema = z.object({
  showAccountBalances: z.boolean().optional(),
  showRecentTransactions: z.boolean().optional(),
  showUpcomingBills: z.boolean().optional(),
  defaultPeriod: z.enum(['7', '30', '90', '365']).optional(),
}).partial().optional();

const settingsBodySchema = z.object({
  defaultCurrency: z.string().regex(/^[A-Z]{3}$/).optional(),
  language: z.enum(['es', 'en', 'pt']).optional(),
  dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).optional(),
  numberFormat: z.string().regex(/^[a-z]{2}-[A-Z]{2}$/).optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  // Usamos dashboardWidgets (Json) como contenedor de preferencias extendidas
  notifications: notificationsSchema,
  dashboard: dashboardSchema,
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

  const existing = await db.userSettings.findUnique({ where: { userId: user.id } }).catch(() => null);
  const persisted = existing ?? await db.userSettings.create({
      data: {
        userId: user.id,
      },
    });

    // Parse extended preferences from persisted JSON
    const extended = ((): {
      notifications?: { email: boolean; browser: boolean; billReminders: boolean; budgetAlerts: boolean };
      dashboard?: { showAccountBalances: boolean; showRecentTransactions: boolean; showUpcomingBills: boolean; defaultPeriod: '7'|'30'|'90'|'365' };
    } => {
      try {
        return (persisted.dashboardWidgets as any) ?? {};
      } catch {
        return {} as any;
      }
    })();

    const response = {
      user: {
        name: user.name,
        email: user.email,
        emailVerified: user.verified ? new Date() : null,
        userGroupId: user.userGroupId,
        userGroupTitle: user.userGroup.title,
      },
      preferences: {
        currency: persisted.defaultCurrency,
        language: persisted.language,
        dateFormat: persisted.dateFormat,
        numberFormat: persisted.numberFormat,
        theme: (persisted.theme as 'light' | 'dark' | 'system') ?? 'light',
      },
      notifications: {
        email: extended.notifications?.email ?? true,
        browser: extended.notifications?.browser ?? true,
        billReminders: extended.notifications?.billReminders ?? true,
        budgetAlerts: extended.notifications?.budgetAlerts ?? true,
      },
      dashboard: {
        showAccountBalances: extended.dashboard?.showAccountBalances ?? true,
        showRecentTransactions: extended.dashboard?.showRecentTransactions ?? true,
        showUpcomingBills: extended.dashboard?.showUpcomingBills ?? true,
        defaultPeriod: (extended.dashboard?.defaultPeriod ?? '30') as '7' | '30' | '90' | '365',
      },
      statistics: {
        accountCount: await db.account.count({ where: { userId: user.id } }),
        transactionCount: await db.transaction.count({ where: { account: { userId: user.id } } }),
        budgetCount: await db.budget.count({ where: { userId: user.id } }),
        billCount: await db.bill.count({ where: { userId: user.id } }),
      },
    };

    return NextResponse.json(response);
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
    // Backward-compatible mapping (currency -> defaultCurrency)
    const candidate = {
      defaultCurrency: body.defaultCurrency ?? body.currency,
      language: body.language,
      dateFormat: body.dateFormat,
      numberFormat: body.numberFormat,
      theme: body.theme,
      notifications: body.notifications,
      dashboard: body.dashboard,
    };
    const validatedData = settingsBodySchema.parse(candidate);

    // Buscar el usuario
    const user = await db.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Fetch current to merge JSON content safely
    const current = await db.userSettings.findUnique({ where: { userId: user.id } });

    const currentExtended = ((): any => {
      try { return (current?.dashboardWidgets as any) ?? {}; } catch { return {}; }
    })();

    const newExtended = {
      ...currentExtended,
      notifications: {
        ...(currentExtended.notifications ?? {}),
        ...(validatedData.notifications ?? {}),
      },
      dashboard: {
        ...(currentExtended.dashboard ?? {}),
        ...(validatedData.dashboard ?? {}),
      },
    };

  const updated = await db.userSettings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        defaultCurrency: validatedData.defaultCurrency,
        language: validatedData.language,
        dateFormat: validatedData.dateFormat,
        numberFormat: validatedData.numberFormat,
        theme: validatedData.theme,
        dashboardWidgets: newExtended,
      },
      update: {
        defaultCurrency: validatedData.defaultCurrency,
        language: validatedData.language,
        dateFormat: validatedData.dateFormat,
        numberFormat: validatedData.numberFormat,
        theme: validatedData.theme,
        dashboardWidgets: newExtended,
      },
    });

    return NextResponse.json({
      message: 'Configuración actualizada exitosamente',
      settings: updated,
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

      case 'reset_preferences': {
        // Persist defaults in DB and return DB row
        const reset = await db.userSettings.upsert({
          where: { userId: user.id },
          create: { userId: user.id },
          update: {
            defaultCurrency: 'ARS',
            language: 'es',
            dateFormat: 'DD/MM/YYYY',
            numberFormat: 'es-AR',
            theme: 'light',
            dashboardWidgets: {
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
            },
          },
        });

        return NextResponse.json({
          message: 'Preferencias restablecidas exitosamente',
          settings: reset,
        });
      }

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
