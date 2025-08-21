'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useSettings, UpdateSettingsRequest } from '@/hooks/use-settings';
import { Loader2, Palette, Globe, Calendar, DollarSign } from 'lucide-react';

export function GeneralSettingsForm() {
  const { settingsData, loading, updateSettings } = useSettings();
  const [saving, setSaving] = useState(false);
  const [localSettings, setLocalSettings] = useState({
    currency: settingsData?.preferences.currency || 'USD',
    language: settingsData?.preferences.language || 'es',
    dateFormat: settingsData?.preferences.dateFormat || 'DD/MM/YYYY',
    numberFormat: settingsData?.preferences.numberFormat || 'en-US',
    theme: settingsData?.preferences.theme || 'system',
  });

  const handleSave = async () => {
    if (!settingsData) return;

    setSaving(true);
    try {
      const updates: UpdateSettingsRequest = {
        currency: localSettings.currency,
        language: localSettings.language,
        dateFormat: localSettings.dateFormat,
        numberFormat: localSettings.numberFormat,
        theme: localSettings.theme as 'light' | 'dark' | 'system',
      };

      await updateSettings(updates);
      toast.success('Preferencias actualizadas exitosamente');
    } catch (error) {
      toast.error('Error al actualizar preferencias');
      console.error('Error updating preferences:', error);
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
          <Globe className="h-5 w-5" />
          Configuración General
        </CardTitle>
        <CardDescription>
          Personaliza la apariencia y el formato de la aplicación
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Moneda */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Moneda Principal
          </Label>
          <Select
            value={localSettings.currency}
            onValueChange={(value) => setLocalSettings({ ...localSettings, currency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">Dólar Estadounidense (USD)</SelectItem>
              <SelectItem value="EUR">Euro (EUR)</SelectItem>
              <SelectItem value="GBP">Libra Esterlina (GBP)</SelectItem>
              <SelectItem value="ARS">Peso Argentino (ARS)</SelectItem>
              <SelectItem value="MXN">Peso Mexicano (MXN)</SelectItem>
              <SelectItem value="COP">Peso Colombiano (COP)</SelectItem>
              <SelectItem value="CLP">Peso Chileno (CLP)</SelectItem>
              <SelectItem value="PEN">Sol Peruano (PEN)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Idioma */}
        <div className="space-y-2">
          <Label>Idioma</Label>
          <Select
            value={localSettings.language}
            onValueChange={(value) => setLocalSettings({ ...localSettings, language: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="pt">Português</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Formato de fecha */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Formato de Fecha
          </Label>
          <Select
            value={localSettings.dateFormat}
            onValueChange={(value) => setLocalSettings({ ...localSettings, dateFormat: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</SelectItem>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Formato numérico */}
        <div className="space-y-2">
          <Label>Formato Numérico</Label>
          <Select
            value={localSettings.numberFormat}
            onValueChange={(value) => setLocalSettings({ ...localSettings, numberFormat: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en-US">Inglés (1,234.56)</SelectItem>
              <SelectItem value="es-ES">Español (1.234,56)</SelectItem>
              <SelectItem value="de-DE">Alemán (1.234,56)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tema */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Tema de la Aplicación
          </Label>
          <Select
            value={localSettings.theme}
            onValueChange={(value: 'light' | 'dark' | 'system') => setLocalSettings({ ...localSettings, theme: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Claro</SelectItem>
              <SelectItem value="dark">Oscuro</SelectItem>
              <SelectItem value="system">Sistema</SelectItem>
            </SelectContent>
          </Select>
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
