import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export interface UserInfo {
  name: string;
  email: string;
  emailVerified: Date | null;
  userGroupId: string;
  userGroupTitle: string;
}

export interface UserPreferences {
  currency: string;
  language: string;
  dateFormat: string;
  numberFormat: string;
  theme: 'light' | 'dark' | 'system';
}

export interface NotificationSettings {
  email: boolean;
  browser: boolean;
  billReminders: boolean;
  budgetAlerts: boolean;
}

export interface DashboardSettings {
  showAccountBalances: boolean;
  showRecentTransactions: boolean;
  showUpcomingBills: boolean;
  defaultPeriod: '7' | '30' | '90' | '365';
}

export interface UserStatistics {
  accountCount: number;
  transactionCount: number;
  budgetCount: number;
  billCount: number;
}

export interface SettingsData {
  user: UserInfo;
  preferences: UserPreferences;
  notifications: NotificationSettings;
  dashboard: DashboardSettings;
  statistics: UserStatistics;
}

export interface UpdateSettingsRequest {
  currency?: string;
  language?: string;
  dateFormat?: string;
  numberFormat?: string;
  theme?: 'light' | 'dark' | 'system';
  notifications?: Partial<NotificationSettings>;
  dashboard?: Partial<DashboardSettings>;
}

export function useSettings() {
  const { data: session, status } = useSession();
  const [settingsData, setSettingsData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener configuraciones del usuario
  const fetchSettings = async () => {
    if (status !== 'authenticated' || !session) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/settings');
      
      if (!response.ok) {
        throw new Error('Error al cargar la configuración');
      }
      
      const data = await response.json();
      setSettingsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Actualizar configuraciones
  const updateSettings = async (updates: UpdateSettingsRequest) => {
    if (status !== 'authenticated' || !session) {
      throw new Error('No autenticado');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar configuración');
      }

      const result = await response.json();
      
      // Refrescar los datos después de actualizar
      await fetchSettings();
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Exportar datos del usuario
  const exportUserData = async () => {
    if (status !== 'authenticated' || !session) {
      throw new Error('No autenticado');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'export_data' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al exportar datos');
      }

      const result = await response.json();
      
      // Crear y descargar archivo JSON
      const dataStr = JSON.stringify(result.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `firefly-data-export-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Resetear preferencias a valores por defecto
  const resetPreferences = async () => {
    if (status !== 'authenticated' || !session) {
      throw new Error('No autenticado');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reset_preferences' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al resetear preferencias');
      }

      const result = await response.json();
      
      // Refrescar los datos después de resetear
      await fetchSettings();
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cargar configuraciones cuando el usuario se autentica
  useEffect(() => {
    if (status === 'authenticated') {
      fetchSettings();
    }
  }, [status]);

  // Utilidades para formateo
  const formatCurrency = (amount: number) => {
    if (!settingsData) return `$${amount.toFixed(2)}`;
    
    const currency = settingsData.preferences.currency;
    const locale = settingsData.preferences.numberFormat;
    
    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
      }).format(amount);
    } catch {
      return `$${amount.toFixed(2)}`;
    }
  };

  const formatDate = (date: Date) => {
    if (!settingsData) return date.toLocaleDateString();
    
    const format = settingsData.preferences.dateFormat;
    const locale = settingsData.preferences.language === 'es' ? 'es-ES' : 'en-US';
    
    try {
      if (format === 'DD/MM/YYYY') {
        return date.toLocaleDateString('es-ES');
      } else if (format === 'MM/DD/YYYY') {
        return date.toLocaleDateString('en-US');
      } else {
        return date.toLocaleDateString(locale);
      }
    } catch {
      return date.toLocaleDateString();
    }
  };

  return {
    settingsData,
    loading,
    error,
    fetchSettings,
    updateSettings,
    exportUserData,
    resetPreferences,
    formatCurrency,
    formatDate,
    
    // Shortcuts para acceso rápido a configuraciones
    preferences: settingsData?.preferences,
    notifications: settingsData?.notifications,
    dashboard: settingsData?.dashboard,
    statistics: settingsData?.statistics,
    userInfo: settingsData?.user,
  };
}
