'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useSettings, UpdateSettingsRequest } from '@/hooks/use-settings';
import { Loader2, Layout, Eye, Calendar, TrendingUp } from 'lucide-react';

export function DashboardSettingsForm() {
  const { settingsData, loading, updateSettings } = useSettings();
  const [saving, setSaving] = useState(false);
  const [localDashboard, setLocalDashboard] = useState({
    showAccountBalances: settingsData?.dashboard.showAccountBalances ?? true,
    showRecentTransactions: settingsData?.dashboard.showRecentTransactions ?? true,
    showUpcomingBills: settingsData?.dashboard.showUpcomingBills ?? true,
    defaultPeriod: settingsData?.dashboard.defaultPeriod || '30' as '7' | '30' | '90' | '365',
  });

  const handleSave = async () => {
    if (!settingsData) return;

    setSaving(true);
    try {
      const updates: UpdateSettingsRequest = {
        dashboard: localDashboard,
      };

      await updateSettings(updates);
      toast.success('Configuración del dashboard actualizada');
    } catch (error) {
      toast.error('Error al actualizar configuración del dashboard');
      console.error('Error updating dashboard settings:', error);
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
          <Layout className="h-5 w-5" />
          Configuración del Dashboard
        </CardTitle>
        <CardDescription>
          Personaliza qué información mostrar en tu página principal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mostrar balances de cuentas */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <Label>Mostrar Balances de Cuentas</Label>
              <p className="text-sm text-muted-foreground">
                Ver los saldos actuales de todas tus cuentas
              </p>
            </div>
          </div>
          <Switch
            checked={localDashboard.showAccountBalances}
            onCheckedChange={(checked) => 
              setLocalDashboard({ ...localDashboard, showAccountBalances: checked })
            }
          />
        </div>

        {/* Mostrar transacciones recientes */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <Label>Mostrar Transacciones Recientes</Label>
              <p className="text-sm text-muted-foreground">
                Ver las últimas transacciones registradas
              </p>
            </div>
          </div>
          <Switch
            checked={localDashboard.showRecentTransactions}
            onCheckedChange={(checked) => 
              setLocalDashboard({ ...localDashboard, showRecentTransactions: checked })
            }
          />
        </div>

        {/* Mostrar facturas próximas */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="space-y-1">
              <Label>Mostrar Facturas Próximas</Label>
              <p className="text-sm text-muted-foreground">
                Ver recordatorios de facturas por vencer
              </p>
            </div>
          </div>
          <Switch
            checked={localDashboard.showUpcomingBills}
            onCheckedChange={(checked) => 
              setLocalDashboard({ ...localDashboard, showUpcomingBills: checked })
            }
          />
        </div>

        {/* Período por defecto para reportes */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Período por Defecto para Reportes
          </Label>
          <Select
            value={localDashboard.defaultPeriod}
            onValueChange={(value: '7' | '30' | '90' | '365') => 
              setLocalDashboard({ ...localDashboard, defaultPeriod: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 días</SelectItem>
              <SelectItem value="30">Últimos 30 días</SelectItem>
              <SelectItem value="90">Últimos 3 meses</SelectItem>
              <SelectItem value="365">Último año</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Este será el período seleccionado por defecto al abrir los reportes
          </p>
        </div>

        {/* Vista previa de configuración */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Vista previa del Dashboard</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Balances de Cuentas</span>
              <span className={localDashboard.showAccountBalances ? 'text-green-600' : 'text-gray-400'}>
                {localDashboard.showAccountBalances ? 'Visible' : 'Oculto'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Transacciones Recientes</span>
              <span className={localDashboard.showRecentTransactions ? 'text-green-600' : 'text-gray-400'}>
                {localDashboard.showRecentTransactions ? 'Visible' : 'Oculto'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Facturas Próximas</span>
              <span className={localDashboard.showUpcomingBills ? 'text-green-600' : 'text-gray-400'}>
                {localDashboard.showUpcomingBills ? 'Visible' : 'Oculto'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Período por Defecto</span>
              <span className="text-blue-600">
                {localDashboard.defaultPeriod === '7' ? '7 días' : 
                 localDashboard.defaultPeriod === '30' ? '30 días' : 
                 localDashboard.defaultPeriod === '90' ? '3 meses' : '1 año'}
              </span>
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
