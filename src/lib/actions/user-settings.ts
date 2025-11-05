import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { UserSettingsData, UserSettingsInput } from '@/lib/validations';

export async function getUserSettings(): Promise<UserSettingsData | null> {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return null;
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { settings: true },
    });

    if (!user) {
      return null;
    }

    // Return default settings if no user settings exist
    if (!user.settings) {
      return {
        defaultCurrency: 'ARS',
        language: 'es',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: 'es-AR',
        theme: 'light',
        dashboardWidgets: {},
      };
    }

    // Map persisted settings to expected format
    return {
      defaultCurrency: user.settings.defaultCurrency as any || 'ARS',
      language: user.settings.language as any || 'es',
      dateFormat: user.settings.dateFormat as any || 'DD/MM/YYYY',
      numberFormat: user.settings.numberFormat as any || 'es-AR',
      theme: user.settings.theme as any || 'light',
      dashboardWidgets: (user.settings.dashboardWidgets as any) || {},
    };
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return null;
  }
}

export async function updateUserSettings(settings: UserSettingsInput): Promise<UserSettingsData> {
  const session = await auth();
  
  if (!session?.user?.email) {
    throw new Error('No autorizado');
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const updated = await db.userSettings.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      defaultCurrency: settings.defaultCurrency,
      language: settings.language,
      dateFormat: settings.dateFormat,
      numberFormat: settings.numberFormat,
      theme: settings.theme,
      dashboardWidgets: settings.dashboardWidgets as any,
    },
    update: {
      defaultCurrency: settings.defaultCurrency,
      language: settings.language,
      dateFormat: settings.dateFormat,
      numberFormat: settings.numberFormat,
      theme: settings.theme,
      dashboardWidgets: settings.dashboardWidgets as any,
    },
  });

  return {
    defaultCurrency: updated.defaultCurrency as any || 'ARS',
    language: updated.language as any || 'es',
    dateFormat: updated.dateFormat as any || 'DD/MM/YYYY',
    numberFormat: updated.numberFormat as any || 'es-AR',
    theme: updated.theme as any || 'light',
    dashboardWidgets: (updated.dashboardWidgets as any) || {},
  };
}