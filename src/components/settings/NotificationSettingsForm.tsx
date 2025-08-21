'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useSettings, UpdateSettingsRequest } from '@/hooks/use-settings';
import { Loader2, Bell, Mail, AlertCircle, Calendar } from 'lucide-react';

export function NotificationSettingsForm() {
  const { settingsData, loading, updateSettings } = useSettings();
  const [saving, setSaving] = useState(false);
  const [localNotifications, setLocalNotifications] = useState({
    email: settingsData?.notifications.email ?? true,
    browser: settingsData?.notifications.browser ?? true,
    billReminders: settingsData?.notifications.billReminders ?? true,
    budgetAlerts: settingsData?.notifications.budgetAlerts ?? true,
  });

  const handleSave = async () => {
    if (!settingsData) return;

    setSaving(true);
    try {
      const updates: UpdateSettingsRequest = {
        notifications: localNotifications,
      };

      await updateSettings(updates);
      toast.success('Configuración de notificaciones actualizada');
    } catch (error) {
      toast.error('Error al actualizar notificaciones');
      console.error('Error updating notifications:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading && !settingsData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notificaciones
        </CardTitle>
        <CardDescription>
          Configura cómo y cuándo recibir notificaciones
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notificaciones por email */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <Label>Notificaciones por Email</Label>
              <p className="text-sm text-muted-foreground">
                Recibir notificaciones importantes en tu correo electrónico
              </p>
            </div>
          </div>
          <Switch
            checked={localNotifications.email}
            onCheckedChange={(checked) => 
              setLocalNotifications({ ...localNotifications, email: checked })
            }
          />
        </div>

        {/* Notificaciones del navegador */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <Label>Notificaciones del Navegador</Label>
              <p className="text-sm text-muted-foreground">
                Mostrar notificaciones push en el navegador
              </p>
            </div>
          </div>
          <Switch
            checked={localNotifications.browser}
            onCheckedChange={(checked) => 
              setLocalNotifications({ ...localNotifications, browser: checked })
            }
          />
        </div>

        {/* Recordatorios de facturas */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <Label>Recordatorios de Facturas</Label>
              <p className="text-sm text-muted-foreground">
                Recibir recordatorios antes del vencimiento de facturas
              </p>
            </div>
          </div>
          <Switch
            checked={localNotifications.billReminders}
            onCheckedChange={(checked) => 
              setLocalNotifications({ ...localNotifications, billReminders: checked })
            }
          />
        </div>

        {/* Alertas de presupuesto */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <Label>Alertas de Presupuesto</Label>
              <p className="text-sm text-muted-foreground">
                Recibir alertas cuando te acerques a los límites del presupuesto
              </p>
            </div>
          </div>
          <Switch
            checked={localNotifications.budgetAlerts}
            onCheckedChange={(checked) => 
              setLocalNotifications({ ...localNotifications, budgetAlerts: checked })
            }
          />
        </div>

        {/* Información adicional */}
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Bell className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-900">
                Sobre las notificaciones
              </h4>
              <p className="mt-1 text-sm text-blue-700">
                Las notificaciones te ayudan a mantenerte al día con tus finanzas. 
                Puedes activar o desactivar cada tipo según tus preferencias.
                Las notificaciones del navegador requieren permisos adicionales.
              </p>
            </div>
          </div>
        </div>

        {/* Botón de guardar */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Guardar Cambios
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
